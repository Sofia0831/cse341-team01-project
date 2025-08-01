const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['electronics', 'clothing', 'books'] },
  stock: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', ProductSchema);