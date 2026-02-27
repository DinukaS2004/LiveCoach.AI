const AIService = require('../services/ai.service');
const Analysis = require('../models/Analysis');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');

exports.getAvailableSports = async (req, res) => {
  try {
    const sports = await AIService.getAvailableSports();
    
    // CORRECT: Return data in response body
    return res.status(200).json({
      success: true,
      message: 'Sports fetched successfully',
      data: sports, // <- Sports data goes here, not in status()
    });
  } catch (error) {
    console.error('[ERROR] Get sports error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sports',
    });
  }
};

exports.analyzeTechnique = async (req, res) => {
  const { sport, shot } = req.params;
  const videoFile = req.file;

  if (!videoFile) {
    return res.status(400).json({
      success: false,
      message: 'No video file provided',
    });
  }

  try {
    console.log(`[DEBUG] Analyzing ${sport}/${shot} `);
    
    // Call AI service
    const aiResult = await AIService.analyzeTechnique(
      videoFile.path,
      sport,
      shot
    );

    console.log('[DEBUG] AI analysis completed:', aiResult.overall_score);

    // Save to database
    const analysis = await Analysis.create({
      userId: req.user._id,
      sport: sport,
      shot: shot,
      shotDisplayName: aiResult.shot_display_name,
      score: aiResult.overall_score,
      performanceLevel: aiResult.performance_level,
      distanceToExpert: aiResult.distance_to_expert,
      avgSimilarity: aiResult.avg_similarity,
      maxSimilarity: aiResult.max_similarity,
      framesAnalyzed: aiResult.frames_analyzed,
      timestamp: new Date(),
    });

    // Clean up temp file
    fs.unlinkSync(videoFile.path);

    console.log('[DEBUG] Analysis saved to DB:', analysis._id);

    return res.status(200).json({
      success: true,
      message: 'Analysis completed successfully',
      data: {
        analysisId: analysis._id,
        ...aiResult,
      },
    });
  } catch (error) {
    console.error('[ERROR] Analysis error:', error);
    
    // Clean up on error
    if (videoFile && fs.existsSync(videoFile.path)) {
      try {
        fs.unlinkSync(videoFile.path);
      } catch (e) {
        console.error('[ERROR] Failed to delete temp file:', e);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Analysis failed',
    });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const { sport, shot, limit = 20 } = req.query;

    const query = { userId: req.user._id };
    if (sport) query.sport = sport;
    if (shot) query.shot = shot;

    const history = await Analysis.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'History fetched successfully',
      data: history,
    });
  } catch (error) {
    console.error('[ERROR] Get history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch history',
    });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Analysis fetched successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('[ERROR] Get analysis error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analysis',
    });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { sport, shot } = req.params;

    const analyses = await Analysis.find({
      userId: req.user._id,
      sport,
      shot,
    }).sort({ timestamp: 1 });

    const progress = {
      total: analyses.length,
      averageScore: analyses.length > 0
        ? analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
        : 0,
      latestScore: analyses.length > 0 ? analyses[analyses.length - 1].score : 0,
      improvement:
        analyses.length > 1
          ? analyses[analyses.length - 1].score - analyses[0].score
          : 0,
      history: analyses,
    };

    return res.status(200).json({
      success: true,
      message: 'Progress fetched successfully',
      data: progress,
    });
  } catch (error) {
    console.error('[ERROR] Get progress error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch progress',
    });
  }
};

exports.checkAIServiceHealth = async (req, res) => {
  try {
    const isHealthy = await AIService.checkHealth();
    
    return res.status(200).json({
      success: true,
      message: 'Health check completed',
      data: {
        nodeBackend: 'healthy',
        aiService: isHealthy ? 'healthy' : 'unavailable',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ERROR] Health check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Health check failed',
      data: {
        nodeBackend: 'healthy',
        aiService: 'unavailable',
        error: error.message,
      },
    });
  }
};