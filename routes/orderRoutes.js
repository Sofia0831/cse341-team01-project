const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order from cart items
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 example: "123 Main St, City, Country"
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, cash_on_delivery]
 *                 example: "credit_card"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (empty cart or invalid data)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware('customer'), orderController.createOrder);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders for the current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router.get('/my-orders', authMiddleware('customer'), orderController.getUserOrders);

/**
 * @swagger
 * /orders/all:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not admin)
 *       500:
 *         description: Server error
 */
router.get('/all', authMiddleware('admin'), orderController.getAllOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 example: "shipped"
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', authMiddleware('admin'), orderController.updateOrderStatus);

module.exports = router;