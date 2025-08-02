const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', async (req, res) => {
  //#swagger.tags=["Products"]
  //#swagger.summary="Get all products"
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add POST/PUT/DELETE endpoints with admin checks
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  //#swagger.tags=["Products"]
  //#swagger.summary="Create a new product"
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  //#swagger.tags=["Products"]
  //#swagger.summary="Update a product by ID"
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  //#swagger.tags=["Products"]
  //#swagger.summary="Delete a product by ID"
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
});


module.exports = router;