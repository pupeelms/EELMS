const mongoose = require('mongoose');

// Define the schema
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: true, 
    trim: true,
    // unique: true, 
    match: [/.+@.+\..+/, 'Please enter a valid email address'] // Email validation
  },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  studentNo: { 
    type: String,  
    // unique: true,
    match: [/^20\d{2}-\w{5}-MN-\w$/, 'Student number must follow the format 20**-*****-MN-*'] // Student number validation
  },
  program: { type: String },
  yearAndSection: { type: String },
  contactNumber: { 
    type: String, 
    required: true, 
    match: [/^639\d{9}$/, 'Contact number must start with 639 and have exactly 12 digits'] 
  },
  registrationCard: { type: String },
  updatedClassSchedule: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Declined'], 
    default: 'Pending' 
  },
  notesComments: { type: String } 
}, {
  timestamps: true,  // Add createdAt and updatedAt fields automatically
});

// Create and export the model
module.exports = mongoose.model('User', UserSchema);
