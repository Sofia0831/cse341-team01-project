const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create order from cart
exports.createOrder = async (req, res) => {
    //#swagger.tags=["Orders"]
    //#swagger.summary="Create an order from cart items (customer)"
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
            paymentMethod,
            status: 'pending'
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
    //#swagger.summary="Get orders for the current user (customer)"
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
    //#swagger.summary="Get all orders (admin)"
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
    //#swagger.summary="Update order status (admin)"
    try {
        const { status } = req.body;
        const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deleteOrder = async (req, res) => {
    //#swagger.tags=["Orders"]
    //#swagger.summary="Delete an order (customer)"
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        //Restrict deletion to "Pending" orders only
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot delete an order that is already processed or shipped' });
        }

        await order.deleteOne();
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};