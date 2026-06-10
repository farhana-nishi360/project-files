const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Task Schema
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
});

// Progress Report Schema
const ProgressReportSchema = new mongoose.Schema({
    weekStart: {
        type: Date,
        required: true
    },
    weekEnd: {
        type: Date,
        required: true
    },
    totalTasks: {
        type: Number,
        default: 0
    },
    completedTasks: {
        type: Number,
        default: 0
    },
    completionRate: {
        type: Number,
        default: 0
    },
    dailyBreakdown: {
        type: Map,
        of: Number,
        default: {}
    },
    streak: {
        type: Number,
        default: 0
    },
    insights: {
        type: String,
        default: ''
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetOTP: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    tasks: [TaskSchema],
    progressReports: [ProgressReportSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);