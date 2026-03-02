const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gig.controller');
const { verifyFirebaseToken, attachUser, requireRole } = require('../middleware/auth');

// 1. Route for everyone to view gigs
router.get('/', gigController.getAllGigs);

// Add this line to your routes
router.put('/update', verifyFirebaseToken, attachUser, requireRole('coach'), gigController.updateGig);

// Add this line to your routes file
router.delete('/delete', verifyFirebaseToken, attachUser, requireRole('coach'), gigController.deleteGig);

// 2. Route for Coaches ONLY to create a new gig
router.post(
    '/create', 
    verifyFirebaseToken, 
    attachUser, 
    requireRole('coach'), 
    gigController.createGig
);

module.exports = router;