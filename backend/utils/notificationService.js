const Notification = require('../models/NotificationModel');
const mongoose = require('mongoose');

// Create a new notification
const createNotification = async (type, message, userId = null) => {
    try {
        const newNotification = new Notification({
            type,
            message,
            user: userId, // This could be null if it's a system-wide notification
            transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowReturnLog', default: null },
            date: new Date()
        });

        await newNotification.save();
        console.log('Notification created');
        return newNotification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        throw error;
    }
};

module.exports = {
    createNotification
};
