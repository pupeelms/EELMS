const cron = require("node-cron");
const { createNotification } = require('./notificationService'); // Adjust as needed
const Item = require('../models/ItemModel');

// Function to start the cron job
const maintenanceScheduler = () => {
  cron.schedule("* 9 * * *", async () => {
    console.log("Cron job started: Checking for maintenance schedules...");

    try {
      const today = new Date();
      const weekNumber = getISOWeekNumber(today); // Get current week number
      const dayOfYear = getDayOfYear(today); // Get current day of the year
      console.log(`Current Week Number: ${weekNumber}, Day of Year: ${dayOfYear}`); // Log the current week number and day of year

      // Fetch items needing preventive maintenance
      const items = await Item.find({ pmNeeded: "Yes" });
      console.log(`Items needing maintenance: ${items.length}`); // Log the number of items found

      // Check each item for maintenance needs
      for (const item of items) {
        const maintenanceWeeks = getMaintenanceWeeks(item.pmFrequency);
        console.log(`Checking item: ${item.itemName}, Maintenance Weeks: ${maintenanceWeeks}`); // Log each item's maintenance weeks

        const lastNotified = item.lastNotified ? new Date(parseInt(item.lastNotified)) : null;

        // Daily Maintenance
        if (item.pmFrequency === "Daily") {
          if (!lastNotified || isDifferentDay(lastNotified, today)) {
            await createNotification('Preventive Maintenance Schedule', `Item: ${item.itemName} needs daily maintenance`);
            item.lastNotified = today.getTime(); // Store timestamp
            await item.save();
            console.log(`Daily maintenance notification sent for item: ${item.itemName} on ${today.toDateString()}`);
          }
        }
        // Annual Maintenance
        else if (item.pmFrequency === "Annually") {
          if (dayOfYear === 1 && (!lastNotified || lastNotified.getFullYear() !== today.getFullYear())) {
            await createNotification('Preventive Maintenance Schedule', `Item: ${item.itemName} needs annual maintenance`);
            item.lastNotified = today.getTime(); // Store timestamp
            await item.save();
            console.log(`Annual maintenance notification sent for item: ${item.itemName}`);
          }
        }
        // Weekly, Monthly, Quarterly Maintenance
        else if (maintenanceWeeks.includes(weekNumber) && (!lastNotified || getISOWeekNumber(lastNotified) !== weekNumber)) {
          await createNotification('Preventive Maintenance Schedule', `Item: ${item.itemName} needs scheduled maintenance`);
          item.lastNotified = today.getTime(); // Store timestamp
          await item.save();
          console.log(`Maintenance scheduled for item: ${item.itemName} on week number: ${weekNumber}`);
        }
      }
    } catch (err) {
      console.error("Error checking maintenance schedules:", err);
    }
  });
};

// Function to get the ISO week number
const getISOWeekNumber = (date) => {
  if (!(date instanceof Date)) return null; // Return null if date is not a Date object
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Function to get the current day of the year
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Helper function to calculate weeks based on PM frequency
const getMaintenanceWeeks = (pmFrequency) => {
  const maintenanceWeeks = [];

  switch (pmFrequency) {
    case "Annually":
      maintenanceWeeks.push(1); // Annual maintenance on week 1
      break;
    case "Quarterly":
      maintenanceWeeks.push(1, 14, 27, 40); // Quarterly maintenance weeks
      break;
    case "Monthly":
      for (let i = 1; i <= 12; i++) {
        maintenanceWeeks.push(i * 4); // Monthly maintenance on weeks 4, 8, 12, etc.
      }
      break;
    case "Weekly":
      for (let i = 1; i <= 52; i++) {
        maintenanceWeeks.push(i); // Weekly maintenance for every week
      }
      break;
    case "Daily":
      // Instead of pushing "Daily", we will check each day explicitly in the main loop
      break;
    default:
      console.log(`No valid PM frequency for item: ${pmFrequency}`);
      break;
  }

  return maintenanceWeeks;
};

// Helper function to check if two dates are on different days
const isDifferentDay = (date1, date2) => {
  return date1.toDateString() !== date2.toDateString();
};

// Export the maintenanceScheduler function
module.exports = { maintenanceScheduler };
