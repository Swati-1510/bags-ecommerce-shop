const Product = require('../models/Product');
const StoreSettings = require('../models/StoreSettings');
const { uploadImage } = require('../config/cloudinary');

/**
 * Fetch all products, with optional filtering and keyword search
 * GET /api/products
 */
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Filter by category if specified and not 'All'
    if (category && category !== 'All') {
      query.category = category;
    }

    // Full-text regex search on name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Fetch single product details
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      return res.json(product);
    } else {
      return res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new product listing (Admin only)
 * POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, stockCount, colors } = req.body;
    let imageUrls = [];

    let parsedColors = [];
    if (colors) {
      try {
        parsedColors = JSON.parse(colors);
      } catch (err) {
        console.error("Failed to parse colors JSON:", err);
      }
    }

    // Separate main images from per-color images
    const allFiles = req.files || (req.file ? [req.file] : []);
    const mainImageFiles = allFiles.filter(f => f.fieldname === 'images');
    const colorImageFiles = allFiles.filter(f => f.fieldname.startsWith('colorImage_'));

    // Upload main product images
    if (mainImageFiles.length > 0) {
      for (const file of mainImageFiles) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (imageUrls.length === 0) {
      imageUrls.push('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800');
    }

    // Upload per-color images and attach to the correct color by index
    for (const file of colorImageFiles) {
      const match = file.fieldname.match(/^colorImage_(\d+)$/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (parsedColors[idx] !== undefined) {
          const url = await uploadImage(file);
          if (url) parsedColors[idx].image = url;
        }
      }
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      images: imageUrls,
      category,
      colors: parsedColors,
      stockCount: Number(stockCount || 0)
    });

    const createdProduct = await product.save();
    return res.status(201).json(createdProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update product characteristics (Admin only)
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, stockCount, existingImages, colors } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? Number(price) : product.price;

      // If originalPrice is empty string or explicitly unset, clear it from product
      if (originalPrice === '') {
        product.originalPrice = undefined;
      } else if (originalPrice !== undefined) {
        product.originalPrice = Number(originalPrice);
      }

      product.category = category || product.category;
      product.stockCount = stockCount !== undefined ? Number(stockCount) : product.stockCount;

      // Parse and update colors
      let parsedColors = product.colors || [];
      if (colors !== undefined) {
        try {
          parsedColors = colors ? JSON.parse(colors) : [];
        } catch (err) {
          console.error("Failed to parse updated colors:", err);
        }
      }

      // Separate main images from per-color images
      const allFiles = req.files || (req.file ? [req.file] : []);
      const mainImageFiles = allFiles.filter(f => f.fieldname === 'images');
      const colorImageFiles = allFiles.filter(f => f.fieldname.startsWith('colorImage_'));

      // Upload per-color images and attach to correct color by index
      for (const file of colorImageFiles) {
        const match = file.fieldname.match(/^colorImage_(\d+)$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          if (parsedColors[idx] !== undefined) {
            const url = await uploadImage(file);
            if (url) parsedColors[idx].image = url;
          }
        }
      }

      product.colors = parsedColors;

      // Handle main product images
      let imageUrls = [];
      if (existingImages) {
        imageUrls = Array.isArray(existingImages) ? [...existingImages] : [existingImages];
      }

      if (mainImageFiles.length > 0) {
        for (const file of mainImageFiles) {
          const url = await uploadImage(file);
          if (url) imageUrls.push(url);
        }
      }

      if (imageUrls.length > 0) {
        product.images = imageUrls;
      }

      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Remove product from DB (Admin only)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      return res.json({ message: 'Product removed successfully.' });
    } else {
      return res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a category and reassign all its products to another category (Admin only)
 * DELETE /api/products/categories/:categoryName
 */
const deleteCategory = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.categoryName);
    const { reassignTo = 'Handbags' } = req.query;

    const result = await Product.updateMany(
      { category: categoryName },
      { $set: { category: reassignTo } }
    );

    // Persist deleted category into StoreSettings disabledCategories array
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }
    if (!settings.disabledCategories.includes(categoryName)) {
      settings.disabledCategories.push(categoryName);
      await settings.save();
    }

    return res.json({
      message: `Category '${categoryName}' deleted successfully. ${result.modifiedCount} products reassigned to '${reassignTo}'.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Rename a category across all products (Admin only)
 * PUT /api/products/categories/rename
 */
const renameCategory = async (req, res) => {
  try {
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      return res.status(400).json({ message: 'Both oldName and newName are required.' });
    }

    const result = await Product.updateMany(
      { category: oldName },
      { $set: { category: newName.trim() } }
    );

    return res.json({
      message: `Category '${oldName}' renamed to '${newName.trim()}'. ${result.modifiedCount} products updated.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteCategory,
  renameCategory
};
