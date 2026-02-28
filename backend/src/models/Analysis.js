const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'badminton']
  },
  shot: {
    type: String,
    required: true
  },
  shotDisplayName: String,
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  performanceLevel: {
    type: String,
    enum: ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Elite']
  },
  distanceToExpert: Number,
  avgSimilarity: Number,
  maxSimilarity: Number,
  framesAnalyzed: Number,
  videoUrl: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

analysisSchema.index({ userId: 1, sport: 1, shot: 1, timestamp: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);