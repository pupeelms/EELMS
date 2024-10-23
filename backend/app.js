const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
const upload = require('./utils/upload');
const MongoDBStore = require('connect-mongodb-session')(session);

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

// File Upload Route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app; // Export the app instance
