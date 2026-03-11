const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        // Firebase User ID
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        // Email address
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // User role: 'athlete' | 'coach'
        role: {
            type: String,
            required: true,
            enum: ['athlete', 'coach'],
        },

        // First name
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        // Last name
        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: ["male", "female"],
            required: true,
            trim: true,
            lowercase: true,
        },

        // Profile picture URL
        profilePicture: {
            type: String,
            default: null,
        },

        // Account status
        isActive: {
            type: Boolean,
            default: true,
        },

        // Email verification status
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        // First time user flag
        isFirstTimeUser: {
            type: Boolean,
            default: true,
        },

        //Coach verification status
        coachVerificationStatus: {
            type: String,
            enum: ["none", "pending", "approved", "rejected"],
            default: "none",
        },
        coachVerificationSubmittedAt: { type: Date },

        // Authentication providers (email, google)
        authProviders: [{
            type: String,
            enum: ['email', 'google.com'],
        }],

        // Last login timestamp
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        discriminatorKey: 'role', // Enables inheritance for Athlete/Coach models
    }
);

// Faster queries
userSchema.index({ email: 1, role: 1 });

// Virtual field to get user's full role data
userSchema.virtual('roleData', {
    ref: function() {
        return this.role === 'athlete' ? 'Athlete' : 'Coach';
    },
    localField: 'firebaseUid',
    foreignField: 'firebaseUid',
    justOne: true,
});

// Don't return MongoDB's __v field
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        delete ret._id;
        return ret;
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;