const cron = require('node-cron');
const moment = require('moment');
const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const axios = require('axios'); // Import axios to send HTTP requests
const { sendReminderEmail } = require('./emailService'); // Import the email sending function

// Function to send SMS via external SMS gateway (Server B)
const sendSMSOnce = async (recipient, message) => {
  try {
    const smsRequestData = {
      number: recipient,
      message: message,
    };

    const response = await axios.post(`${process.env.GSMClientIP}`, smsRequestData);
    console.log(`SMS sent successfully to ${recipient}. Response: ${JSON.stringify(response.data)}`);
    
    return response.data;
  } catch (error) {
    console.error(`Failed to send SMS to ${recipient}: ${error.message}`);
    console.log(`Error details: ${JSON.stringify(error)}`);
    throw error;
  }
};

// Function to send both SMS and Email if the current time is within 5 minutes of the due date
const sendReminderIfDue = async (log) => {
  console.log(`Processing log ID: ${log._id}`);

  const dueDate = moment(log.dueDate);
  const now = moment();
  const fiveMinutesBeforeDue = dueDate.clone().subtract(5, 'minutes');

  // Check if we are within 5 minutes of the due date
  if (now.isBetween(fiveMinutesBeforeDue, dueDate)) {
    const user = log.userID;
    const smsMessage = `Hi ${user.fullName}, reminder to return borrowed item(s) by due date. To extend, inform us in the lab. Thank you!`;

    // Try sending the email first
    try {
      if (!log.emailSent) { // Check if email has already been sent
        console.log(`Sending reminder email to ${user.email}`);
        await sendReminderEmail(user, log.dueDate);
        log.emailSent = true; // Mark email as sent
      }
    } catch (error) {
      console.error(`Failed to send email to ${user.fullName}: ${error.message}`);
    }

    // Try sending the SMS
    try {
      if (!log.smsSent) { // Check if SMS has already been sent
        console.log(`Sending reminder SMS to ${user.fullName} (${user.contactNumber})`);
        await sendSMSOnce(user.contactNumber, smsMessage);
        log.smsSent = true; // Mark SMS as sent
      }
    } catch (error) {
      console.error(`Failed to send SMS to ${user.fullName}: ${error.message}`);
    }

    // Save the log after potentially updating email and SMS sent statuses
    await log.save();

    // Log the results of the reminders sent
    if (log.emailSent || log.smsSent) {
      console.log(`Reminder sent successfully to ${user.fullName} (${user.contactNumber}, ${user.email})`);
    } else {
      console.log(`No reminder sent for log ID: ${log._id}`);
    }
  } else {
    console.log(`Current time is not within 5 minutes of due date or reminder already sent for log ID: ${log._id}`);
  }
};

// Cron job to send reminders for pending and extended transactions
const startSmsReminderCron = () => {
  cron.schedule('* * * * *', async () => { // Runs every minute
    try {
      const logs = await BorrowReturnLog.find({
        returnStatus: { $in: ['Pending', 'Extended'] },
      }).populate('userID');

      for (const log of logs) {
        await sendReminderIfDue(log); // Send SMS and email reminders if due date is near
      }
    } catch (error) {
      console.error("Error while sending reminders:", error.message);
    }
  });

  console.log('Cron job for SMS and Email reminders has been started.');
};

module.exports = { startSmsReminderCron };
