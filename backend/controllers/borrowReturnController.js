const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const User = require('../models/UserModel');
const Item = require('../models/ItemModel');
const { createNotification } = require('../utils/notificationService');
const { sendTransactionEmail, sendEmail } = require('../utils/emailService');
const axios = require('axios'); // Import axios to send HTTP requests

exports.logTransaction = async (req, res) => {
  try {
    const {
      userID,
      userName,
      contactNumber,
      items = [], // Expect an array of items {itemBarcode, quantity}
      courseSubject,
      professor,
      profAttendance,
      roomNo,
      borrowedDuration,
      transactionType,
      notesComments,
    } = req.body;

    // Find the user by ID
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only process borrowing transactions
    if (transactionType === 'Borrowed') {
      // Create a new log entry for borrowing items
      const borrowReturnLog = new BorrowReturnLog({
        userID: user._id,
        userName: user.fullName, // Assuming 'fullName' is the correct field in the User model
        contactNumber: user.contactNumber,
        items: [],
        courseSubject,
        professor,
        profAttendance,
        roomNo,
        borrowedDuration,
        transactionType: 'Borrowed',
        returnStatus: 'Pending',
        notesComments,
        dueDate: new Date(Date.now() + convertDurationToMillis(borrowedDuration)) // Calculate due date
      });

      // Prepare the log items array and update item quantities
      for (const item of items) {
        // Find the item by barcode
        const foundItem = await Item.findOne({ itemBarcode: item.itemBarcode });
        if (!foundItem) {
          return res.status(404).json({ message: `Item not found for barcode: ${item.itemBarcode}` });
        }

        // Check stock availability and update item quantity
        const updatedQuantity = foundItem.quantity - item.quantity;
        if (updatedQuantity < 0) {
          return res.status(400).json({ message: `Not enough stock for item: ${item.itemBarcode}` });
        }

        // Add the borrowed item to the log
        borrowReturnLog.items.push({
          itemBarcode: foundItem.itemBarcode,
          itemName: foundItem.itemName,
          quantityBorrowed: item.quantity,
          quantityReturned: 0 // Initialize as 0 for borrowed items
        });

        // Update the item quantity in the database
        await Item.findOneAndUpdate(
          { itemBarcode: item.itemBarcode },
          { quantity: updatedQuantity },
          { new: true }
        );

        // Notify admin if stock is low
        if (updatedQuantity <= 1) {
          await createNotification(
            'Low Stock',
            `The stock for item ${foundItem.itemName} (Barcode: ${foundItem.itemBarcode}) is low.`,
            null
          );
        }
      }

      // Save the transaction log
      await borrowReturnLog.save();

      // Send email of transaction details
      await sendTransactionEmail(user, borrowReturnLog.items, borrowReturnLog.dueDate);

      // Send admin notification about borrowing
      await createNotification(
        'New Borrowing',
        `User ${user.fullName} has borrowed items: ${items.map(item => item.itemName).join(", ")}. Please ensure they are returned by ${borrowReturnLog.dueDate.toLocaleString()}.`,
        null // You can specify a user/admin if necessary
      );

      // Send SMS notification for borrowing via Server B
      // const smsMessage = `Hi ${user.fullName}, please return the borrowed item(s) by ${borrowReturnLog.dueDate.toLocaleString()}. Details have been sent to your email. Thank you!`;
      // const smsRequestData = {
      //   number: user.contactNumber,
      //   message: smsMessage
      // };
      // console.log(user.contactNumber, smsMessage)

      // // Sending the SMS request to Server B
      // try {
      //   const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with Server B's IP address
      //   console.log('SMS request sent to Server B. Response:', smsResponse.data.message);
      // } catch (error) {
      //   console.error('Error sending SMS via Server B:', error);
      // }

      res.status(201).json({ message: "Borrowing transaction logged successfully", borrowReturnLog });
    } else {
      res.status(400).json({ message: "Invalid transaction type. Only 'Borrowed' transactions are allowed." });
    }
  } catch (error) {
    res.status(201).json({ message: "Error logging transaction", error: error.message });
  }
};


