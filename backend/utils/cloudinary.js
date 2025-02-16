/* This code snippet is setting up a Node.js server using Express framework to handle file uploads to
Cloudinary. Here's a breakdown of what the code is doing: */

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const app = express();
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your cloud name
  api_key: process.env.CLOUDINARY_API_KEY,       // Your API key
  api_secret: process.env.CLOUDINARY_SECRET_KEY    // Your API secret
});

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('file'), (req, res) => { // Ensure 'file' matches the form input
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Upload to Cloudinary
    cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        // Return the Cloudinary response (URL and other info)
        res.json({
            message: 'File uploaded successfully!',
            url: result.secure_url,
            public_id: result.public_id,
        });
    }).end(req.file.buffer); // Send the file buffer to Cloudinary
});

module.exports = cloudinary