const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // Added to store coach name in the gig
    location: { type: String, required: true },
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ['Daily', 'Weekly','Monthly', 'Yearly'], default: 'Monthly' },
    phone: { type: String },
    email: { type: String },
    sport: { type: String, enum: ['Cricket', 'Badminton'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);