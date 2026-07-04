const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User Schema directly in this file (copying from your existing user.js)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date
});

const User = mongoose.model('User', userSchema);

async function setupAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aurasense');
        
        const adminEmail = 'admin@aurasense.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('Admin already exists:', existingAdmin.email);
            if (!existingAdmin.isAdmin) {
                existingAdmin.isAdmin = true;
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin!');
            }
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin123!', salt);
            
            const admin = new User({
                name: 'Administrator',
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true
            });
            await admin.save();
            console.log('✅ Admin created successfully!');
            console.log('📧 Email: admin@aurasense.com');
            console.log('🔑 Password: Admin123!');
            console.log('⚠️  Please change this password after first login!');
        }
        
        await mongoose.disconnect();
        console.log('✅ Setup complete!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

setupAdmin();