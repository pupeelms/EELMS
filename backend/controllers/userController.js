/* The above code is a Node.js application that defines several controller functions for managing user
registration and approval processes. Here is a summary of what each function does: */

const User = require('../models/UserModel');
const mongoose = require('mongoose');
const { sendAdminNotification, sendUserConfirmation, sendUserDeclineEmail } = require('../utils/emailService');
const { generateQRCode, createPDFWithQRCode } = require('../utils/pdfService'); 
const { createNotification } = require('../utils/notificationService');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Add axios to send the HTTP request

// Create a new user
exports.createUser = async (req, res) => {
  try {
      console.log('Received request body:', req.body); // Log the incoming request data

      const newUser = new User(req.body);
      const savedUser = await newUser.save();
      console.log('User saved successfully:', savedUser); // Log the saved user

      // Notify admin for approval
      await sendAdminNotification(newUser);

      // Create a notification for the admin
      await createNotification('User Registration', `New user ${newUser.fullName} registered and awaiting approval.`, null);

      // Send SMS request to Server B
      // const smsMessage = `Hello ${savedUser.fullName}, your registration has been received! Please await admin approval.`;
      // const smsRequestData = {
      //     number: savedUser.contactNumber,
      //     message: smsMessage
      // };

      // Sending the SMS request to Server B
      // const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with the actual IP address of Server B
      // console.log(`SMS request sent to Server B. Response: ${smsResponse.data.message}`);

      res.status(201).json({ message: 'Registration successful! Await admin approval.' });
  } catch (error) {
      console.error('Error during user registration:', error); // Log the error details

      // Handle specific error types
      if (error.name === 'ValidationError') {
          return res.status(400).json({ 
              message: 'Validation Error', 
              error: error.message, 
              details: error.errors 
          });
      }

      if (error.code === 11000) {
          return res.status(400).json({ 
              message: 'Duplicate Entry Error', 
              error: 'The email or student number already exists. Please use a different one.' 
          });
      }

      return res.status(201).json({ 
          message: 'Server Error', 
          error: error.message || 'An unknown error occurred while registering the user.' 
      });
  }
};



// Approve user function
exports.approveUser = async (req, res) => {
  try {
      const { userId } = req.params;

      // Update status to 'Approved'
      const user = await User.findByIdAndUpdate(userId, { status: 'Approved' }, { new: true });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const qrCodeFilePath = await generateQRCode(user._id.toString());
      const pdfFilePath = path.join(__dirname, '..', 'uploads', 'user-info.pdf');

      await createPDFWithQRCode(qrCodeFilePath, user.fullName, pdfFilePath);
      await sendUserConfirmation(user, pdfFilePath);

      // Prepare the SMS message
      // const smsMessage = `Hi ${user.fullName}, your EELMS registration has been approved! Your QR code ID will be sent via email. Thank you!`;

      // // Send SMS request to Server B
      // const smsRequestData = {
      //     number: user.contactNumber,
      //     message: smsMessage
      // };

      // const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with the actual IP address of Server B
      // console.log(`SMS request sent to Server B. Response: ${smsResponse.data.message}`);

      // Create a notification for the admin
      await createNotification('User Registration Approved', `New user ${user.fullName} was approved.`, null);

      res.status(200).json({ message: 'User approved successfully', user });
  } catch (error) {
      console.error('Error approving user:', error);
      res.status(200).json({ message: 'Error approving user', error: error.message });
  }
};

// Decline user function
exports.declineUser = async (req, res) => {
  try {
      const { userId } = req.params;
      const { notesComments } = req.body;

      if (!notesComments) {
          return res.status(400).json({ message: 'Rejection reason is required' });
      }

      const user = await User.findByIdAndUpdate(userId, { 
          status: 'Declined',
          notesComments
      }, { new: true });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      await sendUserDeclineEmail(user, notesComments);

      // Prepare the SMS message
      // const smsMessage = `Hi ${user.fullName}, your EELMS registration was declined. Please check your email for further details. Thank you!`;

      // // Send SMS request to Server B
      // const smsRequestData = {
      //     number: user.contactNumber,
      //     message: smsMessage
      // };

      // const smsResponse = await axios.post(`${process.env.GSMClientIP}`, smsRequestData); // Replace <Server_B_IP> with the actual IP address of Server B
      // console.log(`SMS request sent to Server B. Response: ${smsResponse.data.message}`);

      // Create a notification for the admin
      await createNotification('User Registration Declined', `User ${user.fullName} was declined.`, null);

      res.status(200).json({ message: 'User declined successfully', user });
  } catch (error) {
      console.error('Error declining user:', error);
      res.status(200).json({ message: 'Error declining user', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`Invalid User ID: ${userId}`);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is found
    console.log(`User found: ${user.fullName}`);
    res.status(200).json(user);
  } catch (error) {
    // Log the error for debugging purposes
    console.error(`Error retrieving user with ID ${req.params.id}: `, error.message);

    // Send error response with more detail
    res.status(500).json({ 
      message: 'Failed to retrieve user', 
      error: error.message 
    });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Get count of users awaiting approval (status: 'Pending')
exports.countAwaitingApprovalUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'Pending' });
    if (users.length === 0) {
      // console.log('No users found with a status of Pending');
      return res.status(200).json({ awaitingApprovalCount: 0, message: 'No users are awaiting approval' });
    }
    res.status(200).json({ awaitingApprovalCount: users.length });
  } catch (error) {
    console.error('Error fetching users awaiting approval:', error.message);
    res.status(500).json({ message: 'Failed to retrieve users awaiting approval' });
  }
};