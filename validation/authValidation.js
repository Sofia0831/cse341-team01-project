const { body } = require("express-validator");
const { isEmail } = require("validator");

exports.signupValidator = [
  body("email")
    .isEmail().withMessage("Please enter a valid email address.")
    .withMessage("Please enter a valid email address."),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isAlpha().withMessage('First name must contain only letters'),
  
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isAlpha().withMessage('Last name must contain only letters'),
  body('userName')
    .notEmpty().withMessage('userName required')
];

exports.loginValidator = [
  body('loginDetail')
    .notEmpty().withMessage('Email or Username is required')
    .custom((value) => {
      const isEmailValue = isEmail(value);

      const isUsernameValue = typeof value === 'string' && value.trim().length > 0;

      if (isEmailValue || isUsernameValue) {
        return true;
      }
      
      throw new Error('Invalid email or username format');
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];