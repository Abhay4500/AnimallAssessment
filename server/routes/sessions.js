const express = require('express');
const {
    createSession,
    getSessionById,
    getSessionStats,
    listSessions
} = require('../controllers/sessions');
const { validateSessionPayload } = require('../middleware/validateSession');

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

router.get('/', asyncHandler(listSessions));
router.get('/stats', asyncHandler(getSessionStats));
router.get('/:id', asyncHandler(getSessionById));
router.post('/', validateSessionPayload, asyncHandler(createSession));

module.exports = router;
