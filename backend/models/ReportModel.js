const mongoose = require('mongoose');

// Report Schema
const ReportSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', // Reference to the Item model
    required: true
  },
  issue: {
    type: String,
    required: true
  },
  reportedBy: { 
    type: String,  // Change this to String to store the user's full name
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  comments: { 
    type: String 
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Report', ReportSchema);
