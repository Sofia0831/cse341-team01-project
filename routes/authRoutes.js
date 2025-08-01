const express = require("express");
const { signupValidator, loginValidator } = require("../validation/authValidation");
const { validationResult } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "securePassword123" }
 *     responses:
 *       201: { description: "User created" }
 *       400: { description: "Validation error" }
 */
router.post("/signup", signupValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  authController.signup(req, res, next);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "securePassword123" }
 *     responses:
 *       200: { description: "Returns JWT" }
 *       400: { description: "Validation error" }
 *       401: { description: "Invalid credentials" }
 */
router.post("/login", loginValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  authController.login(req, res, next);
});

module.exports = router;