const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('./utils/cloudinary'); 
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const upload = require('./utils/upload');

dotenv.config();

connectDB();

const app = express();
const fs = require('fs');

// Create a MongoDB store instance
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 // Session expiration (24 hours)
});

// Handle errors with MongoDB store
store.on('error', function (error) {
  console.error(error); 
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Update with frontend URL
  credentials: true // Allow cookies to be sent with requests
}));
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key', // Use env variable for secret key
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Cookie expiration (24 hours)
    httpOnly: true, // Prevent JS access to the cookie
    secure: true,
    // process.env.NODE_ENV === 'production', // Set secure cookie only in production
    sameSite: "none" 
    // process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site cookie handling
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


module.exports = app;
