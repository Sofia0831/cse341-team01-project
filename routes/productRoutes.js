const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { prodValidationRules, validate } = require('../validation/productValidation');

router.get('/', productController.getAll);
router.post('/', authMiddleware('admin'), prodValidationRules, validate, productController.createProduct);
router.put('/:id', authMiddleware('admin'), prodValidationRules, validate, productController.updateProduct);
router.delete('/:id', authMiddleware('admin'), productController.deleteProduct);


module.exports = router;