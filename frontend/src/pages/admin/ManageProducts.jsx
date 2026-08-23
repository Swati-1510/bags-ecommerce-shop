import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, Upload, ToggleLeft, ToggleRight, Tag, Palette, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Handbags');
  const [customCategory, setCustomCategory] = useState('');
  const [stockCount, setStockCount] = useState('10');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Colors states
  const [colors, setColors] = useState([]);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#7A624E');
  // colorImageFiles: { [index]: File } — pending uploads for each color
  const [colorImageFiles, setColorImageFiles] = useState({});

  // Category Manager State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [renamingCat, setRenamingCat] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [deletingCat, setDeletingCat] = useState(null);
  const [reassignTarget, setReassignTarget] = useState('Handbags');
  const [disabledCategories, setDisabledCategories] = useState([]);

  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';
  const getProductImage = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return DEFAULT_PLACEHOLDER;
    return imagePath.startsWith('http') ? imagePath : `${API_ASSET}${imagePath}`;
  };

  const fetchDisabledCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/settings`);
      setDisabledCategories(res.data?.disabledCategories || []);
    } catch (err) {
      console.error('Error fetching disabled categories:', err);
    }
  };

  useEffect(() => {
    fetchDisabledCategories();
  }, []);

  const categoriesWithCounts = React.useMemo(() => {
    const defaultCats = ['Handbags', 'Tote Bags', 'Sling Bags', 'Laptop Backpacks', 'Laptop Sleeves', 'Wallets', 'Mini Wallets'];
    const map = new Map();
    defaultCats.forEach(cat => {
      if (!disabledCategories.includes(cat)) {
        map.set(cat, 0);
      }
    });

    products.forEach(p => {
      if (p.category && !disabledCategories.includes(p.category)) {
        map.set(p.category, (map.get(p.category) || 0) + 1);
      }
    });

    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [products, disabledCategories]);

  const handleRenameCategory = async (oldName) => {
    if (!newCatName.trim() || newCatName.trim() === oldName) {
      setRenamingCat(null);
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_BASE}/products/categories/rename`,
        { oldName, newName: newCatName.trim() },
        { headers }
      );
      setRenamingCat(null);
      setNewCatName('');
      fetchProducts();
      fetchDisabledCategories();
    } catch (err) {
      console.error('Error renaming category:', err);
      alert(err.response?.data?.message || 'Error renaming category.');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const catObj = categoriesWithCounts.find(c => c.name === categoryName);
      const hasBags = catObj && catObj.count > 0;
      const url = hasBags
        ? `${API_BASE}/products/categories/${encodeURIComponent(categoryName)}?reassignTo=${encodeURIComponent(reassignTarget)}`
        : `${API_BASE}/products/categories/${encodeURIComponent(categoryName)}`;

      await axios.delete(url, { headers });
      setDeletingCat(null);
      fetchProducts();
      fetchDisabledCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.message || 'Error deleting category.');
    }
  };

  const handleRestoreCategory = async (categoryName) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const newDisabled = disabledCategories.filter(c => c !== categoryName);
      await axios.put(
        `${API_BASE}/settings`,
        { disabledCategories: newDisabled },
        { headers }
      );
      setDisabledCategories(newDisabled);
      fetchProducts();
    } catch (err) {
      console.error('Error restoring category:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory('Handbags');
    setCustomCategory('');
    setStockCount('10');
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setColors([]);
    setColorName('');
    setColorHex('#7A624E');
    setColorImageFiles({});
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price ? product.price.toString() : '');
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setCategory(product.category || 'Handbags');
    setCustomCategory('');
    setStockCount(product.stockCount !== undefined ? product.stockCount.toString() : '10');
    setSelectedFile(null);
    setPreviewUrl(getProductImage(product.images && product.images[0]));
    setError('');
    setColors(Array.isArray(product.colors) ? product.colors : []);
    setColorName('');
    setColorHex('#7A624E');
    setColorImageFiles({});
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleToggleStock = async (product) => {
    const newStock = product.stockCount === 0 ? 15 : 0;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${API_BASE}/products/${product._id}`,
        { stockCount: newStock },
        { headers }
      );
      setProducts(prev => prev.map(p => p._id === product._id ? res.data : p));
    } catch (err) {
      console.error('Error toggling stock status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE}/products/${id}`, { headers });
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleAddColor = () => {
    const trimmedName = colorName.trim();
    if (!trimmedName) return;
    // Prevent duplicate color names
    if (colors.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) return;
    setColors(prev => [...prev, { name: trimmedName, hex: colorHex, image: '' }]);
    setColorName('');
    setColorHex('#7A624E');
  };

  const handleRemoveColor = (index) => {
    setColors(prev => prev.filter((_, i) => i !== index));
    // Also clean up any pending file for this color and re-index higher ones
    setColorImageFiles(prev => {
      const updated = {};
      Object.entries(prev).forEach(([key, val]) => {
        const k = parseInt(key, 10);
        if (k < index) updated[k] = val;
        else if (k > index) updated[k - 1] = val; // shift indices down
      });
      return updated;
    });
  };

  const handleColorImageChange = (index, file) => {
    if (!file) return;
    setColorImageFiles(prev => ({ ...prev, [index]: file }));
  };

  // Helper to get the preview URL for a color pill
  const getColorPreview = (color, index) => {
    if (colorImageFiles[index]) return URL.createObjectURL(colorImageFiles[index]);
    if (color.image) return getProductImage(color.image);
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const finalCategory = category === 'CUSTOM' ? (customCategory.trim() || 'Handbags') : category;
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('originalPrice', originalPrice);
      formData.append('category', finalCategory);
      formData.append('stockCount', stockCount);
      formData.append('colors', JSON.stringify(colors));
      // Append any per-color image files with field name colorImage_<index>
      Object.entries(colorImageFiles).forEach(([idx, file]) => {
        formData.append(`colorImage_${idx}`, file);
      });
      if (selectedFile) {
        formData.append('images', selectedFile);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      if (editingProduct) {
        // Update product
        const res = await axios.put(
          `${API_BASE}/products/${editingProduct._id}`,
          formData,
          { headers }
        );
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data : p));
      } else {
        // Create product
        const res = await axios.post(`${API_BASE}/products`, formData, { headers });
        setProducts(prev => [res.data, ...prev]);
      }

      setModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Error occurred while saving product details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 text-left font-body">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-light tracking-wider text-[#111111] uppercase">
            Manage Products
          </h1>
          <p className="mt-1 text-xs text-[#707070] tracking-wider uppercase">
            Add, update, or remove bag collections inside the storefront
          </p>
        </div>
        
        <div className="flex items-center space-x-4 self-end sm:self-auto w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search products (Name, category...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 border border-stone-200 bg-white px-3 py-2.5 text-xs font-body tracking-wider placeholder-stone-400 focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs"
          />
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center space-x-2 border border-[#111111] bg-white px-4 py-3.5 text-xs font-semibold tracking-widest text-[#111111] uppercase hover:bg-[#111111] hover:text-white transition-all duration-300 flex-shrink-0 rounded-xs cursor-pointer"
          >
            <Tag className="h-4 w-4" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-[#7A624E] px-5 py-3.5 text-xs font-semibold tracking-widest text-white uppercase hover:bg-[#5f4b3c] transition-all duration-300 flex-shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Bag</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-stone-100 rounded-sm" />
          <div className="h-24 bg-stone-100 rounded-sm" />
          <div className="h-24 bg-stone-100 rounded-sm" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 text-xs text-[#707070] uppercase tracking-widest font-semibold italic">
          {products.length === 0 ? "No products found in shop catalogue." : "No products found matching search query."}
        </div>
      ) : (
        <div className="overflow-x-auto border border-stone-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-stone-200 text-left text-xs font-body tracking-wider uppercase">
            <thead className="bg-stone-50 font-semibold text-[#111111]">
              <tr>
                <th className="px-6 py-4">Product details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Stock status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-4 normal-case">
                    <img
                      src={getProductImage(product.images && product.images[0])}
                      alt={product.name || 'Bag'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PLACEHOLDER;
                      }}
                      className="h-12 w-9 object-cover bg-stone-50 rounded-xs"
                    />
                    <div>
                      <p className="font-semibold text-[#111111] font-heading text-sm">{product.name}</p>
                      <p className="text-[10px] text-stone-400 font-body uppercase mt-0.5">ID: {product._id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-stone-500">{product.category}</td>
                  <td className="px-6 py-4 font-semibold text-[#111111]">
                    <div>₹{Number(product.price || 0).toLocaleString('en-IN')}</div>
                    {product.originalPrice && Number(product.originalPrice) > 0 ? (
                      <div className="text-[10px] text-stone-400 line-through mt-0.5">
                        ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                        product.stockCount === 0 
                          ? 'bg-[#E07A5F]/10 text-[#E07A5F]' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {product.stockCount === 0 ? 'Out of Stock' : `${product.stockCount} Units`}
                      </span>
                      <button
                        onClick={() => handleToggleStock(product)}
                        className="text-stone-400 hover:text-[#7A624E] transition-colors"
                        title="Toggle stock status"
                      >
                        {product.stockCount === 0 ? (
                          <ToggleLeft className="h-6 w-6 stroke-[1.5]" />
                        ) : (
                          <ToggleRight className="h-6 w-6 text-[#7A624E] stroke-[1.5]" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3.5">
                    <button
                      onClick={() => openEditModal(product)}
                      className="inline-flex text-stone-400 hover:text-[#7A624E] transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="inline-flex text-[#E07A5F] hover:text-red-700 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-50 backdrop-blur-xs animate-in fade-in duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />

          {/* Modal Dialog */}
          <div
            className="fixed inset-0 z-50 m-auto flex h-fit max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto scrollbar-none p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
            style={{ backgroundColor: '#FFFDFB' }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-150 mb-6">
              <h3 className="font-heading text-lg font-semibold tracking-wider text-[#111111] uppercase">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-[#E07A5F]/10 border border-[#E07A5F] p-3 text-center text-xs text-[#E07A5F]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-body tracking-wider uppercase text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-600">Product Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full border border-stone-200 bg-white px-3 py-2.5 focus:border-[#7A624E] focus:outline-none transition-colors normal-case"
                      placeholder="Grand Satchel Bag"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#111111] text-xs uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                      }}
                      className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] text-[#111111] px-3 py-2.5 focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs cursor-pointer font-body text-xs uppercase tracking-wider"
                    >
                      <option value="Handbags" className="bg-[#FFFDFB] text-[#111111]">Handbags</option>
                      <option value="Tote Bags" className="bg-[#FFFDFB] text-[#111111]">Tote Bags</option>
                      <option value="Sling Bags" className="bg-[#FFFDFB] text-[#111111]">Sling Bags</option>
                      <option value="Laptop Backpacks" className="bg-[#FFFDFB] text-[#111111]">Laptop Backpacks</option>
                      <option value="Laptop Sleeves" className="bg-[#FFFDFB] text-[#111111]">Laptop Sleeves</option>
                      <option value="Wallets" className="bg-[#FFFDFB] text-[#111111]">Wallets</option>
                      <option value="Mini Wallets" className="bg-[#FFFDFB] text-[#111111]">Mini Wallets</option>
                      <option value="CUSTOM" className="bg-amber-100 text-[#7A624E] font-bold">+ Add New Custom Category...</option>
                    </select>

                    {category === 'CUSTOM' && (
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Type new category name (e.g. Duffel Bags)"
                        className="mt-2 block w-full border border-[#7A624E] bg-amber-50/50 px-3 py-2.5 text-xs text-[#111111] focus:outline-none rounded-xs font-body font-semibold"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-[#111111] text-xs uppercase tracking-wider">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-1 block w-full border border-stone-200 bg-white px-3 py-2.5 focus:border-[#7A624E] focus:outline-none transition-colors font-body text-xs"
                      placeholder="800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#111111] text-xs uppercase tracking-wider">Original MRP (₹) <span className="text-[10px] text-stone-400 font-normal">(Optional for Sale)</span></label>
                    <input
                      type="number"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="mt-1 block w-full border border-stone-200 bg-white px-3 py-2.5 focus:border-[#7A624E] focus:outline-none transition-colors font-body text-xs"
                      placeholder="1499 (Leave blank if no sale)"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#111111] text-xs uppercase tracking-wider">Initial Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stockCount}
                      onChange={(e) => setStockCount(e.target.value)}
                      className="mt-1 block w-full border border-stone-200 bg-white px-3 py-2.5 focus:border-[#7A624E] focus:outline-none transition-colors font-body text-xs"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-600">Product Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full border border-stone-200 bg-white px-3 py-2.5 focus:border-[#7A624E] focus:outline-none transition-colors normal-case"
                    placeholder="Describe materials, leather structures, shoulder straps details, compartments layouts..."
                  />
                </div>

                {/* Color Variants Section */}
                <div className="border border-stone-200 rounded-xs p-4 bg-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Palette className="h-4 w-4 text-[#7A624E]" />
                    <label className="font-bold text-[#111111] text-xs uppercase tracking-wider">Available Colour Variants</label>
                    <span className="text-[10px] text-stone-400 font-normal normal-case">(Optional)</span>
                  </div>

                  {/* Tip banner */}
                  <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xs px-3 py-2 text-[10px] text-amber-800 leading-relaxed normal-case font-body">
                    <strong>Tip:</strong> Add <em>all</em> available colours here — including the main bag colour shown in the product photo. For the main colour, just pick its name &amp; hex and skip uploading a separate image; the main product photo will be used automatically.
                  </div>

                  {/* Added Colors Pills */}
                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {colors.map((c, i) => {
                        const preview = getColorPreview(c, i);
                        return (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 border border-stone-200 bg-stone-50 px-2 py-1 rounded-xs text-[11px] font-semibold normal-case text-[#111111]"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-stone-300 flex-shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            {c.name}

                            {/* Per-color image upload */}
                            <label
                              htmlFor={`colorImg-${i}`}
                              className="relative cursor-pointer flex items-center"
                              title={preview ? 'Change colour image' : 'Upload colour image'}
                            >
                              {preview ? (
                                <img
                                  src={preview}
                                  alt={`${c.name} preview`}
                                  className="h-6 w-5 object-cover rounded-xs border border-stone-300 ml-1"
                                />
                              ) : (
                                <span className="ml-1 text-stone-400 hover:text-[#7A624E] transition-colors">
                                  <Camera className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <input
                                id={`colorImg-${i}`}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => handleColorImageChange(i, e.target.files[0])}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveColor(i)}
                              className="ml-0.5 text-stone-400 hover:text-[#E07A5F] transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Color Inputs */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded-xs border border-stone-200 p-0.5 bg-white"
                        title="Pick colour"
                      />
                    </div>
                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                      placeholder="Colour name (e.g. Caramel Brown)"
                      className="flex-1 border border-stone-200 bg-white px-3 py-2 text-xs text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors normal-case"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      disabled={!colorName.trim()}
                      className="flex-shrink-0 flex items-center gap-1.5 bg-[#7A624E] px-3 py-2 text-[10px] font-bold tracking-wider text-white uppercase hover:bg-[#5f4b3c] disabled:opacity-40 transition-all duration-200 rounded-xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-2">Product Image File</label>
                  <div className="relative border-2 border-dashed border-stone-300 rounded-sm hover:border-[#7A624E] transition-colors bg-white">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="py-6 px-4 flex flex-col items-center justify-center text-center space-y-2">
                      {previewUrl ? (
                        <div className="relative h-20 w-16 overflow-hidden border border-stone-200 bg-stone-50">
                          <img src={previewUrl} alt="Preview upload" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <Upload className="h-6 w-6 text-stone-400" />
                      )}
                      
                      <div className="text-[10px] text-stone-500 font-semibold tracking-wider">
                        {selectedFile ? selectedFile.name : 'DRAG AND DROP OR CLICK TO CHOOSE IMAGE'}
                      </div>
                      <p className="text-[8px] text-stone-400">SUPPORTS JPG, PNG, WEBP (MAX 10MB)</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/3 border border-[#111111] py-3 text-xs font-semibold tracking-widest text-[#111111] uppercase hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#7A624E] py-3 text-xs font-semibold tracking-widest text-white uppercase hover:bg-[#5f4b3c] disabled:opacity-50 transition-all duration-300"
                  >
                    {isSubmitting ? 'Saving changes...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

      {/* Category Manager Modal */}
      {categoryModalOpen && (
        <>
          <div
            onClick={() => {
              setCategoryModalOpen(false);
              setDeletingCat(null);
              setRenamingCat(null);
            }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />

          <div
            className="fixed inset-0 z-50 m-auto flex h-fit max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto scrollbar-none p-6 shadow-2xl border border-stone-200 rounded-xs text-left"
            style={{ backgroundColor: '#FFFDFB' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-150 mb-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-[#7A624E]" />
                <h3 className="font-heading text-base font-bold tracking-wider text-[#111111] uppercase">
                  Manage Bag Categories
                </h3>
              </div>
              <button
                onClick={() => {
                  setCategoryModalOpen(false);
                  setDeletingCat(null);
                  setRenamingCat(null);
                }}
                className="text-stone-400 hover:text-[#111111]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4 font-body uppercase tracking-wider">
              Rename existing categories or remove unwanted custom category tabs from storefront dropdowns.
            </p>

            {/* Category List */}
            <div className="divide-y divide-stone-150 border border-stone-200 rounded-xs mb-4 bg-white max-h-64 overflow-y-auto scrollbar-none">
              {categoriesWithCounts.map(({ name, count }) => {
                const isDefault = ['Handbags', 'Tote Bags', 'Sling Bags', 'Laptop Backpacks', 'Laptop Sleeves', 'Wallets', 'Mini Wallets'].includes(name);

                return (
                  <div key={name} className="p-3.5 flex items-center justify-between gap-3 text-xs font-body uppercase">
                    {renamingCat === name ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="border border-[#7A624E] px-2 py-1 text-xs text-[#111111] focus:outline-none flex-1 normal-case font-semibold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameCategory(name)}
                          className="bg-[#7A624E] text-white px-3 py-1 text-[10px] font-bold tracking-wider rounded-xs uppercase"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRenamingCat(null)}
                          className="border border-stone-300 text-stone-600 px-2 py-1 text-[10px] rounded-xs uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-bold text-[#111111]">{name}</span>
                          <span className="ml-2 text-[10px] text-stone-400 font-semibold">({count} bags)</span>
                          {isDefault && (
                            <span className="ml-2 text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-xs font-bold">Standard</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setRenamingCat(name);
                              setNewCatName(name);
                            }}
                            className="text-stone-400 hover:text-[#7A624E] transition-colors p-1"
                            title="Rename Category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setDeletingCat(name)}
                            className="text-stone-400 hover:text-[#E07A5F] transition-colors p-1"
                            title="Remove Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Deletion Confirmation Modal Sub-Section */}
            {deletingCat && (() => {
              const catObj = categoriesWithCounts.find(c => c.name === deletingCat);
              const count = catObj ? catObj.count : 0;
              const hasBags = count > 0;

              return (
                <div className="bg-red-50/70 border border-red-200 p-4 rounded-xs text-xs font-body text-red-900 space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-red-800 uppercase tracking-wider">Confirm Delete: "{deletingCat}"</h4>
                    <button onClick={() => setDeletingCat(null)} className="text-red-400 hover:text-red-900">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {hasBags ? (
                    <>
                      <p className="text-[11px] leading-relaxed">
                        Removing category <strong>"{deletingCat}"</strong> will reassign all <strong>{count} bag(s)</strong> currently in this category to another active category so no products are lost.
                      </p>

                      <div>
                        <label className="block font-bold text-red-950 uppercase text-[10px] mb-1">Reassign Bags To:</label>
                        <select
                          value={reassignTarget}
                          onChange={(e) => setReassignTarget(e.target.value)}
                          className="w-full border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none"
                        >
                          {categoriesWithCounts
                            .filter(c => c.name !== deletingCat)
                            .map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] leading-relaxed">
                      Category <strong>"{deletingCat}"</strong> has <strong>0 bags</strong>. Removing this category will cleanly delete the category tab without requiring reassignment.
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setDeletingCat(null)}
                      className="w-1/3 border border-stone-300 bg-white py-1.5 text-[10px] font-bold uppercase text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(deletingCat)}
                      className="flex-1 bg-[#E07A5F] py-1.5 text-[10px] font-bold uppercase text-white hover:bg-red-700 transition-colors"
                    >
                      Confirm & Remove Category
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Disabled / Removed Categories Section */}
            {disabledCategories.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-200">
                <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Hidden / Removed Categories ({disabledCategories.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {disabledCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-2.5 py-1 text-[10px] text-stone-600 rounded-xs uppercase font-semibold"
                    >
                      <span className="line-through">{cat}</span>
                      <button
                        onClick={() => handleRestoreCategory(cat)}
                        className="text-[#7A624E] hover:underline font-bold ml-1 text-[9px]"
                        title="Restore Category"
                      >
                        Restore
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageProducts;
