const express = require('express');
const router = express.Router();
const User = require('./user');
const Email = require('./email');  // ← ADD THIS LINE
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

// Admin Login
router.post('/admin-login', async (req, res) => {
    console.log('Admin login attempt for:', req.body.email);
    
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        console.log('Is Admin:', user.isAdmin);
        
        if (!user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Not an admin account' });
        }
        
        user.lastLogin = new Date();
        await user.save();
        
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
        
        console.log('Users request with adminId:', adminId);
        
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

// ============ DELETE USER (Admin only) ============
router.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { adminId } = req.query;
        
        console.log(`Delete request: userId=${userId}, adminId=${adminId}`);
        
        // 1. Verify admin is authenticated
        if (!adminId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin authentication required' 
            });
        }
        
        // 2. Check if the admin exists and is actually an admin
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin not found' 
            });
        }
        
        if (!admin.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized: Admin privileges required' 
            });
        }
        
        // 3. Check if the user to delete exists
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // 4. Prevent admin from deleting themselves
        if (userId === adminId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own admin account' 
            });
        }
        
        // 5. Delete the user from database
        await User.findByIdAndDelete(userId);
        
        console.log(`User ${userId} (${userToDelete.email}) deleted successfully by admin ${adminId}`);
        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting user: ' + error.message 
        });
    }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user name
