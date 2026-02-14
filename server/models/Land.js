const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true, unique: true },
    totalAcreage: { type: Number, required: true },
    soilType: { type: String, required: true },
    irrigationType: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    locationName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Land', landSchema);
