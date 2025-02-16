/**
 * The authMiddleware function checks if the session has an adminId and returns an unauthorized message
 * if not.
 */
const authMiddleware = (req, res, next) => {
  
  // Check if the session has the adminId
  if (!req.session.adminId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

module.exports = authMiddleware;