router.put('/update-name', async (req, res) => {
    try {
        const { userId, newName } = req.body;
        
        if (!userId || !newName) {
            return res.status(400).json({ success: false, message: 'User ID and new name required' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.name = newName;
        await user.save();
        
        res.json({ success: true, message: 'Name updated successfully', user: { name: user.name } });
        
    } catch (error) {
        console.error('Update name error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update password
router.put('/update-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();
        
        res.json({ success: true, message: 'Password updated successfully' });
        
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user's tasks
router.get('/tasks', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, tasks: user.tasks || [] });
        
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new task
router.post('/tasks/add', async (req, res) => {
    try {
        const { userId, title, priority } = req.body;
        
        if (!userId || !title) {
            return res.status(400).json({ success: false, message: 'User ID and task title required' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const newTask = {
            title: title,
            priority: priority || 'medium',
            completed: false,
            createdAt: new Date(),
            completedAt: null
        };
        
        user.tasks.push(newTask);
        await user.save();
        
        res.json({ success: true, task: newTask });
        
    } catch (error) {
        console.error('Add task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle task completion
router.put('/tasks/toggle/:taskId', async (req, res) => {
    try {
        const { userId } = req.body;
        const { taskId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const task = user.tasks.id(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : null;
        
        await user.save();
        
        // Generate weekly report after task completion
        await generateWeeklyReport(userId);
        
        res.json({ success: true, task: task });
        
    } catch (error) {
        console.error('Toggle task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete task
router.delete('/tasks/delete/:taskId', async (req, res) => {
    try {
        const { userId } = req.body;
        const { taskId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.tasks = user.tasks.filter(t => t._id.toString() !== taskId);
        await user.save();
        
        res.json({ success: true, message: 'Task deleted' });
        
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get progress reports
router.get('/progress-reports', async (req, res) => {
    try {
        const { userId } = req.query;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, reports: user.progressReports || [] });
        
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Generate weekly report
async function generateWeeklyReport(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) return;
        
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const weeklyTasks = user.tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
        
        const totalTasks = weeklyTasks.length;
        const completedTasks = weeklyTasks.filter(t => t.completed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const dailyBreakdown = new Map();
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => dailyBreakdown.set(day, 0));
        
        weeklyTasks.forEach(task => {
            if (task.completed && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                const dayIndex = completedDate.getDay();
                const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1];
                dailyBreakdown.set(dayName, (dailyBreakdown.get(dayName) || 0) + 1);
            }
        });
        
        let streak = 0;
        for (let i = days.length - 1; i >= 0; i--) {
            if ((dailyBreakdown.get(days[i]) || 0) > 0) {
                streak++;
            } else {
                break;
            }
        }
        
        let insight = '';
        if (completionRate === 0) {
            insight = "🌱 You're just getting started! Every journey begins with a single step.";
        } else if (completionRate < 30) {
            insight = "💪 Good start! You're making progress. Try to add one more task each day.";
        } else if (completionRate < 60) {
            insight = `🌟 Great work! You're maintaining a ${completionRate}% completion rate.`;
        } else if (completionRate < 80) {
            insight = `🎯 Excellent progress! With ${completionRate}% completion rate, you're building strong habits!`;
        } else {
            insight = `🏆 Outstanding achievement! ${completionRate}% completion rate is incredible!`;
        }
        
        if (streak >= 5) {
            insight += ` 🔥 Amazing ${streak}-day streak! You're on fire!`;
        } else if (streak >= 3) {
            insight += ` ✨ ${streak}-day streak! Consistency is key!`;
        }
        
        const report = {
            weekStart: startOfWeek,
            weekEnd: endOfWeek,
            totalTasks: totalTasks,
            completedTasks: completedTasks,
            completionRate: completionRate,
            dailyBreakdown: dailyBreakdown,
            streak: streak,
            insights: insight,
            generatedAt: new Date()
        };
        
        const existingReportIndex = user.progressReports.findIndex(r => {
            const reportStart = new Date(r.weekStart);
            return reportStart.toDateString() === startOfWeek.toDateString();
        });
        
        if (existingReportIndex !== -1) {
            user.progressReports[existingReportIndex] = report;
        } else {
            user.progressReports.push(report);
        }
        
        await user.save();
        
    } catch (error) {
        console.error('Generate report error:', error);
    }
}

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('Sending OTP to:', email);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email not found. Please register first.' 
            });
        }
        
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60000);
        
        user.resetOTP = otp;
        user.otpExpires = otpExpiry;
        await user.save();
        
        console.log('========================================');
        console.log(`🔐 OTP for ${email}: ${otp}`);
        console.log(`⏰ Expires at: ${otpExpiry}`);
        console.log('========================================');
        
        let emailSent = false;
        
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your-email@gmail.com') {
            try {
                const mailOptions = {
                    from: `"AuraSense" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Password Reset OTP - AuraSense',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                            <h2 style="color: #513B56;">AuraSense Password Reset</h2>
                            <p>You requested to reset your password. Here is your OTP:</p>
                            <div style="background: #513B56; color: white; font-size: 36px; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 10px; font-weight: bold;">
                                ${otp}
                            </div>
                            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                            <hr>
                            <p style="color: #888; font-size: 12px;">AuraSense - Your Mental Wellness Companion</p>
                        </div>
                    `
                };
                
                await transporter.sendMail(mailOptions);
                emailSent = true;
                console.log('✅ Email sent successfully to:', email);
            } catch (err) {
                console.error('Email sending failed:', err);
            }
        } else {
            console.log('⚠️ Email not configured. Please check your .env file');
        }
        
        res.json({
            success: true,
            message: emailSent ? 'OTP sent to your email!' : `OTP generated: ${otp}. (Check console)`,
            demoOtp: !emailSent ? otp : undefined
        });
        
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send OTP. Please try again.' 
        });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        console.log('Verifying OTP for:', email);
        console.log('Entered OTP:', otp);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log('Stored OTP:', user.resetOTP);
        console.log('OTP Expires:', user.otpExpires);
        console.log('Current time:', new Date());
        
        if (!user.resetOTP) {
            return res.status(400).json({ 
                success: false, 
                message: 'No OTP request found. Please request a new OTP.' 
            });
        }
        
        if (user.resetOTP !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP. Please try again.' 
            });
        }
        
        if (user.otpExpires < new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP has expired. Please request a new one.' 
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
            message: 'Server error. Please try again.' 
        });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        console.log('Resetting password for:', email);
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        user.password = newPassword;
        user.resetOTP = null;
        user.otpExpires = null;
        await user.save();
        
        console.log('Password updated successfully for:', email);
        
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

// ============ EMAIL HISTORY ROUTES (NEW - ADDED WITHOUT CHANGING ANYTHING ELSE) ============

// Save email to database
router.post('/save-email', async (req, res) => {
    try {
        const { userId, to, toName, subject, body, emailType, status } = req.body;
        
        if (!userId || !to || !subject || !body) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Create email object for Email collection
        const emailData = {
            user: user.name,
            userEmail: user.email,
            to: to,
            toName: toName || 'Recipient',
            subject: subject,
            body: body,
            emailType: emailType || 'appointment',
            status: status || 'sent'
        };
        
        // Save to Email collection
        const email = new Email(emailData);
        await email.save();
        
        // Also update user's embedded emailHistory
        if (!user.emailHistory) {
            user.emailHistory = [];
        }
        user.emailHistory.push({
            to: to,
            toName: toName || 'Recipient',
            subject: subject,
            body: body,
            sentAt: new Date(),
            status: status || 'sent'
        });
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Email saved successfully',
            email: email
        });
        
    } catch (error) {
        console.error('Save email error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get email history
router.get('/email-history', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID required' 
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Get emails from Email collection using userEmail
        const emails = await Email.find({ userEmail: user.email })
            .sort({ sentAt: -1 })
            .limit(100);
        
        res.json({ 
            success: true, 
            emails: emails 
        });
        
    } catch (error) {
        console.error('Get email history error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ============ DELETE USER (Admin only) ============
router.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { adminId } = req.query;
        
        console.log(`Delete request: userId=${userId}, adminId=${adminId}`);
        console.log('Type of userId:', typeof userId);
        console.log('userId value:', userId);
        
        // 1. Verify admin is authenticated
        if (!adminId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin authentication required' 
            });
        }
        
        // 2. Validate userId
        if (!userId || userId === 'undefined' || userId === 'null') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID provided' 
            });
        }
        
        // 3. Check if the admin exists and is actually an admin
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin not found' 
            });
        }
        
        if (!admin.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized: Admin privileges required' 
            });
        }
        
        // 4. Check if the user to delete exists
        try {
            const userToDelete = await User.findById(userId);
            if (!userToDelete) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            
            // 5. Prevent admin from deleting themselves
            if (userId === adminId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cannot delete your own admin account' 
                });
            }
            
            // 6. Delete the user from database
            await User.findByIdAndDelete(userId);
            
            console.log(`User ${userId} (${userToDelete.email}) deleted successfully by admin ${adminId}`);
            res.json({ 
                success: true, 
                message: 'User deleted successfully' 
            });
        } catch (err) {
            if (err.name === 'CastError') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid user ID format' 
                });
            }
            throw err;
        }
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting user: ' + error.message 
        });
    }
});
// ============ END OF EMAIL HISTORY ROUTES ============
// Update Profile
router.put('/update-profile', async (req, res) => {
    try {
        const { adminId, name, email } = req.body;
        
        const user = await User.findById(adminId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Check if email is already taken by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }
        
        user.name = name;
        user.email = email;
        await user.save();
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;