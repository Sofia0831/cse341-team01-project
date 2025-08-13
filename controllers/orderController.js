const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create order from cart
exports.createOrder = async (req, res) => {
    //#swagger.tags=["Orders"]
    //#swagger.summary="Create an order from cart items"
    try {
        const { shippingAddress, paymentMethod } = req.body;
        
        // Get user's cart with populated product details
        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total amount and prepare order items
        let totalAmount = 0;
        const orderItems = await Promise.all(cart.items.map(async (item) => {
            const product = item.product;
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;
            
            return {
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase: product.price
            };
        }));

        // Create the order
        const order = await Order.create({
            user: req.user.userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        // Clear the cart after order creation
        cart.items = [];
        await cart.save();

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get orders for a specific user
exports.getUserOrders = async (req, res) => {
    //#swagger.tags=["Orders"]
    //#swagger.summary="Get orders for the current user"
    try {
        const orders = await Order.find({ user: req.user.userId })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    //#swagger.tags=["Orders"]
    //#swagger.summary="Get all orders (admin only)"
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    //#swagger.tags=["Orders"]
    //#swagger.summary="Update order status (admin only)"
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};