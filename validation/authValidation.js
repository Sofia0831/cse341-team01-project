const { body } = require("express-validator");

exports.signupValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

exports.loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required."),
  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];