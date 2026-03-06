const mongoose = require('mongoose');
const User = require('./User');

const coachSchema = new mongoose.Schema({
    // Specialization
    specialization: [{
        type: String,
        required: true,
        trim: true,
    }],

    // Years of coaching experience
    yearsOfExperience: {
        type: Number,
        required: true,
        min: 0,
        max: 70,
    },

    // National Identity Card Number
    nic: {
        type: String,
        required: true,
        min: 10,
        max: 10,
    },

    // Bio/Description
    bio: {
        type: String,
        maxlength: 1000,
        default: '',
    },

    // Hourly rate (in USD or your currency)
    hourlyRate: {
        type: Number,
        min: 0,
        default: null,
    },

    // Availability status
    isAvailable: {
        type: Boolean,
        default: true,
    },

    // Rating
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },

    // Total number of ratings
    totalRatings: {
        type: Number,
        default: 0,
    },

    // Current athletes names
    currentAthletes: [{
        type: String,
        trim: true,
    }],

    // Maximum number of athletes can handle
    maxAthletes: {
        type: Number,
        default: 20,
    },
});

// Create Coach model as a discriminator of User
const Coach = User.discriminator('Coach', coachSchema, 'coach');

module.exports = Coach;