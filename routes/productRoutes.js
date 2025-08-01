const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// @swagger
// /products:
//   get:
//     summary: Get all products
//     parameters:
//       - in: query
//         name: category
//         schema: { type: string }
//     responses:
//       200: { description: "Array of products" }
router.get('/', async (req, res) => {
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
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
});


module.exports = router;