const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // TN-FARM-XXXX or TN-OFF-XXXX
    password: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'officer'], required: true },
    district: { type: String, default: 'vellore' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
