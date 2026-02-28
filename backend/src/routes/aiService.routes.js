const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get available sports and shots
router.get('/sports',  aiController.getAvailableSports);

// Analyze technique
router.post(
  '/analyze/:sport/:shot',
  auth,
  upload.single('video'),
  aiController.analyzeTechnique
);

// Get analysis history
router.get('/history', auth, aiController.getAnalysisHistory);

// Get specific analysis
router.get('/analysis/:id', auth, aiController.getAnalysisById);

// Get progress for sport/shot
router.get('/progress/:sport/:shot', auth, aiController.getProgress);

// Health check
router.get('/health', aiController.checkAIServiceHealth);

module.exports = router;