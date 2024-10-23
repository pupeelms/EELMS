const mongoose = require('mongoose');
const Admin = require('../models/AdminModel');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

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

const createAdmin = async () => {
  try {
    await connectDB();

    // Define admin credentials
    const email = 'pup.labeeis@gmail.com';
    const password = 'pup.labeeis123'; // This will be hashed

    // Check if admin already exists
    let admin = await Admin.findOne({ email });

    if (!admin) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new admin
      admin = new Admin({
        email,
        password: hashedPassword
      });

      await admin.save();
      console.log('Admin created successfully');
    } else {
      console.log('Admin already exists');
    }

    // Log the hashed password and original password
    console.log('Original password:', password);
    console.log('Generated hashed password:', admin.password); // Log the stored hashed password

    // Close the database connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
