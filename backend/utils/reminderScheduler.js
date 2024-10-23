const cron = require('node-cron');
const moment = require('moment');
const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const axios = require('axios'); // Import axios to send HTTP requests

// Function to send SMS via external SMS gateway (Server B)
const sendSMSOnce = async (recipient, message) => {
  try {
    // Prepare the SMS request data
    const smsRequestData = {
      number: recipient,
      message: message,
    };

    // Send the SMS request to Server B
    const response = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with Server B's IP or domain
    
    // Log the response after sending SMS
    console.log(`SMS sent successfully to ${recipient}. Response: ${JSON.stringify(response.data)}`);
    
    return response.data; // SMS sent successfully
  } catch (error) {
    // Log detailed error message if sending fails
    console.error(`Failed to send SMS to ${recipient}: ${error.message}`);
    console.log(`Error details: ${JSON.stringify(error)}`); // Log the full error object for more info
    throw error;
  }
};

// Function to check if the current time is within 5 minutes of the due date and send SMS
const sendReminderIfDue = async (log) => {
  console.log(`Processing log ID: ${log._id}`);

  const dueDate = moment(log.dueDate);
  const now = moment();
  const fiveMinutesBeforeDue = dueDate.clone().subtract(5, 'minutes');

  // Check if the current time is between 5 minutes before the due date and the due date itself,
  // and that the reminder has not been sent yet
  if (now.isBetween(fiveMinutesBeforeDue, dueDate) && !log.reminderSent) {
    const user = log.userID; // Assuming userID contains user information
    const smsMessage = `Hi ${user.fullName}, reminder to return borrowed item(s) by due date. To extend, inform us in the lab. Thank you!`;

    try {
      // Log that we are about to send the SMS
      console.log(`Sending reminder to ${user.fullName} (${user.contactNumber})`);

      // Send the SMS via the external gateway
      await sendSMSOnce(user.contactNumber, smsMessage);

      // Mark the reminder as sent by updating the log
      log.reminderSent = true;
      await log.save(); // Save the change to the database

      console.log(`SMS reminder sent to ${user.fullName} (${user.contactNumber})`);
    } catch (error) {
      console.error(`Failed to send SMS reminder to ${user.fullName}: ${error.message}`);
    }
  } else {
    console.log(`Current time is not within 5 minutes of due date or reminder already sent for log ID: ${log._id}`);
  }
};

// The simplified cron job to send SMS reminders for Pending and Extended transactions
const startSmsReminderCron = () => {
  cron.schedule('* * * * *', async () => { // Runs every minute
    try {
      // Fetch logs with returnStatus 'Pending' or 'Extended'
      const logs = await BorrowReturnLog.find({
        returnStatus: { $in: ['Pending', 'Extended'] },
      }).populate('userID'); // Assuming userID is a reference to the User model

      // Loop through all logs and send reminders if the due date is within the next 5 minutes
      for (const log of logs) {
        await sendReminderIfDue(log); // Check and send SMS if the due date is near
      }

    } catch (error) {
      console.error("Error while sending SMS reminders:", error.message);
    }
  });

  console.log('Cron job for SMS reminders has been started.');
};

module.exports = { startSmsReminderCron };
