// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require('child_process'); // AI পাইপলাইনের জন্য child_process যোগ করা হলো

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


// ========================================================
// 🧠 মডিউল ১: ইনস্ট্যান্ট টেক্সট অ্যানালাইসিস (TextBlob AI Part)
// ========================================================
app.post('/api/analyze-text', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ success: false, message: 'Text is required' });
    }

    // ব্যাকগ্রাউন্ডে পাইথন স্ক্রিপ্টটি রান করে টেক্সট পাঠানো হচ্ছে
    

    pythonProcess.stdout.on('data', (data) => {
        const polarityScore = parseFloat(data.toString().trim());
        let recommendation = "";
        let status = "";
        let severity = ""; // ফ্রন্টএন্ডে বর্ডার কালার বা স্টেট চেঞ্জ করার জন্য

        // TextBlob পোলারিটি লজিক ফিক্স (-1.0 থেকে +1.0 রেঞ্জ)
        if (polarityScore <= -0.6) {
            status = "Critical Distress";
            severity = "severe";
            recommendation = "🚨 Urgent: Your words indicate heavy emotional distress. We strongly suggest you to connect with our expert or contact a crisis helpline immediately.";
        } else if (polarityScore < 0 && polarityScore > -0.6) {
            status = "Mild Distress / Low Mood";
            severity = "minimal";
            recommendation = "🧘 It seems you are feeling a bit down. Take a short break, try deep breathing exercises, or practice a quick relaxation technique.";
        } else {
            status = "Neutral / Positive Mood";
            severity = "normal";
            recommendation = "✨ Your mood appears stable and balanced. Keep doing what makes you happy and maintain this positive energy!";
        }

        res.json({
            success: true,
            type: "text_only",
            score: polarityScore,
            status: status,
            severity: severity,
            recommendation: recommendation
        });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error("Python AI Error:", data.toString());
        res.status(500).json({ success: false, message: "AI process encounterd an error" });
    });
});


// ========================================================
// 📊 মডিউল ২: ক্লিনিক্যাল অ্যাসেসমেন্ট (Survey Part)
// ========================================================
app.post('/api/analyze-text', async (req, res) => {

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            success:false,
            message:"Text is required"
        });
    }

    try{

        const response = await fetch("http://127.0.0.1:5000/api/lumi/sentiment",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                text:text
            })

        });

        const ai = await response.json();

        let recommendation="";

        if(ai.status==="severe"){

            recommendation="🚨 Urgent: Please contact an expert immediately.";

        }

        else if(ai.status==="moderate"){

            recommendation="🧘 Take rest and practice relaxation.";

        }

        else{

            recommendation="✨ Your mood appears normal.";

        }

        res.json({

            success:true,

            score:ai.polarity,

            severity:ai.status,

            recommendation

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:"Flask AI server not running."

        });

    }

});

// ============ DELETE USER (Admin only) ============
app.delete('/api/auth/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { adminId } = req.query;
        
        console.log(`Delete request: userId=${userId}, adminId=${adminId}`);
        
        if (!adminId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin authentication required' 
            });
        }
        
        const User = mongoose.model('User');
        
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
        
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        if (userId === adminId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own admin account' 
            });
        }
        
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
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'homepage.html')); });
app.get('/homepage.html', (req, res) => { res.sendFile(path.join(__dirname, 'homepage.html')); });
app.get('/login.html', (req, res) => { res.sendFile(path.join(__dirname, 'login.html')); });
app.get('/createAcc.html', (req, res) => { res.sendFile(path.join(__dirname, 'createAcc.html')); });
app.get('/home.html', (req, res) => { res.sendFile(path.join(__dirname, 'home.html')); });
app.get('/reset.html', (req, res) => { res.sendFile(path.join(__dirname, 'reset.html')); });
app.get('/otp.html', (req, res) => { res.sendFile(path.join(__dirname, 'otp.html')); });
app.get('/new-pass.html', (req, res) => { res.sendFile(path.join(__dirname, 'new-pass.html')); });
app.get('/expert.html', (req, res) => { res.sendFile(path.join(__dirname, 'expert.html')); });
app.get('/booking.html', (req, res) => { res.sendFile(path.join(__dirname, 'booking.html')); });
app.get('/profile.html', (req, res) => { res.sendFile(path.join(__dirname, 'profile.html')); });
app.get('/admin-login.html', (req, res) => { res.sendFile(path.join(__dirname, 'admin-login.html')); });
app.get('/admin-view-users.html', (req, res) => { res.sendFile(path.join(__dirname, 'admin-view-users.html')); });
app.get('/admin-dashboard.html', (req, res) => { res.sendFile(path.join(__dirname, 'admin-dashboard.html')); });
app.get('/admin-settings.html', (req, res) => { res.sendFile(path.join(__dirname, 'admin-settings.html')); });
app.get('/notification.html', (req, res) => { res.sendFile(path.join(__dirname, 'notification.html')); });
app.get('/notifications.html', (req, res) => { res.sendFile(path.join(__dirname, 'notification.html')); });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log('🚀 AI Endpoints Initialized: /api/analyze-text & /api/analyze-survey');
});