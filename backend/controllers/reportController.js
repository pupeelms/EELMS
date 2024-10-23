const Report = require('../models/ReportModel');
const Item = require('../models/ItemModel');
const User = require('../models/UserModel');
const { createNotification } = require('../utils/notificationService'); // Import notification service
const mongoose = require('mongoose');

// Create a new report
exports.createReport = async (req, res) => {
  const { itemId, issue, reportedByName, priority } = req.body;

  // Log the incoming request body for debugging
  console.log('Received data:', req.body);

  try {
    // Validate input - ensure all fields are present
    if (!itemId || !issue || !reportedByName || !priority) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the item by itemBarcode (not ObjectId)
    const item = await Item.findOne({ itemBarcode: itemId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Perform a case-insensitive search for the user by fullName
    const user = await User.findOne({ fullName: new RegExp(`^${reportedByName}$`, "i") });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the report using the fullName instead of the ObjectId
    const newReport = new Report({
      itemId: item._id,  // Store the ObjectId of the item
      issue,
      reportedBy: user.fullName,  // Store the user's full name (String)
      priority
    });

    // Save the report to the database
    await newReport.save();

    // Notify admin of new report submission
    await createNotification('New Report Submitted', `A new report has been submitted by ${user.fullName} for item: ${item.itemName}.`);

    // Respond with success message and the created report
    res.status(201).json({ message: 'Report submitted successfully', report: newReport });

  } catch (error) {
    // Log the error for debugging
    console.error('Error submitting report:', error);

    // Respond with error message and detailed error info
    res.status(500).json({ error: 'Error submitting report', details: error.message });
  }
};


// Get all reports for an item
exports.getReportsForItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const reports = await Report.find({ itemId }).populate('itemId', 'itemName itemBarcode');
    if (!reports.length) {
      return res.status(404).json({ message: 'No reports found for this item' });
    }

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reports', details: error.message });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  console.log('getAllReports function called');
  try {
    console.log('Attempting to fetch reports from database');
    // Fetch all reports and populate related item data (itemName, itemBarcode)
    const reports = await Report.find().populate('itemId', 'itemName itemBarcode');
    
    console.log('Reports fetched:', reports);

    // Check if there are any reports
    if (!reports.length) {
      console.log('No reports found');
      return res.status(404).json({ message: 'No reports found' });
    }

    console.log('Sending reports in response');
    // Return the reports in the response
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Error fetching reports', details: error.message });
  }
};

// Controller to update the status of a report
exports.updateReportStatus = async (req, res) => {
  console.log('updateReportStatus function called');
  
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'reviewed', 'resolved'];

    if (!allowedStatuses.includes(status)) {
      console.log('Invalid status value');
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const reportId = req.params.id;
    console.log(`Attempting to update status of report with ID: ${reportId}`);
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      console.log('Report not found');
      return res.status(404).json({ message: 'Report not found' });
    }

    console.log('Report status updated successfully:', updatedReport);
    res.status(200).json(updatedReport);
  } catch (error) {
    console.error('Error updating report status:', error.message);
    res.status(500).json({ message: 'Error updating report status', details: error.message });
  }
};

// Delete a report by ID
exports.deleteReportById = async (req, res) => {
  const { id } = req.params;
  console.log(`Received DELETE request for report ID: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid report ID' });
  }

  try {
    const deletedReport = await Report.findByIdAndDelete(id);

    if (!deletedReport) {
      console.log(`No report found with ID: ${id}`);
      return res.status(404).json({ message: 'Report not found' });
    }

    console.log(`Successfully deleted report with ID: ${id}`);
    res.status(200).json({ message: 'Report deleted successfully', report: deletedReport });
  } catch (error) {
    console.error('Error deleting report:', error.message);
    res.status(500).json({ message: 'Error deleting report', details: error.message });
  }
};
