const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Store the entire decoded payload in req.user (if needed, you can use decoded.id for just the user ID)
    req.user = decoded;  // Storing the whole decoded token, including user ID
    next(); // Proceed to the next middleware
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' }); // Invalid or expired token
  }
};

module.exports = verifyToken;
