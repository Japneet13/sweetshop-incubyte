// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { models } = require("../models/index");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../middleware/auth");

/**
 * POST /api/auth/register
 * body: { username, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "username & password required" });

    // prevent existing username
    const existing = await models.User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: "username already taken" });

    const user = await models.User.createWithPassword(username, password, false);
    return res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * body: { username, password }
 * returns: { token }
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "username & password required" });

    const user = await models.User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = user.validatePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({
      userId: user.id,
      isAdmin: user.isAdmin, // 🔴 IMPORTANT
     },
     JWT_SECRET,
     { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
     token,
     user: {
       id: user.id,
       username: user.username,
       isAdmin: user.isAdmin // or user.is_admin based on your model
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/auth/change-password
 * Protected: requires Authorization: Bearer <token>
 * body: { oldPassword, newPassword }
 */
router.post(
  "/change-password",
  authenticateToken,
  [
    body("oldPassword").isString().notEmpty().withMessage("oldPassword required"),
    body("newPassword").isString().isLength({ min: 6 }).withMessage("newPassword must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { oldPassword, newPassword } = req.body;
      const user = await models.User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.validatePassword(oldPassword)) {
        return res.status(401).json({ message: "Invalid old password" });
      }

      // hash and save new password
      user.passwordHash = bcrypt.hashSync(newPassword, 10);
      await user.save();

      return res.json({ message: "Password changed" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
