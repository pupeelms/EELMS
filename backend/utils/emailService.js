const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { generateQRCode, createPDFWithQRCode } = require('../utils/pdfService'); // Updated import
const BorrowReturnLogModel = require('../models/BorrowReturnLogModel');
require('dotenv').config();


// Set up the transporter with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

// Notify Admin about a new user registration
exports.sendAdminNotification = async (user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New User Registration Awaiting Approval',
            text: `A new user has registered: ${user.fullName}. Please review and approve their registration.`
        }; 

        await transporter.sendMail(mailOptions);
        console.log('Admin notification sent successfully');
    } catch (error) {
        console.error('Error sending admin notification:', error);
        throw error;
    }
};

// Send confirmation email with PDF attachment after approval
exports.sendUserConfirmation = async (user, pdfFilePath) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Registration Approved',
            text: `Hi ${user.fullName || "Valued User"},\n\nYour registration has been approved!\n\nAttached is your unique QR code, which you can use for seamless borrowing transactions in the Electrical Engineering Laboratory (EE Lab).\n\nSimply present this QR code during your visits to facilitate quick and efficient transactions.\n\nTo get started with using the Electrical Engineering Laboratory Management System (EELMS) and learn about its features, please review our User Manual here: https://drive.google.com/drive/folders/1zNQaJjD5R0eXBNdcikS9lzHJVrj5uxlK?usp=sharing.\n\nThank you,\nPUP EE LAB`,
            attachments: [
                {
                    filename: 'user-info.pdf',
                    path: pdfFilePath
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        // Clean up the file after sending
        fs.unlinkSync(pdfFilePath);

        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending user confirmation:', error);
        throw error;
    }
};


// Send decline email with reason for rejection
exports.sendUserDeclineEmail = async (user, notesComments) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Registration Declined',
            text: `Hi ${user.fullName || "Valued User"},\n\nWe regret to inform you that your registration has been declined for the following reason:\n\n${notesComments}\n\nIf you have any questions, please feel free to contact us.\n\nThank you,\nPUP EE LAB`
        };

        await transporter.sendMail(mailOptions);

        console.log('Decline email sent successfully');
    } catch (error) {
        console.error('Error sending decline email:', error);
        throw error;
    }
};

// NEW FUNCTION: Send email with transaction details (for logTransaction)
exports.sendTransactionEmail = async (user, transactionDetails, dueDate) => {
    try {
        // Format the borrowed items into a readable list
        const itemsList = transactionDetails.map(item => `${item.itemName} - ${item.quantityBorrowed} pc/s`).join("\n");

        // Construct the email content with a clearer format
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Borrowing Transaction Details',
            text: 
`
Hello ${user.fullName || "Valued User"},

Thank you for borrowing items from us. Here are the details of your transaction:

Borrowed Items:
${itemsList}

Due Date: ${dueDate.toLocaleString()}

If you need any manuals for the borrowed items, you can check this Google Drive folder:
https://drive.google.com/drive/folders/1j4nEiabLaGCawRq0Xw5-W8yjPGjcYPyS?usp=sharing

Search for the specific name of the item to see if a manual is provided. Please note that manuals may not be available for all items.

Note: Please ensure that the items are returned by the due date to avoid any penalties.

Thank you,
PUP EE LAB
`
        };

        // Send the email using nodemailer transporter
        await transporter.sendMail(mailOptions);
        console.log('Transaction email sent successfully');
    } catch (error) {
        console.error('Error sending transaction email:', error);
        throw error;
    }
};

exports.sendReminderEmail = async (user, dueDate) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reminder: Return Borrowed Items',
            text: 
`
Hi ${user.fullName || "Valued User"},

This is a friendly reminder that your borrowed items are due to be returned by ${dueDate.toLocaleString()}.

If you wish to extend the borrowing period, please inform us at the EE Laboratory. Please note that you can only extend the borrowing duration once.

Thank you,
PUP EE LAB
`
        };

        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent successfully');
    } catch (error) {
        console.error('Error sending reminder email:', error);
        throw error;
    }
};

// Function to send return process email
exports.sendEmail = async (recipientEmail, emailSubject, emailBody) => {
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: recipientEmail, // recipient address
      subject: emailSubject,
      text: emailBody,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Return process email sent successfully');
    } catch (error) {
      console.error('Error sending return process email:', error);
      throw new Error('Failed to send return process email');
    }
  };
   
