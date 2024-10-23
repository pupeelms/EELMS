const mongoose = require('mongoose');

// Define the schema
const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  itemCount: { type: Number, default: 0 } // Track the number of items in this category
});

// Create and export the model
module.exports = mongoose.model('Category', CategorySchema);
