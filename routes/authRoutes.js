const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// @swagger
// /auth/signup:
//   post:
//     summary: Register a new user
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               email: { type: string, example: "user@example.com" }
//               password: { type: string, example: "securePassword123" }
//     responses:
//       201: { description: "User created" }
//       400: { description: "Email already exists" }
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const user = await User.create({ email, password });
    res.status(201).json({ id: user._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// @swagger
// /auth/login:
//   post:
//     summary: Login and get JWT
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               email: { type: string, example: "user@example.com" }
//               password: { type: string, example: "securePassword123" }
//     responses:
//       200: { description: "Returns JWT" }
//       401: { description: "Invalid credentials" }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  // 2. Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" });

  // 3. Generate JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Add login endpoint similarly
module.exports = router;