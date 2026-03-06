const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progress.controller');
const { verifyFirebaseToken, attachUser } = require('../middleware/auth');

// Auth-protected endpoint for current user's progress-session dates.
router.get(
	'/my-sessions',
	verifyFirebaseToken,
	attachUser,
	progressController.getMySessionDates
);

module.exports = router;
