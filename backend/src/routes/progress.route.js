const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progress.controller');
const { verifyFirebaseToken, attachUser } = require('../middleware/auth');

// endpoint for current user's analysis-backed progress dates/list.
router.get(
	'/my-sessions',
	verifyFirebaseToken,
	attachUser,
	progressController.getMySessionDates
);

module.exports = router;
