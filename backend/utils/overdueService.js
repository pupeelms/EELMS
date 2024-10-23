const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const { createNotification } = require('../utils/notificationService');
const axios = require('axios'); // Import axios to send HTTP requests

exports.checkOverdueItems = async () => {
    try {
        // Get all pending or extended transactions that may be overdue
        const overdueLogs = await BorrowReturnLog.find({
            returnStatus: { $in: ['Pending', 'Extended', 'Partially Returned'] }
        });

        const currentTime = new Date().getTime();

        for (const log of overdueLogs) {
            const dueDate = new Date(log.dueDate).getTime();
            console.log(`Borrower: ${log.userName}, Due Date: ${new Date(dueDate).toLocaleString()}`);

            // Check if the current time is beyond the due date
            if (currentTime > dueDate) {
                console.log(`Log ID: ${log._id} is overdue. Marking as overdue...`);

                // Update the return status to overdue
                log.returnStatus = 'Overdue';
                await log.save();

                console.log(`Log ID: ${log._id} has been updated to Overdue.`);

                // Notify admin
                await createNotification(
                    'Overdue Item',
                    `The item(s) borrowed by ${log.userName} are overdue.`,
                    log.userID
                );

                console.log(`Notification sent for log ID: ${log._id}`);

                // Send SMS to user via Server B, informing them of the overdue status
                const smsMessage = `Hi ${log.userName}, your borrowed item(s) are overdue. Please return them as soon as possible. Thank you!`;

                // Prepare SMS request data
                const smsRequestData = {
                    number: log.contactNumber,
                    message: smsMessage
                };

                try {
                    // Send the SMS request to Server B
                    const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with the actual IP address of Server B
                    console.log('SMS request sent to Server B. Response:', smsResponse.data.message);
                } catch (error) {
                    console.error(`Error sending SMS to ${log.userName} (Contact: ${log.contactNumber}):`, error.message);
                }

                console.log(`SMS sent to ${log.userName} (Contact: ${log.contactNumber}) regarding overdue items.`);
            } else {
                console.log(`Log ID: ${log._id} is not overdue. Skipping...`);
            }
        }
    } catch (error) {
        console.error('Error checking overdue items:', error.message);
    }
};
