const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  isSaleActive: {
    type: Boolean,
    default: false
  },
  announcementText: {
    type: String,
    default: "Free Shipping & Delivery All Over India"
  },
  promoCode: {
    type: String,
    default: ""
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  heroTitle: {
    type: String,
    default: "Shivang's Bags Collection"
  },
  heroSubtitle: {
    type: String,
    default: "Your Perfect Travel & Style Companion"
  },
  disabledCategories: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
