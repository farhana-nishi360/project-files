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

// 2. MAILMAN (Transporter)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'farhananishi2025@gmail.com',
        pass: 'owsb dnwm yzcw vzwt' 
    }
});

// 3. ROUTES
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    mockUserDatabase.push({ name, email, password });
    console.log("Registered:", email);
    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = mockUserDatabase.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, name: user.name });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;
    console.log("Attempting OTP for:", email);

    const user = mockUserDatabase.find(u => u.email === email);
    
    if (!user) {
        console.log("❌ User not found in database. Did you register first?");
        return res.status(404).json({ success: false, message: "User not found" });
    }

    try {
        await transporter.sendMail({
    from: '"AuraSense" <farhananishi2025@gmail.com>', // MUST be your email
    to: email,
    subject: 'Your OTP Code',
    text: `Your code is: ${otp}`
});
       
        console.log("🚀 SUCCESS: OTP sent to:", email);
        res.json({ success: true });
    } catch (error) {
        console.error("🔥 MAIL ERROR:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => console.log('✅ AuraSense Server is LIVE on port 3000'));