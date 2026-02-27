// Main router file that combines all route modules and defines common routes

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const sessionNoteRoutes = require("./sessionNote.routes");

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use("/session-notes", sessionNoteRoutes);
module.exports = router;