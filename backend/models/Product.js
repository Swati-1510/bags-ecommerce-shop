const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: {
    type: [String],
    required: [true, 'Product images are required'],
    validate: [arr => arr.length > 0, 'At least one product image is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Totes', 'Slings', 'Clutches', 'Backpacks', 'Mini Bags', 'Office Bags', 'College Bags', 'Handbags', 'Tote Bags', 'Sling Bags', 'Laptop Backpacks', 'Laptop Sleeves', 'Wallets', 'Mini Wallets']
  },
  colors: [{
    name: { type: String, required: true },
    hex:  { type: String, required: true },
    image: { type: String, default: '' }
  }],
  stockCount: {
    type: Number,
    required: [true, 'Stock count is required'],
    min: [0, 'Stock count cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
