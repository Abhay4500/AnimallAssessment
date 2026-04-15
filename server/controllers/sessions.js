const mongoose = require('mongoose');
const Session = require('../models/Session');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const toSessionResponse = (session) => ({
    id: session._id.toString(),
    start_time: session.start_time,
    end_time: session.end_time,
    duration: session.duration,
    milk_quantity: session.milk_quantity,
    created_at: session.created_at,
    updated_at: session.updated_at
});

const calculateDurationSeconds = (startTime, endTime) => Math.max(
    1,
    Math.round((endTime.getTime() - startTime.getTime()) / 1000)
);

async function listSessions(req, res) {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(req.query.limit, 10) || DEFAULT_LIMIT));

    const filter = {};
    if (req.query.start_date || req.query.end_date) {
        filter.start_time = {};

        if (req.query.start_date) {
            filter.start_time.$gte = new Date(req.query.start_date);
        }

        if (req.query.end_date) {
            filter.start_time.$lte = new Date(req.query.end_date);
        }
    }

    const [sessions, total] = await Promise.all([
        Session.find(filter)
            .sort({ start_time: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Session.countDocuments(filter)
    ]);

    res.json({
        data: sessions.map(toSessionResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    });
}

async function getSessionById(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: {
                code: 'INVALID_SESSION_ID',
                message: 'Session id is not valid'
            }
        });
    }

    const session = await Session.findById(id);
    if (!session) {
        return res.status(404).json({
            error: {
                code: 'SESSION_NOT_FOUND',
                message: 'Session not found'
            }
        });
    }

    return res.json({ data: toSessionResponse(session) });
}

async function createSession(req, res) {
    const { start_time: startTimeRaw, end_time: endTimeRaw, milk_quantity: milkQuantityRaw } = req.body;

    const startTime = new Date(startTimeRaw);
    const endTime = new Date(endTimeRaw);
    const milkQuantity = Number(milkQuantityRaw);
    const duration = calculateDurationSeconds(startTime, endTime);

    const session = await Session.create({
        start_time: startTime,
        end_time: endTime,
        duration,
        milk_quantity: milkQuantity
    });

    return res.status(201).json({ data: toSessionResponse(session) });
}

async function getSessionStats(req, res) {
    const [summary] = await Session.aggregate([
        {
            $group: {
                _id: null,
                total_sessions: { $sum: 1 },
                total_milk_quantity: { $sum: '$milk_quantity' },
                average_milk_quantity: { $avg: '$milk_quantity' },
                average_duration: { $avg: '$duration' }
            }
        }
    ]);

    res.json({
        data: {
            total_sessions: summary?.total_sessions || 0,
            total_milk_quantity: summary?.total_milk_quantity || 0,
            average_milk_quantity: summary?.average_milk_quantity || 0,
            average_duration: summary?.average_duration || 0
        }
    });
}

module.exports = {
    createSession,
    getSessionById,
    getSessionStats,
    listSessions
};
