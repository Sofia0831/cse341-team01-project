const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  // 2. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};