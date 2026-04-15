const MAX_MILK_QUANTITY = 500;

function isValidDate(value) {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
}

function validateSessionPayload(req, res, next) {
    const { start_time: startTime, end_time: endTime, milk_quantity: milkQuantity } = req.body;

    if (!startTime || !endTime || milkQuantity == null) {
        return res.status(400).json({
            error: {
                code: 'MISSING_SESSION_DATA',
                message: 'start_time, end_time, and milk_quantity are required'
            }
        });
    }

    if (!isValidDate(startTime) || !isValidDate(endTime)) {
        return res.status(400).json({
            error: {
                code: 'INVALID_DATE',
                message: 'start_time and end_time must be valid ISO date strings'
            }
        });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end < start) {
        return res.status(400).json({
            error: {
                code: 'INVALID_TIME_RANGE',
                message: 'end_time must be greater than or equal to start_time'
            }
        });
    }

    const milk = Number(milkQuantity);
    if (!Number.isFinite(milk) || milk < 0 || milk > MAX_MILK_QUANTITY) {
        return res.status(400).json({
            error: {
                code: 'INVALID_MILK_QUANTITY',
                message: `milk_quantity must be between 0 and ${MAX_MILK_QUANTITY}`
            }
        });
    }

    return next();
}

module.exports = {
    validateSessionPayload
};
