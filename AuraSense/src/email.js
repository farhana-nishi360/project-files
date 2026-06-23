const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    toName: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    emailType: {
        type: String,
        default: 'appointment'
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['sent', 'draft', 'prepared'],
        default: 'prepared'
    }
});

module.exports = mongoose.model('Email', EmailSchema);


// Save to database instead of localStorage
async function saveEmailToDatabase(partnerName, partnerEmail, subject, body) {
    const userId = localStorage.getItem('userId');
    
    await fetch('/api/auth/save-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            to: partnerEmail,
            toName: partnerName,
            subject,
            body,
            sentAt: new Date().toISOString()
        })
    });
}