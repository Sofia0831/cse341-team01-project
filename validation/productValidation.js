const { body } = require("express-validator");

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

module.exports = {prodValidationRules};