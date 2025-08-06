const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const { prodValidationRules } = require('../validation/productValidation')

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
router.post('/', authMiddleware('admin'), ...prodValidationRules, async (req, res) => { 
  //#swagger.tags=["Products"]
  //#swagger.summary="Create a new product"
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Product information.',
        required: true,
        schema: {
            name: "Example Product",
            price: 19.99,
            category: "Electronics",
            stock: 100
        }
    } */

  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware('admin'), ...prodValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
  //#swagger.tags=["Products"]
  //#swagger.summary="Update a product by ID"
  /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'Product information to update.',
            required: true,
            schema: {
                name: "Updated Product Name",
                price: 29.99,
                category: "Gadgets",
                stock: 50
            }
    } */
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
});

router.delete('/:id', authMiddleware('admin'), async (req, res) => {
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