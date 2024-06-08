// middleware/authenticateOptionalJWT.js
const jwt = require('jsonwebtoken');

const authenticateOptionalJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded); // Add logging to verify the token contents
      req.user = decoded;
    } catch (error) {
      console.error('Invalid token:', error.message);
    }
  }
  next();
};

module.exports = authenticateOptionalJWT;
