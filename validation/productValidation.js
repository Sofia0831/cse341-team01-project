const { body, validationResult } = require("express-validator");

const prodValidationRules = [
    body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Must be string'),
    
    body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0}).withMessage('Price must be non-negative number'),

    body('category')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Must be string'),

    body('stock')
    .optional()
    .isInt({ min: 0}).withMessage('Stock must be non-negative integer')
    .toInt(),

];

// Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // Validation passed, proceed to the next middleware/route handler
    }
    
    // Validation failed, extract and format errors
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    
    // Send a 422 Unprocessable Entity response with the validation errors
    return res.status(422).json({ 
        errors: extractedErrors,
    });
};

module.exports = {
    prodValidationRules,
    validate
};