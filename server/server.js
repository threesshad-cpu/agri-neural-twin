require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Land = require('./models/Land');
const Simulation = require('./models/Simulation');

// Utilities
const { calculateMarketRisk } = require('./utils/simulationEngine');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'agri-neural-secret-key-123';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agri-neural-twin')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. Authentication
app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Check user
        const user = await User.findOne({ userId });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

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
app.post('/api/profiles/setup', async (req, res) => {
    try {
        const { userId, totalAcreage, soilType, irrigationType, location, locationName } = req.body;

        // Validate if user exists (Optional: could use middleware to get userId from token)
        // For simplicity, we assume frontend sends the correct userId string

        // Upsert Land Data
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
app.post('/api/analyze-risk', (req, res) => {
    const { sowingDensity, weatherFactor, cropName, historicalAvgPrice } = req.body;

    const result = calculateMarketRisk({
        sowingDensity,
        weatherFactor,
        cropName,
        historicalAvgPrice
    });

    res.json(result);
});

// 4. Save Simulation
app.post('/api/simulations/save', async (req, res) => {
    try {
        const { userId, cropType, sowingDensity, weatherFactor, riskResult } = req.body;

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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Agri-Neural Backend running on port ${PORT}`);
});
