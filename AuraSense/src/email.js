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
        default: 'sent'
    }
});

module.exports = mongoose.model('Email', EmailSchema);