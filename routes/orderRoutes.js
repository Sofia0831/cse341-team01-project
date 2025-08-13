const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Customer routes
router.post('/', authMiddleware('customer'), orderController.createOrder);
router.get('/my-orders', authMiddleware('customer'), orderController.getUserOrders);

// Admin routes
router.get('/all', authMiddleware('admin'), orderController.getAllOrders);
router.put('/:id/status', authMiddleware('admin'), orderController.updateOrderStatus);

module.exports = router;