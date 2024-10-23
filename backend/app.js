const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('./utils/cloudinary'); 
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser')
const upload = require('./utils/upload')

dotenv.config();

connectDB();

const app = express();
const https = require('https');
const fs = require('fs');
//
// Load your SSL certificate files
// const options = {
//   key: fs.readFileSync('./erika-secret/private.key'), // Use your actual private key file
//   cert: fs.readFileSync('./erika-secret/pupeelms_com.crt'),
//   ca: fs.readFileSync('./erika-secret/pupeelms_com.ca-bundle')
// };
// const server = https.createServer(options, app);

// Create a MongoDB store instance
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 // Session expiration (24 hours)
});

// Handle errors
store.on('error', function (error) {
  console.error(error);
});

// Middleware
app.use(express.json()); // Only include once
app.use(cors({
  origin: true, // Allow all origins
  credentials: true // Allow cookies to be sent with requests
}));

app.use(express.urlencoded({ extended: true }));


// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || '4e0b0bcd0a7a0f13e24aaa87219e0c59785e59140e9f7eff4f17e6fbde300b61b1a4c78becd93a4d689c05ade3df481f746fb4249f41c459ff2c67789f2f5d38', // Use a strong secret key
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Cookie expiration (same as session TTL)
    httpOnly: true, // Prevent JavaScript access to the cookie
    secure: process.env.NODE_ENV === 'production' // Set to true if using HTTPS
  }
}));

// Session endpoint
app.get('/api/session', (req, res) => {
  res.json(req.session);
});

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/borrow-return', require('./routes/borrowReturnRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/adminProfile', require('./routes/adminProfileRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Upload route
// app.post('/upload', upload.single('file'), (req, res) => {
//     // Check if file exists
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }

//     // Upload to Cloudinary
//     cloudinary.uploader.upload_stream((error, result) => {
//         if (error) {
//             return res.status(500).send(error.message);
//         }
//         // Return the Cloudinary response (URL and other info)
//         res.json({
//             message: 'File uploaded successfully!',
//             url: result.secure_url,
//             public_id: result.public_id,
//         });
//     }).end(req.file.buffer); // Send the file buffer to Cloudinary
// });

module.exports = app; // Export the app instance
