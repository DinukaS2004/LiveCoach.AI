const SessionNote = require('../models/SessionNote');
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

// Returns session dates
const getMySessionDates = async (req, res, next) => {
	try {
		// Fetch session notes from the database 
		const notes = await SessionNote.find({ ownerUserId: req.user._id })
			.select({ sessionDate: 1, noteDate: 1, createdAt: 1 })
			.lean(); //convert to plain JS objects

		// Build a deduplicated list of date keys for frontend highlighting.
		const dateKeys = [
			...new Set(
				notes
					.map((note) => toDateKey(note.sessionDate || note.noteDate || note.createdAt)) //convert data format to YYYY-MM-DD
					.filter(Boolean),
			),
		];

		return successResponse(res, 200, 'Progress data retrieved', {
			sessionDates: dateKeys,
			totalSessions: dateKeys.length,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getMySessionDates,
};
