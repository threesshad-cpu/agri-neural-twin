require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Models
const User = require('./models/User');
const Land = require('./models/Land');
const Simulation = require('./models/Simulation');

// Utilities
const { calculateMarketRisk } = require('./utils/simulationEngine');

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET env var is not set. Refusing to start.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Allowed origins — tighten before production
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173').split(',');

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agri-neural-twin')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Auth middleware ---
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        req.user = jwt.verify(auth.slice(7), JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Simple in-memory rate limiter for auth endpoints
const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
    const key = req.ip;
    const now = Date.now();
    const record = loginAttempts.get(key) || { count: 0, resetAt: now + 60000 };
    if (now > record.resetAt) { record.count = 0; record.resetAt = now + 60_000; }
    record.count += 1;
    loginAttempts.set(key, record);
    if (record.count > 10) return res.status(429).json({ error: 'Too many requests. Try again later.' });
    next();
}

// --- ROUTES ---

// 1. Authentication
app.post('/api/auth/register', loginRateLimit, async (req, res) => {
    try {
        const { userId, password, role, district } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ userId });
        if (existingUser) return res.status(400).json({ message: 'User ID already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userId,
            password: hashedPassword,
            role: role || 'farmer',
            district: district || 'vellore'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', loginRateLimit, async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Check user
        const user = await User.findOne({ userId });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role, userId: user.userId }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                userId: user.userId,
                role: user.role,
                district: user.district
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Profile Setup (Land Registration)
app.post('/api/profiles/setup', requireAuth, async (req, res) => {
    try {
        const { totalAcreage, soilType, irrigationType, location, locationName } = req.body;
        const userId = req.user.userId; // taken from verified JWT, not body

        if (!Array.isArray(location) || location.length !== 2) {
            return res.status(400).json({ error: 'Invalid location format' });
        }

        const landData = await Land.findOneAndUpdate(
            { userId },
            {
                totalAcreage,
                soilType,
                irrigationType,
                location: { lat: location[0], lng: location[1] },
                locationName
            },
            { new: true, upsert: true }
        );

        res.json({ message: 'Land profile updated', land: landData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Risk Analysis (Intelligence Layer)
app.post('/api/analyze-risk', requireAuth, (req, res) => {
    const { sowingDensity, weatherFactor, cropName, historicalAvgPrice } = req.body;

    if (typeof sowingDensity !== 'number' || typeof weatherFactor !== 'number') {
        return res.status(400).json({ error: 'sowingDensity and weatherFactor must be numbers' });
    }
    if (typeof cropName !== 'string' || !cropName.trim()) {
        return res.status(400).json({ error: 'cropName is required' });
    }

    const result = calculateMarketRisk({
        sowingDensity,
        weatherFactor,
        cropName: cropName.trim().substring(0, 100),
        historicalAvgPrice,
    });

    res.json(result);
});

// 4. Save Simulation
app.post('/api/simulations/save', requireAuth, async (req, res) => {
    try {
        const { cropType, sowingDensity, weatherFactor, riskResult } = req.body;
        const userId = req.user.userId;

        const newSim = new Simulation({
            userId,
            inputs: { cropType, sowingDensity, weatherFactor },
            riskResult
        });

        await newSim.save();
        res.status(201).json({ message: 'Simulation saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. District Stats (Aggregation)
app.get('/api/districts/:name', async (req, res) => {
    try {
        const districtName = req.params.name.toLowerCase();

        // In a real app, we would aggregate data from Actual Land Sowing + Simulations
        // For now, we return mock aggregated data mixed with some real logic if available

        // Mock Aggregation
        const stats = {
            district: districtName,
            activeFarmers: await User.countDocuments({ district: districtName, role: 'farmer' }),
            totalAcreageRegistered: 1250, // Mock
            riskAlerts: await Simulation.countDocuments({ 'riskResult.riskLevel': 'High' })
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Razorpay Payment Verification
app.post('/api/payments/verify', (req, res) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ error: 'Razorpay key secret not configured' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id) {
        return res.status(400).json({ error: 'Missing razorpay_payment_id' });
    }

    // If no order_id/signature (e.g. direct UPI without order), allow but mark unverified
    if (!razorpay_order_id || !razorpay_signature) {
        return res.json({ verified: false, reason: 'no_order_signature' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    if (expected === razorpay_signature) {
        return res.json({ verified: true });
    }
    return res.status(400).json({ verified: false, reason: 'signature_mismatch' });
});

// 7. Gemini AI Proxy
app.post('/api/gemini/generate', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'Gemini API key not configured' });

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) }
        );
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Agri-Neural Backend running on port ${PORT}`);
});
