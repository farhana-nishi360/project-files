import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE
let mockUserDatabase = [
    { name: "Admin", email: "admin@aura.com", password: "123" }
];

// 2. OTP STORAGE (temporary)
let otpStorage = {};

// 3. MAILMAN (Transporter)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'farhananishi2025@gmail.com',
        pass: 'vvassihtzsyiwxto'
    }
});

// 4. ROUTES

// Signup
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = mockUserDatabase.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }
    
    mockUserDatabase.push({ name, email, password });
    console.log("✅ Registered:", email);
    res.json({ success: true, message: "Signup successful" });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = mockUserDatabase.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ success: true, name: user.name, email: user.email });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Send OTP
app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;
    console.log("📧 Attempting OTP for:", email);

    const user = mockUserDatabase.find(u => u.email === email);
    
    if (!user) {
        console.log("❌ User not found in database");
        return res.status(404).json({ success: false, message: "Email not registered" });
    }

    try {
        // Store OTP with expiration (5 minutes)
        otpStorage[email] = {
            otp: otp,
            expires: Date.now() + 300000 // 5 minutes
        };
        
        // Verify transporter connection
        await transporter.verify();
        console.log("✅ Transporter verified");
        
        await transporter.sendMail({
            from: '"AuraSense" <farhananishi2025@gmail.com>',
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 10px;">
                    <h2>AuraSense Password Reset</h2>
                    <p>Your OTP code is:</p>
                    <h1 style="font-size: 48px; letter-spacing: 10px; background: white; color: #764ba2; padding: 20px; text-align: center; border-radius: 10px;">${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        });
       
        console.log("🚀 OTP sent successfully to:", email);
        res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("🔥 MAIL ERROR:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    console.log("🔍 Verifying OTP for:", email);
    
    const storedOTP = otpStorage[email];
    
    if (!storedOTP) {
        console.log("❌ No OTP found for:", email);
        return res.status(400).json({ 
            success: false, 
            message: "No OTP found. Please request a new one." 
        });
    }
    
    if (Date.now() > storedOTP.expires) {
        delete otpStorage[email];
        console.log("⏰ OTP expired for:", email);
        return res.status(400).json({ 
            success: false, 
            message: "OTP expired. Please request a new one." 
        });
    }
    
    if (storedOTP.otp !== otp) {
        console.log("❌ Invalid OTP for:", email);
        return res.status(400).json({ 
            success: false, 
            message: "Invalid OTP" 
        });
    }
    
    // OTP is valid
    delete otpStorage[email];
    console.log("✅ OTP verified for:", email);
    res.json({ success: true, message: "OTP verified successfully" });
});

// Update Password
app.post('/update-password', (req, res) => {
    const { email, newPassword } = req.body;
    console.log("🔐 Updating password for:", email);
    
    const userIndex = mockUserDatabase.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        console.log("❌ User not found:", email);
        return res.status(404).json({ 
            success: false, 
            message: "User not found" 
        });
    }
    
    mockUserDatabase[userIndex].password = newPassword;
    console.log("✅ Password updated for:", email);
    console.log("📊 Current users:", mockUserDatabase);
    
    res.json({ success: true, message: "Password updated successfully" });
});

// Get all users (for debugging - remove in production)
app.get('/users', (req, res) => {
    res.json(mockUserDatabase.map(u => ({ name: u.name, email: u.email })));
});

app.listen(3000, () => {
    console.log('🚀 AuraSense Server is LIVE on port 3000');
    console.log('📧 Email configured for:', 'farhananishi2025@gmail.com');
});