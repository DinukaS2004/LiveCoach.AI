// Session note routes for coach/athlete session note CRUD
const express = require('express');
const router = express.Router();

const sessionNoteController = require('../controllers/sessionNote.controller');
const { verifyFirebaseToken, attachUser } = require('../middleware/auth');

// Create a new session note
router.post(
    '/',
    verifyFirebaseToken,
    attachUser,
    sessionNoteController.create
);

// Get notes for current logged-in user
router.get(
    '/myNotes',
    verifyFirebaseToken,
    attachUser,
    sessionNoteController.listNotes
);

// Get a single session note by note ID
router.get(
    '/:id',
    verifyFirebaseToken,
    attachUser,
    sessionNoteController.getById
);

// Update a session note
router.put(
    '/:id',
    verifyFirebaseToken,
    attachUser,
    sessionNoteController.update
);

// Delete a session note
router.delete(
    '/:id',
    verifyFirebaseToken,
    attachUser,
    sessionNoteController.remove
);

module.exports = router;