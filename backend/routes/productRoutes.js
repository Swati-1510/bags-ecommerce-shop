const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteCategory,
  renameCategory
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.delete('/categories/:categoryName', protect, adminOnly, deleteCategory);
router.put('/categories/rename', protect, adminOnly, renameCategory);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, upload.any(), createProduct);
router.put('/:id', protect, adminOnly, upload.any(), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
