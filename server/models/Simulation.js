const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    inputs: {
        cropType: { type: String, required: true },
        sowingDensity: { type: Number, required: true },
        weatherFactor: { type: Number, required: true }
    },
    riskResult: {
        riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
        predictedPrice: { type: Number },
        recommendation: { type: String }
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Simulation', simulationSchema);
