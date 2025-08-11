const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware('customer'), cartController.getCart);
router.post('/items', authMiddleware('customer'), cartController.addItem);
router.put('/items/:id', authMiddleware('customer'), cartController.updateItem);
router.delete('/items/:id', authMiddleware('customer'), cartController.removeItem);
router.delete('/clear', authMiddleware('customer'), cartController.clearCart);

module.exports = router;