// Helper function to convert the borrowed duration to milliseconds
const convertDurationToMillis = (duration) => {
  const [value, unit] = duration.split(' ');
  const numValue = parseInt(value);

  switch (unit) {
    case 'hour':
    case 'hours':
    case 'hour/s':
      return numValue * 60 * 60 * 1000; // Convert to milliseconds
    case 'minute':
    case 'minutes':
    case 'minute/s':
      return numValue * 60 * 1000; // Convert to milliseconds
    case 'day':
    case 'days':
      case 'day/s':
      return numValue * 24 * 60 * 60 * 1000; // Convert to milliseconds
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

exports.completeReturn = async (req, res) => {
  try {
    const { pastTransactionID, userID, itemsReturned, feedbackEmoji } = req.body;

    console.log('Incoming return request:', req.body);

    // Find the borrow transaction that matches pastTransactionID and userID
    const borrowReturnLog = await BorrowReturnLog.findOne({
      _id: pastTransactionID,
      userID,
      transactionType: 'Borrowed',
    });

    if (!borrowReturnLog) {
      return res.status(404).json({ message: "Borrow transaction not found." });
    }

    // Filter items based on whether they haven't been fully returned yet
    const itemsToProcess = borrowReturnLog.items.filter(item => {
      return (
        itemsReturned.some(returnedItem => returnedItem.itemBarcode === item.itemBarcode) &&
        item.quantityReturned < item.quantityBorrowed // Only process items that haven't been fully returned
      );
    });

    // If no items are left to process
    if (itemsToProcess.length === 0) {
      return res.status(400).json({
        message: "All selected items have already been fully returned or no items are eligible for return.",
      });
    }

    // Loop through each item being returned and update the return quantity
    for (const logItem of itemsToProcess) {
      const returnedItem = itemsReturned.find(returned => returned.itemBarcode === logItem.itemBarcode);

      if (returnedItem) {
        // Calculate how much can still be returned
        const remainingToReturn = logItem.quantityBorrowed - logItem.quantityReturned; // What's left to return
        const returnQuantity = Math.min(returnedItem.quantity, remainingToReturn); // Determine the actual quantity to return

        // Reset quantityReturned for this transaction to reflect only the current return
        logItem.quantityReturned += returnQuantity; // Increment by the amount returned this time

        // Log to verify correct quantity update
        console.log(`Item ${logItem.itemBarcode} updated quantityReturned: ${logItem.quantityReturned} / ${logItem.quantityBorrowed}`);

        // Log the item condition
        logItem.condition = returnedItem.condition || 'Unknown'; // Store the condition

        // If quantityReturned equals quantityBorrowed, mark the item as fully returned
        if (logItem.quantityReturned === logItem.quantityBorrowed) {
          logItem.returnStatus = 'Completed';
        }

        // Update the stock quantity in the Item model
        const foundItem = await Item.findOne({ itemBarcode: logItem.itemBarcode });
        if (!foundItem) {
          return res.status(404).json({ message: `Item with barcode ${logItem.itemBarcode} not found in the database.` });
        }

        // Update the item's stock quantity by adding the returnQuantity
        const updatedQuantity = foundItem.quantity + returnQuantity; // Update stock quantity

        try {
          // Update the item quantity in the database
          await Item.findOneAndUpdate(
            { itemBarcode: logItem.itemBarcode },
            { quantity: updatedQuantity },
            { new: true }
          );
        } catch (err) {
          console.error("Error updating item quantity:", err);
          return res.status(500).json({ message: "Error updating item quantity", error: err.message });
        }
      }
    }

    // Set return date and time to the current date
    borrowReturnLog.returnDate = new Date();

    // Check if all items in the transaction have been returned
    const allItemsReturned = borrowReturnLog.items.every(
      item => item.quantityBorrowed === item.quantityReturned
    );

    console.log(`All items returned? ${allItemsReturned}`);

    // Update the return status based on whether all items are returned
    if (allItemsReturned) {
      borrowReturnLog.returnStatus = "Completed";
      borrowReturnLog.transactionType = "Returned";
    } else {
      // Check for partially returned items
      const anyPartiallyReturned = borrowReturnLog.items.some(item => item.returnStatus !== 'Completed');
      
      if (anyPartiallyReturned) {
        borrowReturnLog.returnStatus = "Partially Returned";
      }
    }

    // Save the feedback emoji if provided
    if (feedbackEmoji) {
      borrowReturnLog.feedbackEmoji = feedbackEmoji;
    }

    try {
      // Save the updated transaction log
      await borrowReturnLog.save();
    } catch (err) {
      console.error("Error saving borrowReturnLog:", err);
      return res.status(500).json({ message: "Error saving transaction log", error: err.message });
    }

    // Send notification about the return process
    await createNotification(
      allItemsReturned ? 'Items Fully Returned' : 'Items Partially Returned',
      allItemsReturned
        ? `User ${borrowReturnLog.userName} has successfully returned all items: ${borrowReturnLog.items
            .map((item) => item.itemName)
            .join(", ")}.`
        : `User ${borrowReturnLog.userName} has partially returned items: ${itemsToProcess
            .map((item) => item.itemName)
            .join(", ")}. Please ensure the remaining items are returned.`,
      null // Specify recipient if needed (e.g., admin ID)
    );

    // Retrieve the user information
    const user = await User.findById(borrowReturnLog.userID); // Ensure borrowReturnLog.userID is a valid ObjectId
    console.log('Retrieved User:', user);

    // Ensure user.email exists and is defined
    if (!user || !user.email) {
      console.error("User not found or email not available.");
      return res.status(404).json({ message: "User not found or email not available." });
    }

    // New email sending logic
    const emailSubject = allItemsReturned ? "Return Process Completed" : "Return Process Partially Completed";
    const emailBody = allItemsReturned
      ? `Dear ${borrowReturnLog.userName},\n\nYour return process has been completed successfully. Thank you for returning the following item(s):\n\n${itemsToProcess.map(item => `- ${item.itemName} (Quantity Returned: ${item.quantityReturned})`).join("\n")}\n\nWe value your feedback. Please take a moment to fill out this survey and let us know about your experience:\nhttps://forms.gle/ouxAmFz3ZyrsCEqy5\n\nThank you,\nPUP EE LAB`
      : `Dear ${borrowReturnLog.userName},\n\nYour return process is partially completed. You have successfully returned the following item(s):\n\n${itemsToProcess.map(item => `- ${item.itemName} (Quantity Returned: ${item.quantityReturned})`).join("\n")}\n\nPlease remember to return the remaining item(s) as soon as possible.\n\nIf you have any questions, feel free to reach out.\n\nThank you,\nPUP EE LAB`;

    try {
      await sendEmail(user.email, emailSubject, emailBody); // Pass the actual email
    } catch (error) {
      console.error("Error sending return email:", error);
      return res.status(500).json({ message: "Error sending return email", error: error.message });
    }

    // Send SMS notification via Server B
    // const smsMessage = allItemsReturned
    //   ? `Hi ${borrowReturnLog.userName}, your return process has been completed successfully. Thank you!`
    //   : `Hi ${borrowReturnLog.userName}, your return process is partially completed. Please return the remaining item(s) as soon as possible.`;

    // const smsRequestData = {
    //   number: borrowReturnLog.contactNumber,
    //   message: smsMessage
    // };

    // try {
    //   // Send the SMS request to Server B
    //   const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with Server B's IP address
    //   console.log('SMS request sent to Server B. Response:', smsResponse.data.message);
    // } catch (err) {
    //   console.error("Error sending SMS via Server B:", err);
    // }

    res.status(200).json({
      success: true,
      message: "Return process completed.",
      returnStatus: borrowReturnLog.returnStatus,
    });
  } catch (error) {
    console.error("Error completing return process:", error);
    res.status(200).json({
      message: "Error completing return process",
      error: error.message,
    });
  }
};



// Get transaction logs
exports.getTransactionLogs = async (req, res) => {
  try {
    const logs = await BorrowReturnLog.find().populate('userID').sort({ dateTime: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error.message);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

// Get transactions by user ID
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await BorrowReturnLog.find({ userID: req.params.id });
    if (!transactions) {
      return res.status(404).json({ message: 'No transactions found for this user' });
    }
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get transactions by item barcode
exports.getItemTransactions = async (req, res) => {
  try {
    const itemBarcode = req.params.itemBarcode;
    
    // Ensure itemBarcode is properly sanitized/validated as needed
    if (!itemBarcode) {
      return res.status(400).json({ message: 'Item barcode is required' });
    }

    // Find logs where any item's barcode matches the provided itemBarcode
    const logs = await BorrowReturnLog.find({ 'items.itemBarcode': itemBarcode });

    if (logs.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this item barcode' });
    }

    res.json(logs);
  } catch (error) {
    console.error('Error fetching item transactions:', error);
    res.status(500).json({ message: 'Error fetching item transactions', error: error.message });
  } 
};


// Get all logs
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await BorrowReturnLog.find();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a log by ID
exports.getLogById = async (req, res) => {
  try {
    const log = await BorrowReturnLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLog = async (req, res) => {
  const { userID, items: newItems } = req.body; // Ensure userID and newItems are passed in the request body

  // Find the user by ID
  const user = await User.findById(userID);
  if (!user) {
    return res.status(404).json({ message: "User  not found" });
  }

  try {
    if (!newItems || !Array.isArray(newItems)) {
      return res.status(400).json({ message: 'Invalid or missing items array' });
    }

    // Find the log by ID
    const log = await BorrowReturnLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // Loop through the new items
    for (const newItem of newItems) {
      const existingItem = log.items.find(item => item.itemBarcode === newItem.itemBarcode);
      const foundItem = await Item.findOne({ itemBarcode: newItem.itemBarcode });

      if (!foundItem) {
        return res.status(404).json({ message: `Item not found in the database: ${newItem.itemBarcode}` });
      }

      const updatedQuantity = foundItem.quantity - newItem.quantity;
      if (updatedQuantity < 0) {
        return res.status(400).json({ message: `Not enough stock for item: ${newItem.itemBarcode}` });
      }

      if (existingItem) {
        existingItem.quantityBorrowed += newItem.quantity;
      } else {
        log.items.push({
          itemBarcode: newItem.itemBarcode,
          itemName: newItem.itemName,
          quantityBorrowed: newItem.quantity,
          quantityReturned: 0,
        });
      }

      await Item.findOneAndUpdate(
        { itemBarcode: newItem.itemBarcode },
        { quantity: updatedQuantity },
        { new: true }
      );
    }

    await log.save();

    // Send admin notification about borrowing
    await createNotification(
      'New Borrowed Item Added',
      `User  ${user.fullName} has updated borrowed items: ${newItems.map(item => item.itemName).join(", ")}. Please ensure they are returned by due date.`,
      null // You can specify a user/admin if necessary
    );

   // Prepare email details
    const itemDetails = newItems.map(item => `${item.itemName} (Quantity: ${item.quantity})`).join("\n"); // Create a list of item names and quantities
    const emailSubject = "New Borrowed Items Added to Your Transaction";

    // Create the email body
    const emailBody = `Hi ${user.fullName},\n\nThe following items have been successfully added to your existing borrowing transaction:\n\n${itemDetails}\n\nPlease remember to return the items by the due date. If you have any questions or need further assistance, feel free to reach out.\n\nThank you,\nPUP EE LAB`;

    try {
      // Send the email to the user about the new borrowed items
      await sendEmail(user.email, emailSubject, emailBody); // Pass the user's email, subject, and body
      
      console.log('New borrowed items email sent successfully');
    } catch (error) {
      console.error('Error sending new borrowed items email:', error);
      return res.status(500).json({ message: "Error sending email about new borrowed items", error: error.message });
    }

    res.status(200).json({ message: 'Items updated successfully', log });
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ error: error.message });
  }
};


// Delete a log by ID
exports.deleteLog = async (req, res) => {
  try {
    const log = await BorrowReturnLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.status(200).json({ message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAggregatedTransactionData = async (req, res) => {
  try {
    // Aggregate data to sum quantities by date
    const data = await BorrowReturnLog.aggregate([
      {
        $project: {
          dateTime: { $dateToString: { format: "%Y-%m-%d", date: "$dateTime" } },
          items: 1
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: { date: "$dateTime" },
          totalBorrowed: { $sum: "$items.quantityBorrowed" },
          totalReturned: { $sum: "$items.quantityReturned" }
        }
      },
      { $sort: { _id: 1 } } // Sort by date
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching aggregated data:', error.message);
    res.status(500).json({ message: 'Error fetching aggregated data', error: error.message });
  }
};

exports.extendBorrowingDuration = async (req, res) => {
  try {
    const { borrowedDuration } = req.body; // New extension duration
    const logId = req.params.id;

    // Validate input
    if (!logId || !borrowedDuration) {
      return res.status(400).json({ message: 'Log ID and new duration are required' });
    }

    // Find the log entry and populate user details
    const borrowReturnLog = await BorrowReturnLog.findById(logId).populate('userID');
    if (!borrowReturnLog) {
      return res.status(404).json({ message: 'Borrow/Return log not found' });
    }

    // Check if the current status is "Overdue"
    if (borrowReturnLog.returnStatus !== 'Overdue') {
      return res.status(400).json({ message: 'Only overdue transactions can be extended' });
    }

// Convert duration to milliseconds
    const newExtensionMillis = convertDurationToMillis(borrowedDuration);
    const currentDate = new Date();
    const extendedDueDate = new Date(currentDate.getTime() + newExtensionMillis);

    // Ensure extendedDuration is a number, initialize if necessary
    if (typeof borrowReturnLog.extendedDuration !== 'number') {
      borrowReturnLog.extendedDuration = 0; // Initialize with 0 if no extension has been done yet
    }

    // Log current extended duration before updating
    console.log(`Current Extended Duration: ${borrowReturnLog.extendedDuration} milliseconds`);

    // Update the extended duration by adding the new extension (in milliseconds)
    const updatedDuration = borrowReturnLog.extendedDuration + newExtensionMillis;
    borrowReturnLog.extendedDuration = updatedDuration;

    // Update the due date
    borrowReturnLog.dueDate = extendedDueDate; // Update the due date

    // Update return status to "Extended"
    borrowReturnLog.returnStatus = "Extended";
    borrowReturnLog.markModified('returnStatus');

    // Log the total extended duration in minutes for readability
    const totalExtendedMinutes = Math.floor(borrowReturnLog.extendedDuration / 60000); // Convert to minutes for logging
    console.log(`Total Extended Duration: ${totalExtendedMinutes} minutes`);
    console.log(`New Due Date: ${extendedDueDate.toLocaleString()}`);

    // Reset reminderSent to false
    borrowReturnLog.reminderSent = false;

    borrowReturnLog.overdueEmailSent = false;

    // Save the updated log
    await borrowReturnLog.save();

    // Send email notification
    const user = borrowReturnLog.userID; // User information is already populated

    // Ensure user.email exists and is defined
    if (!user || !user.email) {
      console.error("User not found or email not available.");
      return res.status(404).json({ message: "User not found or email not available." });
    }

    // Create email subject and body
    const emailSubject = "Borrowing Duration Extended";
    const emailBody = `Hi ${user.fullName},\n\nYour borrowing duration has been successfully extended until ${extendedDueDate.toLocaleString()}.\n\nPlease note that you can only extend the borrowing duration once. We kindly ask you to return the item(s) after this extension.\n\nIf you have any questions, feel free to reach out.\n\nThank you,\nPUP EE LAB`;

    try {
      await sendEmail(user.email, emailSubject, emailBody); // Pass the user's email
    } catch (error) {
      console.error("Error sending extension email:", error);
      return res.status(500).json({ message: "Error sending extension email", error: error.message });
    }

     
    // Notify user about the extension via SMS (via Server B)
    // const smsMessage = `Hello ${borrowReturnLog.userID.fullName}, your borrowing duration has been extended until ${extendedDueDate.toLocaleString()}.`;
    // const userContactNumber = borrowReturnLog.userID.contactNumber;

    // // Send the SMS request to Server B
    // const smsRequestData = {
    //   number: userContactNumber,
    //   message: smsMessage
    // };

    // try {
    //   const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with Server B's IP address
    //   console.log('SMS request sent to Server B. Response:', smsResponse.data.message);
    // } catch (error) {
    //   console.error('Error sending SMS via Server B:', error);
    // }

    // Optionally notify the user/admin
    await createNotification(
      'Borrowing Extended',
      `The borrowing duration for ${user.fullName} has been extended until ${extendedDueDate.toLocaleString()}.`,
      null
    );

    res.status(200).json({ message: 'Borrowing duration extended successfully', borrowReturnLog });
  } catch (error) {
    console.error('Error extending borrowing duration:', error);
    res.status(500).json({ message: 'Error extending borrowing duration', error: error.message });
  }
};

const formatDuration = (millis) => {
  const seconds = millis / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  // Choose the most appropriate unit for the duration
  if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
  } else if (hours < 24) {
      return `${Math.round(hours)} hours`;
  } else {
      return `${Math.round(days)} days`;
  }
};

exports.updateFeedbackEmoji = async (req, res) => {
  const { transactionID } = req.params;  // transactionID corresponds to the _id field in MongoDB
  const { feedbackEmoji } = req.body;

  try {
    const transaction = await BorrowReturnLog.findById(transactionID);  // Use the _id to find the transaction

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update the feedback emoji
    transaction.feedbackEmoji = feedbackEmoji;

    // Save the updated transaction 
    await transaction.save();

    res.status(200).json({ success: true, message: 'Feedback updated successfully' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ success: false, message: 'Error updating feedback' });
  }
};

// PUT request handler for partial return reason
exports.submitPartialReturnReason = async (req, res) => {
  const { transactionID } = req.params;
  const { reason } = req.body;

  try {
    // Validate reason
    if (!reason) {
      return res.status(400).json({ message: 'Reason for partial return is required.' });
    }

    // Find the transaction by ID and update the reason
    const transaction = await BorrowReturnLog.findById(transactionID);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // Update the transaction with the reason
    transaction.partialReturnReason = reason;
    await transaction.save();

    // Return success response
    res.status(200).json({ message: 'Partial return reason submitted successfully.' });
  } catch (error) {
    console.error('Error submitting partial return reason:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Controller function to get top borrowed items
exports.getTopBorrowedItems = async (req, res) => {
  try {
    // Aggregation to calculate total borrowed quantities for each item
    const topItems = await BorrowReturnLog.aggregate([
      { 
        $unwind: "$items"  // Unwind the array of items to process each item individually
      },
      {
        $group: {
          _id: '$items.itemName', // Group by the item name
          totalBorrowed: { $sum: '$items.quantityBorrowed' } // Sum the borrowed quantities
        }
      },
      {
        $sort: { totalBorrowed: -1 } // Sort by total borrowed in descending order
      },
      {
        $limit: 10 // Limit to the top 10 borrowed items
      }
    ]);

    res.status(200).json(topItems); // Send the result back as JSON
  } catch (error) {
    console.error('Error fetching top borrowed items:', error);
    res.status(500).json({ error: 'Failed to fetch top borrowed items' });
  }
};

// Get all borrow/return logs with feedback emojis
exports.getAllFeedbackLogs = async (req, res) => {
  try {
    const feedbackLogs = await BorrowReturnLog.find().select('feedbackEmoji');
    
    // Count occurrences of each emoji
    const emojiCounts = feedbackLogs.reduce((acc, log) => {
      const emoji = log.feedbackEmoji;
      acc[emoji] = (acc[emoji] || 0) + 1; // Increment count for the emoji
      return acc;
    }, {});

    // Convert emoji counts to an array
    const response = Object.keys(emojiCounts).map(emoji => ({
      emoji,
      count: emojiCounts[emoji],
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

