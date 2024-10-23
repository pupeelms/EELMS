const app = require('./app');
const cron = require('node-cron');
const { checkOverdueItems } = require('./utils/overdueService');
const { startSmsReminderCron } =  require('./utils/reminderScheduler');
const path = require('path');
const PORT = process.env.PORT || 4000; // Change to another available port


cron.schedule('* * * * *', checkOverdueItems);
console.log('Cron job for overdue items check is set up to run every minute.');

// Call to start the SMS reminder cron job
startSmsReminderCron();


const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling for unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);  // Logs just the error message
  console.error('Stack Trace:', err.stack);  // Logs the stack trace for debugging

  // Gracefully shut down the server
  server.close(() => {
    process.exit(1);
  });
});
