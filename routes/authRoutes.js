const express = require("express");
const { signupValidator, loginValidator } = require("../validation/authValidation");
const { validationResult } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signupValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  authController.signup(req, res, next);
});


router.post("/login", loginValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  authController.login(req, res, next);
});

router.post("/refresh", authController.refresh);

router.post("/logout", authMiddleware(), (req, res) => {
  //#swagger.tags=["Authentication"]
  //#swagger.summary="Logout user (client should discard token)"
  res.status(200).json({ message: "Logged out successfully (client must discard token)" });
});

module.exports = router;