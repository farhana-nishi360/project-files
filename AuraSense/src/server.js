// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Debug: Check if env loaded
console.log('Loading .env from:', path.join(__dirname, '.env'));
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

// ============ DELETE USER (Admin only) ============
app.delete('/api/auth/users/:userId', async (req, res) => {
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
        
        // 2. Get the User model from mongoose
        const User = mongoose.model('User');
        
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
        
        console.log(`User ${userId} deleted successfully by admin ${adminId}`);
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

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});

app.get('/homepage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/createAcc.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'createAcc.html'));
});

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/reset.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'reset.html'));
});

app.get('/otp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'otp.html'));
});

app.get('/new-pass.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'new-pass.html'));
});

app.get('/expert.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'expert.html'));
});

app.get('/booking.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-view-users.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-view-users.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin-settings.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-settings.html'));
});

// IMPORTANT: Add both routes for notification page
app.get('/notification.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'notification.html'));
});

app.get('/notifications.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'notification.html'));
});

// Start server - NO AUTO-OPEN BROWSER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log('');
    console.log('📄 Available pages:');
    console.log(`   - http://localhost:${PORT}/ (Splash Screen - homepage.html)`);
    console.log(`   - http://localhost:${PORT}/login.html (Login Page)`);
    console.log(`   - http://localhost:${PORT}/createAcc.html (Sign Up Page)`);
    console.log(`   - http://localhost:${PORT}/home.html (Main Home Page)`);
    console.log(`   - http://localhost:${PORT}/profile.html (Profile Page)`);
    console.log(`   - http://localhost:${PORT}/expert.html (Expert Consultation)`);
    console.log(`   - http://localhost:${PORT}/booking.html (Book Appointment)`);
    console.log(`   - http://localhost:${PORT}/admin-login.html (Admin Login)`);
    console.log(`   - http://localhost:${PORT}/notification.html (Notifications Page)`);
    console.log('');
});