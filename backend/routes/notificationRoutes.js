const express = require('express');
const router = express.Router();
const Notification = require('../models/NotificationModel');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware'); // Importing auth middleware

router.use(authMiddleware);  // Protect all routes below

// Routes
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ date: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

router.get('/user/:userID', async (req, res) => {
    try {
        const notifications = await Notification.find({ userID: req.params.userID }).sort({ date: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

router.get('/:id', notificationController.getNotificationById);

router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
});

router.get('/notif/unread', async (req, res) => {
    try {
        const unreadNotifications = await Notification.find({ isRead: false }).sort({ date: -1 });
        res.json(unreadNotifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unread notifications', error: error.message });
    }
});

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
