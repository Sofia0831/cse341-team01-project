const jwt = require("jsonwebtoken");

module.exports = (requiredRole = null) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Access denied. Insufficient role." });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  };
};