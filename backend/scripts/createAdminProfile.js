const mongoose = require('mongoose');
const AdminProfile = require('../models/AdminProfileModel'); // Ensure this is correct
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to seed admin profiles
const createAdminProfile = async () => {
  try {
    await connectDB();

    // Pre-determined admin profiles
    const adminProfiles = [
      {
        name: 'Sir Bien',
        role: 'Laboratory Head',
        profileImage: 'url_to_image_1', // Replace with actual URL or path
        contactInfo: {
          email: 'main.admin@example.com',
          phone: '123-456-7890',
        },
      },
      {
        name: 'Eyd',
        role: 'Student Assistant 1',
        profileImage: 'url_to_image_2', // Replace with actual URL or path
        contactInfo: {
          email: 'admin1@example.com',
          phone: '098-765-4321',
        },
      },
      {
        name: 'Ian',
        role: 'Student Assistant 2',
        profileImage: 'url_to_image_3', // Replace with actual URL or path
        contactInfo: {
          email: 'admin2@example.com',
          phone: '567-890-1234',
        },
      },
    ];

    // Check if profiles already exist
    const existingProfiles = await AdminProfile.find({});
    if (existingProfiles.length === 0) {
      // Insert new profiles
      await AdminProfile.insertMany(adminProfiles);
      console.log('Admin profiles added successfully');
    } else {
      console.log('Admin profiles already exist');
    }

    // Close the database connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin profiles:', error);
    process.exit(1);
  }
};

// Run the function
createAdminProfile();
