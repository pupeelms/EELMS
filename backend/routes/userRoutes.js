const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const borrowReturnController = require('../controllers/borrowReturnController');
const authMiddleware = require('../middleware/authMiddleware'); // Importing only auth middleware

// User routes
router.post('/create', userController.createUser); // Public route - no middleware

// Routes protected by authMiddleware (authenticated users only)
router.put('/approve/:userId', authMiddleware, userController.approveUser);
router.put('/decline/:userId', authMiddleware, userController.declineUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/transactions', borrowReturnController.getUserTransactions);
router.put('/:id', userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

// Route to count users awaiting approval (authenticated users only)
router.get('/pending/awaiting-approval-count', userController.countAwaitingApprovalUsers);

module.exports = router;
