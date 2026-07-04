// server.js - Simplified Version
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============================================
// LUMI API ROUTES
// ============================================

// Main analyze endpoint
app.post('/api/lumi/analyze', async (req, res) => {
    const { text } = req.body;
    
    console.log('Received text:', text);
    
    if (!text || text.trim().length < 2) {
        return res.json({
            success: false,
            status: "insufficient",
            message: "Please write more so I can understand you better.",
            showSurvey: true,
            actions: [
                { type: "survey", label: "Take Detailed Survey", icon: "fa-poll" },
                { type: "tips", label: "Writing Tips", icon: "fa-lightbulb" }
            ]
        });
    }
    
    try {
        // Python server এ request পাঠান
        const fetch = await import('node-fetch');
        const response = await fetch.default('http://127.0.0.1:5000/api/lumi/sentiment-v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.trim() })
        });
        
        const result = await response.json();
        console.log('Python response:', result);
        
        let actions = [];
        if (result.status === "severe") {
            actions = [
                { type: "expert", label: "Talk to an Expert", icon: "fa-user-md" },
                { type: "breathing", label: "Breathing Exercise", icon: "fa-spa" }
            ];
        } else if (result.status === "moderate") {
            actions = [
                { type: "survey", label: "Take the Survey", icon: "fa-poll" },
                { type: "meditation", label: "Try Meditation", icon: "fa-spa" }
            ];
        } else if (result.status === "insufficient") {
            actions = [
                { type: "survey", label: "Take Detailed Survey", icon: "fa-poll" },
                { type: "tips", label: "Writing Tips", icon: "fa-lightbulb" }
            ];
        } else {
            actions = [
                { type: "maintain", label: "Self-Care Tips", icon: "fa-heart" }
            ];
        }
        
        res.json({
            success: true,
            status: result.status || 'normal',
            message: result.message || "How are you feeling?",
            suggestion: result.suggestion || 'maintain',
            showSurvey: result.showSurvey || false,
            actions: actions
        });
        
    } catch (error) {
        console.error('AI Error:', error);
        res.json({
            success: false,
            status: "error",
            message: "I'm having trouble connecting. Please take our survey instead.",
            showSurvey: true,
            actions: [
                { type: "survey", label: "Take the Survey", icon: "fa-poll" },
                { type: "retry", label: "Try Again", icon: "fa-redo" }
            ]
        });
    }
});

// Survey analysis endpoint
app.post('/api/lumi/analyze-survey', async (req, res) => {
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default('http://127.0.0.1:5000/api/lumi/analyze-survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        const result = await response.json();
        res.json(result);
        
    } catch (error) {
        console.error('Survey Error:', error);
        res.json({
            success: false,
            message: "Error analyzing survey results"
        });
    }
});

// ============================================
// SERVE HTML FILES
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
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

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log('🚀 Lumi API is ready!');
});