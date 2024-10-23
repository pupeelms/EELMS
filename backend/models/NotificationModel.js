const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false } // Field to track read/unread status
});

module.exports = mongoose.model('Notification', notificationSchema);
