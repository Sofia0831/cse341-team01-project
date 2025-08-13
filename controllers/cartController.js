const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
    //#swagger.tags=["Cart"]
    //#swagger.summary="Get all items in cart (customer)"
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user.userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addItem = async (req, res) => {
    //#swagger.tags=["Cart"]
    //#swagger.summary="Add an item to the cart (customer)"
  try {
    const { productId, quantity } = req.body;
    const numQuantity = Number(quantity);
    
    // Ensure the quantity is a positive number.
    if (numQuantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }
    
    // Check if there is enough stock and decrement
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: numQuantity } }, // ensure stock is sufficient
      { $inc: { stock: -numQuantity } }, // decrement
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      return res.status(400).json({ message: `Not enough stock available. Only ${product.stock} left.` });
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
        cart = await Cart.create({ user: req.user.userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = Number(cart.items[itemIndex].quantity) + numQuantity;
    } else {
        cart.items.push({ product: productId, quantity: numQuantity });
    }

    await cart.save();
    res.json(cart);

  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


exports.updateItem = async (req, res) => {
    //#swagger.tags=["Cart"]
    //#swagger.summary="Update item quantity in cart (customer)"
  try {
    const { quantity } = req.body;
    const numQuantity = Number(quantity);

    if (numQuantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const oldQuantity = Number(item.quantity);
    const stockChange = oldQuantity - numQuantity;
    
    // update product stock by the difference, but only if the change is valid
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: -stockChange } }, // Condition to prevent negative stock
      { $inc: { stock: stockChange } },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      // Retrieve the product to provide  error message
      const product = await Product.findById(item.product);
      const availableStock = product ? product.stock + oldQuantity : 0;
      return res.status(400).json({ message: `Not enough stock available. Only ${availableStock} left.` });
    }
    

    item.quantity = numQuantity;
    await cart.save();
    res.json(cart);

  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


exports.removeItem = async (req, res) => {
    //#swagger.tags=["Cart"]
    //#swagger.summary="Remove an item from the cart (customer)"
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // adding stock back to product
    const itemToRemove = cart.items.find(i => i._id.toString() === req.params.id);
    if (itemToRemove) {
      await Product.updateOne({ _id: itemToRemove.product }, { $inc: { stock: itemToRemove.quantity } });
    }

    cart.items = cart.items.filter(i => i._id.toString() !== req.params.id);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
    //#swagger.tags=["Cart"]
    //#swagger.summary="Clear all items in cart (customer)"
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // add stock back to product
    for (const item of cart.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }

    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};