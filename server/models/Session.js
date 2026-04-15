const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    milk_quantity: { type: Number, required: true, min: 0 }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

sessionSchema.index({ start_time: -1 });

sessionSchema.path('end_time').validate(function validateEndTime(value) {
    return value instanceof Date && this.start_time instanceof Date && value >= this.start_time;
}, 'End time must be greater than or equal to start time');

module.exports = mongoose.model('Session', sessionSchema);
