const mongoose = require('mongoose');

const monthlyRangesSchema = new mongoose.Schema({
    ranges: {
        JAN: { start: Number, end: Number },
        FEB: { start: Number, end: Number },
        MAR: { start: Number, end: Number },
        APR: { start: Number, end: Number },
        MAY: { start: Number, end: Number },
        JUN: { start: Number, end: Number },
        JUL: { start: Number, end: Number },
        AUG: { start: Number, end: Number },
        SEP: { start: Number, end: Number },
        OCT: { start: Number, end: Number },
        NOV: { start: Number, end: Number },
        DEC: { start: Number, end: Number },
    },
});

// Export the model
module.exports = mongoose.model('MonthlyRanges', monthlyRangesSchema);
