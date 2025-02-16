/* This JavaScript code snippet is defining a function called `connectDB` that is responsible for
connecting to a MongoDB database using Mongoose. Here's a breakdown of what the code is doing: */

const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
