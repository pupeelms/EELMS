/* This JavaScript code defines an asynchronous function `checkOverdueItems` that is responsible for
checking and processing overdue items in a borrowing and returning system. Here's a breakdown of
what the code does: */

const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const User = require('../models/UserModel'); 
const { createNotification } = require('../utils/notificationService');
const axios = require('axios'); 
const { sendEmail } = require('./emailService');

exports.checkOverdueItems = async () => {
    try {
        const overdueLogs = await BorrowReturnLog.find({
            returnStatus: { $in: ['Pending', 'Extended', 'Partially Returned'] }
        });

        const currentTime = new Date().getTime();
        console.log(`Current Time: ${new Date(currentTime).toLocaleString()}`);

        for (const log of overdueLogs) {
            const dueDate = new Date(log.dueDate).getTime();
            const dueMinuteStart = new Date(dueDate);
            dueMinuteStart.setSeconds(0); // Set seconds to 0 for the start of the due minute
            dueMinuteStart.setMilliseconds(0); // Ensure milliseconds are also 0

            // Log details
            console.log(`Processing Log ID: ${log._id} for borrower: ${log.userName}, Due Date: ${new Date(dueDate).toLocaleString()}`);

            // Check if the current time is within the notification window
            if (currentTime >= dueMinuteStart.getTime() && currentTime < dueDate) {
                console.log(`Log ID: ${log._id} is within the notification window. Sending notifications...`);

                // Update the return status to 'Overdue'
                log.returnStatus = 'Overdue';
                log.overdueEmailSent = true; // This should only be set after the email is sent successfully
                await log.save(); // Save the log update

                // Fetch user's email
                const user = await User.findById(log.userID);
                if (!user || !user.email) {
                    console.error(`User not found or email not available for user ID: ${log.userID}`);
                    continue; // Skip to the next log if user not found or no email
                }
                console.log(`User found: ${user.fullName} (Email: ${user.email}). Proceeding with email notification.`);

                // Send email notification
                const emailSubject = 'Reminder: Return Overdue Items';
                const emailBody = `Hi ${log.userName},\n\nYour borrowed item(s) are overdue. Please return them as soon as possible to avoid penalties.\n\nThank you,\nPUP EE LAB`;

                try {
                    await sendEmail(user.email, emailSubject, emailBody);
                    console.log(`Email sent successfully to ${user.fullName} (Email: ${user.email}) for overdue items.`);
                } catch (error) {
                    console.error(`Failed to send email to ${user.fullName} (Email: ${user.email}):`, error.message);
                    continue; // If email fails, skip to the next log
                }

                // Send notification to admin
                try {
                    await createNotification(
                        'Overdue Item',
                        `The item(s) borrowed by ${log.userName} are overdue.`,
                        log.userID
                    );
                    console.log(`Admin notification created for log ID: ${log._id}`);
                } catch (notificationError) {
                    console.error(`Failed to create notification for log ID: ${log._id}:`, notificationError.message);
                }
            } else {
                console.log(`Log ID: ${log._id} is not within the notification window. Skipping...`);
            }
        }
    } catch (error) {
        console.error('Error checking overdue items:', error.message);
    }
};
