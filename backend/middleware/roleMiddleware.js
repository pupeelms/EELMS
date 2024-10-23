const roleMiddleware = (requiredRole) => (req, res, next) => {
    const userRole = req.user?.role; // Assuming user role is stored in the decoded token
  
    if (userRole !== requiredRole) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
  
    next();
  };
  
  module.exports = roleMiddleware;
  