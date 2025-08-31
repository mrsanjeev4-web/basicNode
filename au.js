// ----> routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middlewares/auth");

const router = express.Router();

// helper: sign JWT
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
}


router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Min 6 chars password"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ isError: true, errors: errors.array() });
      }

      const { name, email, password } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ isError: true, Message: "Email already in use" });
      }

      const user = await User.create({ name, email, password });
      const token = signToken({ id: user._id, email: user.email });

      // don’t send password
      const { password: _, ...userSafe } = user.toObject();

      return res.status(201).json({
        isError: false,
        Message: "User created",
        token,
        user: userSafe,
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ isError: true, Message: "Internal server error" });
    }
  }
);


router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ isError: true, errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ isError: true, Message: "Invalid credentials" });
      }

      const ok = await user.matchPassword(password);
      if (!ok) {
        return res.status(401).json({ isError: true, Message: "Invalid credentials" });
      }

      const token = signToken({ id: user._id, email: user.email });
      const { password: _, ...userSafe } = user.toObject();

      return res.json({
        isError: false,
        Message: "Login success",
        token,
        user: userSafe,
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ isError: true, Message: "Internal server error" });
    }
  }
);


router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ isError: true, Message: "User not found" });
    res.json({ isError: false, user });
  } catch (err) {
    res.status(500).json({ isError: true, Message: "Internal server error" });
  }
});

module.exports = router;

// --- >middlewares/auth.js
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    // Expecting "Bearer <token>" OR plain token
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;

    if (!token) {
      return res.status(401).json({ isError: true, Message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ isError: true, Message: "Invalid/Expired token" });
  }
};

