const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const User = require('../models/UserModel'); 
const { createNotification } = require('../utils/notificationService');
const axios = require('axios'); 
const { sendEmail } = require('./emailService');

const MAX_EMAIL_RETRIES = 1; // Maximum attempts for sending email

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

                // Fetch the user's email using userID
                const user = await User.findById(log.userID);
                if (!user || !user.email) {
                    console.error(`User not found or email not available for user ID: ${log.userID}`);
                    continue; // Skip to the next log if user not found or no email
                }

                // Send email notification to the user with retry mechanism
                const emailSubject = 'Reminder: Return Overdue Items';
                const emailBody = `Hi ${log.userName},\n\nThis is a reminder that your borrowed item(s) are overdue. To avoid any potential penalties, please return them as soon as possible.\n\nWe appreciate your prompt attention to this matter!\n\nThank you,\nPUP EE LAB`;

                let emailSent = false;
                for (let attempt = 1; attempt <= MAX_EMAIL_RETRIES; attempt++) {
                    try {
                        await sendEmail(user.email, emailSubject, emailBody);
                        console.log(`Email successfully sent to ${user.fullName} (Email: ${user.email}) on attempt ${attempt}.`);
                        emailSent = true;
                        break; // Exit retry loop if email is sent successfully
                    } catch (error) {
                        console.error(`Attempt ${attempt} - Error sending email to ${user.userName} (Email: ${user.email}):`, error.message);
                        if (attempt === MAX_EMAIL_RETRIES) {
                            console.error(`Failed to send email to ${user.userName} after ${MAX_EMAIL_RETRIES} attempts.`);
                        }
                    }
                }

                // Notify admin regardless of email success
                await createNotification(
                    'Overdue Item',
                    `The item(s) borrowed by ${log.userName} are overdue.`,
                    log.userID 
                );
                console.log(`Notification sent for log ID: ${log._id}`);

                // Optionally send SMS (uncomment if needed)
                /*
                const smsMessage = `Hi ${log.userName}, your borrowed item(s) are overdue. Please return them as soon as possible. Thank you!`;
                const smsRequestData = {
                    number: log.contactNumber,
                    message: smsMessage
                };

                try {
                    const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData);
                    console.log('SMS request sent to Server B. Response:', smsResponse.data.message);
                } catch (error) {
                    console.error(`Error sending SMS to ${log.userName} (Contact: ${log.contactNumber}):`, error.message);
                }
                */
            } else {
                console.log(`Log ID: ${log._id} is not overdue. Skipping...`);
            }
        }
    } catch (error) {
        console.error('Error checking overdue items:', error.message);
    }
};
