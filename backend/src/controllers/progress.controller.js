const Analysis = require('../models/Analysis');
const { successResponse } = require('../utils/response');

// format YYYY-MM-DD key for calendar matching.
const toDateKey = (value) => {
	const date = new Date(value);
	//checking the data is invalid 
	if (Number.isNaN(date.getTime())) return null;

	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};

// Returns calendar dates and grouped analyses for the current user.
const getMySessionDates = async (req, res, next) => {
	try {
		const analyses = await Analysis.find({ userId: req.user._id })
			.select({
				_id: 1,
				sport: 1,
				shot: 1,
				shotDisplayName: 1,
				score: 1,
				performanceLevel: 1,
				timestamp: 1,
			})
			.sort({ timestamp: -1 })
			.lean();

		const analysesByDate = {};

		for (const analysis of analyses) {
			const dateKey = toDateKey(analysis.timestamp);
			if (!dateKey) continue;

			if (!analysesByDate[dateKey]) analysesByDate[dateKey] = [];

			analysesByDate[dateKey].push({
				id: String(analysis._id),
				sport: analysis.sport,
				shot: analysis.shot,
				shotDisplayName: analysis.shotDisplayName,
				score: analysis.score,
				performanceLevel: analysis.performanceLevel,
				timestamp: analysis.timestamp,
			});
		}

		const dateKeys = Object.keys(analysesByDate).sort();

		return successResponse(res, 200, 'Progress data retrieved', {
			// Backward-compatible keys used by the current frontend.
			sessionDates: dateKeys,
			analysisDates: dateKeys,
			analysesByDate,
			totalSessions: dateKeys.length,
			totalAnalysisDays: dateKeys.length,
			totalAnalyses: analyses.length,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getMySessionDates,
};
