const Admin = require('../models/AdminModel');

// Handle login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('Login request:', { email, password });

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Check if password is correct
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Store admin ID in session to track logged-in user
    req.session.adminId = admin._id;
    console.log('Login successful:', admin._id);
    return res.status(200).json({ message: 'Login successful' }); // Return JSON
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error during logout' }); // JSON response for error
    }
    res.clearCookie('connect.sid'); // Clear session cookie on logout
    return res.status(200).json({ message: 'Logout successful' }); // JSON response
  });
};
