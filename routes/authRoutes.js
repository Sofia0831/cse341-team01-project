const express = require("express");
const { signupValidator, loginValidator } = require("../validation/authValidation");
const { validationResult } = require("express-validator");
const authController = require("../controllers/authController");

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

module.exports = router;