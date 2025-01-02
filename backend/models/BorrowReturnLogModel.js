const mongoose = require('mongoose');

// Define the schema for each item log
const ItemLogSchema = new mongoose.Schema({
  itemBarcode: { type: String, required: true },
  itemName: { type: String, required: true },
  quantityBorrowed: { type: Number, default: 0 },
  quantityReturned: { type: Number, default: 0 },
  condition: { type: String },
  _id: false
}); 

// Define the schema for borrow/return logs
const BorrowReturnLogSchema = new mongoose.Schema({
  dateTime: { type: Date, default: Date.now },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  contactNumber: { type: String, required: true },
  items: [ItemLogSchema], // Array of items being logged
  courseSubject: { type: String },
  professor: { type: String },
  profAttendance: { type: String, enum: ['Yes','No', 'yes', 'no'] },
  roomNo: { type: String },
  borrowedDuration: { type: String },
  extendedDuration: { type: String },
  dueDate: { type: Date },
  transactionType: { type: String, enum: ['Borrowed','Returned'] },
  returnStatus: { type: String, enum: ['Pending', 'Completed', 'Overdue', 'Partially Returned', 'Extended', 'Transferred'], default: 'Pending' },
  returnDate: { type: Date },
  feedbackEmoji: { type: String }, 
  partialReturnReason: { type: String },
  notesComments: { type: String },

  reminderSent: {
    type: Boolean,
    default: false, // By default, no reminder has been sent
  },

  overdueEmailSent: {
    type: Boolean,
    default: false, // By default, no reminder has been sent
  }



});

// Create and export the model
module.exports = mongoose.model('BorrowReturnLog', BorrowReturnLogSchema);
