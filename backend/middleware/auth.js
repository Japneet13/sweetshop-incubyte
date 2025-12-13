const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { models } = require("../models/index");

// Verify JWT and attach user to request
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await models.User.findByPk(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token (user not found)" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
};
