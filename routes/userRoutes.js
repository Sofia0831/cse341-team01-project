const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { userValidationRules, validate, userDetailsRules } = require('../validation/userValidation');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware('admin'), userController.getAllUsers);
router.get('/me', authMiddleware(), userController.getMe);
router.put('/:id', authMiddleware('admin'), userValidationRules, validate, userController.updateUser);
router.put('/me/:id', authMiddleware('customer'), userValidationRules, userDetailsRules, validate, userController.updateDetails);
router.delete('/:id', authMiddleware('admin'), userController.deleteUser);

module.exports = router;