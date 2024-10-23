const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); 

// Login route
router.post('/login', adminController.login);

// Logout route (protected by auth middleware)
router.post('/logout', authMiddleware,adminController.logout);

// Authentication check route to verify if the admin is logged in
router.get('/check', (req, res) => {
  if (req.session.adminId) {
    // If admin is authenticated, return a positive response
    return res.status(200).json({ isAuthenticated: true });
  } else {
    // If not authenticated, return false
    return res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;
