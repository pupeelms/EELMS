const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
const MongoDBStore = require('connect-mongodb-session')(session);

dotenv.config(); // Load environment variables

// Connect to MongoDB
connectDB();

const app = express();

// Create a MongoDB store instance for session storage
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 // Session expiration (24 hours)
});

// Handle errors with MongoDB store
store.on('error', function (error) {
  console.error(error);
});

// Allowed origins for CORS
const allowedOrigins = ['https://eelms.onrender.com', 'http://localhost:3000'];

// Middleware to handle CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials such as cookies to be sent
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key', // Use strong secret key from environment
  resave: false,
  proxy: true,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Cookie expiration (24 hours)
    httpOnly: true, // Prevent JS access to the cookie
    secure: true, // Only set secure cookies in production
    sameSite: 'none', // Cross-site cookie handling
  }
}));

// Intercept OPTIONS requests for preflight CORS
app.options('*', (req, res) => {
  res.sendStatus(200);
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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app; // Export the app instance
