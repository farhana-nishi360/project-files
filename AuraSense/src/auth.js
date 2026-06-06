const express = require('express');
const router = express.Router();
const User = require('./user');  // Import from same folder
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }
        
        const user = new User({ name, email, password });
        await user.save();
        
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: { id: user._id, name: user.name, email: user.email }
        });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        user.lastLogin = new Date();
        await user.save();
        
        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

//Admin Login
router.post('/admin-login', async (req, res) => {
    console.log('Admin login attempt for:', req.body.email); // Debug log
    
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Check if admin - THIS IS THE KEY CHECK
        console.log('Is Admin:', user.isAdmin);
        
        if (!user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Not an admin account' });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Return success
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});
// Get all users (Admin only)
router.get('/users', async (req, res) => {
    try {
        const adminId = req.query.adminId;
        
        console.log('Users request with adminId:', adminId); // Debug log
        
        if (!adminId) {
            return res.status(401).json({ success: false, message: 'Admin ID required' });
        }
        
        const admin = await User.findById(adminId);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        
        console.log('Admin found:', admin.email, 'isAdmin:', admin.isAdmin);
        
        if (!admin.isAdmin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        
        const users = await User.find().select('-password');
        
        res.json({ success: true, users });
        
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email not found' 
            });
        }
        
        const otp = generateOTP();
        user.resetOTP = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60000);
        await user.save();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - AuraSense',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #513B56;">AuraSense Password Reset</h2>
                    <p>Your OTP for password reset is:</p>
                    <div style="background: #513B56; color: white; font-size: 32px; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 10px; font-weight: bold;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            message: 'OTP sent successfully'
        });
        
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send OTP' 
        });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email not found' 
            });
        }
        
        if (user.resetOTP !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired OTP' 
            });
        }
        
        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
        
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email not found' 
            });
        }
        
        user.password = newPassword;
        user.resetOTP = null;
        user.otpExpires = null;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;