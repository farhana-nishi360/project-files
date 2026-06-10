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