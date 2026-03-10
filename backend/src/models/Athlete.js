const mongoose = require('mongoose');
const User = require('./User');

const athleteSchema = new mongoose.Schema({
    // Sport
    sport: {
        type: String,
        required: true,
        trim: true,
    },

    // Age
    age: {
        type: Number,
        required: true,
        min: 5,
        max: 120,
    },

    weight: {
        value: {
            type: Number,
            required: true,
            min: 20,
            max: 200,
        },
        unit: {
            type: String,
            default: "kg",
        }
    },

    height: {
        value: {
            type: Number,
            required: true,
            min: 10,
            max: 250,
        },
        unit: {
            type: String,
            default: "cm",
        }
    },

    // Current coach (reference to Coach model)
    currentCoach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        default: null,
    },

    // Bio/Description
    bio: {
        type: String,
        maxlength: 500,
        default: '',
    },
});

// Create Athlete model as a discriminator of User
const Athlete = User.discriminator('Athlete', athleteSchema, 'athlete');

module.exports = Athlete;