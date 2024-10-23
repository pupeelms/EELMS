const express = require('express');
const router = express.Router();
const borrowReturnController = require('../controllers/borrowReturnController');

// Borrow/Return routes

// Log a new transaction (borrow)
router.post('/log', borrowReturnController.logTransaction);

// Get all transaction logs
router.get('/', borrowReturnController.getTransactionLogs);

// Get a single transaction log by ID
router.get('/:id', borrowReturnController.getLogById);

// Get aggregated transaction data
router.get('/br/aggregated-transactions', borrowReturnController.getAggregatedTransactionData);

// Update a log by ID
router.put('/:id', borrowReturnController.updateLog);

// Delete a log by ID
router.delete('/:id', borrowReturnController.deleteLog);

// Get top borrowed items
router.get('/br/top-borrowed-items', borrowReturnController.getTopBorrowedItems);

// Extend borrowing duration by transaction ID
router.put('/:id/extend', borrowReturnController.extendBorrowingDuration);

// Define the GET route for feedback logs
router.get('/feedback/logs', borrowReturnController.getAllFeedbackLogs);

// Update feedback emoji for a transaction by transactionID
router.put('/feedback/:transactionID', borrowReturnController.updateFeedbackEmoji);


// Complete a return process
router.post('/complete-return', borrowReturnController.completeReturn);

// Submit reason for partial return
router.put('/partial-return/:transactionID', borrowReturnController.submitPartialReturnReason);

module.exports = router;
