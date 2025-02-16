/* This JavaScript code defines a module that sets up a cron job using `node-cron` to send reminders
for pending and extended transactions. Here's a breakdown of what the code does: */

const cron = require('node-cron');
const moment = require('moment');
const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const axios = require('axios'); // Import axios to send HTTP requests
const { sendReminderEmail } = require('./emailService'); // Import the email sending function

// Function to send SMS via external SMS gateway (Server B)
// const sendSMSOnce = async (recipient, message) => {
//   try {
//     const smsRequestData = {
//       number: recipient,
//       message: message,
//     };

//     const response = await axios.post(`${process.env.GSMClientIP}`, smsRequestData);
//     console.log(`SMS sent successfully to ${recipient}. Response: ${JSON.stringify(response.data)}`);
    
//     return response.data;
//   } catch (error) {
//     console.error(`Failed to send SMS to ${recipient}: ${error.message}`);
//     console.log(`Error details: ${JSON.stringify(error)}`);
//     throw error;
//   }
// };

// Function to send both SMS and Email if the current time is within 5 minutes of the due date
const sendReminderIfDue = async (log) => {
  console.log(`Processing log ID: ${log._id}`);

  const dueDate = moment(log.dueDate);
  const now = moment();
  const fiveMinutesBeforeDue = dueDate.clone().subtract(5, 'minutes');

  // Check if we are within 5 minutes of the due date
  if (now.isBetween(fiveMinutesBeforeDue, dueDate)) {
    const user = log.userID;

    // Check if a reminder has already been sent
    if (!log.reminderSent) {
      // Send reminder email
      try {
        console.log(`Sending reminder email to ${user.email}`);
        await sendReminderEmail(user, log.dueDate);
        log.reminderSent = true; // Set reminderSent to true after sending
        await log.save(); // Save the updated log
      } catch (error) {
        console.error(`Failed to send email to ${user.fullName}: ${error.message}`);
      }

      // Send reminder SMS (commented out)
      /*
      const smsMessage = `Hi ${user.fullName}, reminder to return borrowed item(s) by due date. To extend, inform us in the lab. Thank you!`;
      try {
        console.log(`Sending reminder SMS to ${user.fullName} (${user.contactNumber})`);
        await sendSMSOnce(user.contactNumber, smsMessage);
      } catch (error) {
        console.error(`Failed to send SMS to ${user.fullName}: ${error.message}`);
      }
      */

      // Log the results of the reminders sent
      console.log(`Reminder email sent successfully to ${user.fullName} (${user.email}).`);
    } else {
      console.log(`Reminder already sent for log ID: ${log._id}`);
    }
  } else {
    console.log(`Current time is not within 5 minutes of due date for log ID: ${log._id}`);
  }
};

// Cron job to send reminders for pending and extended transactions
const startSmsReminderCron = () => {
  cron.schedule('* * * * *', async () => { // Runs every minute
    try {
      const logs = await BorrowReturnLog.find({
        returnStatus: { $in: ['Pending', 'Extended', 'Partially Returned'] },
      }).populate('userID');

      for (const log of logs) {
        await sendReminderIfDue(log); // Send email reminders if due date is near
      }
    } catch (error) {
      console.error("Error while sending reminders:", error.message);
    }
  });

  console.log('Cron job for Email reminders has been started.');
};

module.exports = { startSmsReminderCron };