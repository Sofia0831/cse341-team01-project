const Product = require('../models/Product');

const getAll = async (req, res) => {
  //#swagger.tags=["Products"]
  //#swagger.summary="Get all products (no auth req)"
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add POST/PUT/DELETE endpoints with admin checks
const createProduct = async (req, res) => { 
  //#swagger.tags=["Products"]
  //#swagger.summary="Create a new product (admin)"
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
};

const updateProduct = async (req, res) => {
  //#swagger.tags=["Products"]
  //#swagger.summary="Update a product by ID (admin)"
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
};

const deleteProduct = async (req, res) => {
  //#swagger.tags=["Products"]
  //#swagger.summary="Delete a product by ID (admin)"
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
};


module.exports = {
    getAll,
    createProduct,
    updateProduct,
    deleteProduct
};