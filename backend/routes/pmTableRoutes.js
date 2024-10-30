const express = require('express');
const router = express.Router();
const MonthlyRanges = require('../models/pmTableModel');

// Get monthly ranges for all users (no admin check)
router.get('/', async (req, res) => {
    try {
        const ranges = await MonthlyRanges.findOne(); // Assuming only one document holds the ranges
        if (!ranges) {
            return res.status(404).json({ message: 'Monthly ranges not found' });
        }
        res.status(200).json(ranges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve monthly ranges' });
    }
});

// Update monthly ranges (no admin check)
router.post('/', async (req, res) => {
    const { ranges } = req.body; // Assume ranges are sent in the request body

    try {
        const updatedRanges = await MonthlyRanges.findOneAndUpdate(
            {}, // Empty query to find the first document
            { ranges },
            { new: true, upsert: true } // Create if it doesn't exist
        );

        res.status(200).json(updatedRanges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update monthly ranges' });
    }
});

module.exports = router;
