import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { API_BASE } from '../../context/AuthContext';
import { Plus, Minus, ChevronDown, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorImage, setSelectedColorImage] = useState('');

  // Accordion drop-down state
  const [accordionOpen, setAccordionOpen] = useState({
    materials: true,
    care: false,
    shipping: false
  });

  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';
  const getProductImage = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return DEFAULT_PLACEHOLDER;
    return imagePath.startsWith('http') ? imagePath : `${API_ASSET}${imagePath}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE}/products/${id}`);
        setProduct(res.data);
        setSelectedImageIdx(0);
        setQuantity(1);

        // Auto-select the colour variant that corresponds to the main product image
        const colors = res.data.colors || [];
        const mainImg = res.data.images && res.data.images[0] ? res.data.images[0] : '';

        if (colors.length > 0) {
          // Priority 1: a colour whose uploaded image URL is the same as the main product photo
          const matchByUrl = colors.find(c => c.image && c.image === mainImg);
          // Priority 2: a colour with no dedicated image (it "uses" the main photo by default)
          const matchByEmpty = colors.find(c => !c.image);
          // Priority 3: just pick the first colour
          const autoSelect = matchByUrl || matchByEmpty || colors[0];

          setSelectedColor(autoSelect.name);
          setSelectedColorImage(autoSelect.image || '');
        } else {
          setSelectedColor('');
          setSelectedColorImage('');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Product not found or server is unreachable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedColor);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full bg-stone-100 rounded-sm" />
          <div className="flex space-x-4">
            <div className="h-20 w-20 bg-stone-100 rounded-sm" />
            <div className="h-20 w-20 bg-stone-100 rounded-sm" />
            <div className="h-20 w-20 bg-stone-100 rounded-sm" />
          </div>
        </div>
        <div className="space-y-6 pt-10">
          <div className="h-4 bg-stone-100 w-1/4" />
          <div className="h-10 bg-stone-100 w-3/4" />
          <div className="h-6 bg-stone-100 w-1/3" />
          <div className="h-24 bg-stone-100 w-full" />
          <div className="h-12 bg-stone-100 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center bg-[#FFFDFB]">
        <p className="font-heading text-xl italic text-[#707070]">{error || 'Product details missing.'}</p>
        <Link to="/shop" className="mt-6 inline-block bg-[#111111] px-6 py-3 text-xs font-semibold tracking-widest text-[#FFFDFB] uppercase hover:bg-[#7A624E] transition-colors">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockCount === 0;

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs font-body text-[#707070] tracking-wider uppercase">
          <Link to="/" className="hover:text-[#111111]">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-[#111111]">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-[#111111] font-semibold">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* LEFT: Multi-image thumb gallery layout */}
          <div className="flex flex-col space-y-4">
            
            {/* Main Image with Hover Zoom Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-50 border border-stone-100">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={getProductImage(
                    selectedColorImage || product.images[selectedImageIdx]
                  )}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-110"
                />
              </div>
            </div>

            {/* Thumbnail strip — colour thumbnails when colours exist, else main images */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {(product.colors || []).length > 0 ? (
                // When colour variants exist: one thumbnail per colour, no separate main-image thumbs
                (product.colors || []).map((color) => {
                  const thumbSrc = color.image || product.images[0];
                  const isActive = selectedColor === color.name;
                  return (
                    <button
                      key={`color-${color.name}`}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setSelectedColorImage(color.image || '');
                      }}
                      className={`relative h-20 w-16 flex-shrink-0 overflow-hidden border transition-all duration-300 ${
                        isActive ? 'border-[#7A624E] ring-1 ring-[#7A624E]' : 'border-stone-200'
                      }`}
                      title={color.name}
                    >
                      <img
                        src={getProductImage(thumbSrc)}
                        alt={color.name}
                        className="h-full w-full object-cover"
                      />
                      {/* Colour dot badge */}
                      <span
                        className="absolute bottom-1 right-1 h-3 w-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  );
                })
              ) : (
                // No colour variants: show product.images thumbnails
                product.images.map((img, idx) => (
                  <button
                    key={`main-${idx}`}
                    onClick={() => {
                      setSelectedImageIdx(idx);
                      setSelectedColorImage('');
                    }}
                    className={`relative h-20 w-16 flex-shrink-0 overflow-hidden border transition-all duration-300 ${
                      selectedImageIdx === idx ? 'border-[#7A624E] ring-1 ring-[#7A624E]' : 'border-stone-200'
                    }`}
                    title={`Image ${idx + 1}`}
                  >
                    <img
                      src={getProductImage(img)}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Detail information panel */}
          <div className="flex flex-col text-left">
            
            {/* Category header */}
            <span className="text-xs font-bold tracking-[0.25em] text-[#C5A880] uppercase">
              {product.category}
            </span>

            {/* Title & Right-aligned price tags */}
            <div className="flex justify-between items-start mt-2 pb-6 border-b border-stone-100">
              <h1 className="font-heading text-3xl font-semibold tracking-wide text-[#111111]">
                {product.name}
              </h1>
              <div className="text-right ml-4">
                <div className="flex flex-col items-end">
                  <span className="font-body text-2xl font-semibold text-[#111111]">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-body text-sm text-stone-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-[#A82C15]/10 text-[#A82C15] text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1.5">
                  {isOutOfStock ? 'Sold Out' : product.stockCount <= 3 ? `Only ${product.stockCount} left` : 'In Stock'}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="my-6 font-body text-sm font-light leading-relaxed text-[#707070]">
              {product.description}
            </p>

            {/* Color Swatch Selectors */}
            {(product.colors || []).length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-semibold tracking-wider text-[#111111] uppercase block mb-3 font-body">
                  {selectedColor
                    ? <>Selected Color: <span className="font-light text-stone-600">{selectedColor}</span></>
                    : <>Available Colors</>}
                </span>
                <div className="flex space-x-3.5">
                  {(product.colors || []).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setSelectedColorImage(color.image || '');
                      }}
                      className={`h-7 w-7 rounded-full transition-transform duration-300 relative flex items-center justify-center ${
                        selectedColor === color.name ? 'scale-110 ring-2 ring-[#7A624E] ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <span className="absolute block h-1.5 w-1.5 rounded-full bg-[#FFFDFB]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart button */}
            {!isOutOfStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8 font-body">
                
                {/* Quantity adjust */}
                <div className="flex items-center justify-between border border-stone-200 px-4 py-3.5 sm:w-32 bg-stone-50/50">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="text-stone-600 hover:text-[#111111] transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-[#111111] px-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stockCount, q + 1))}
                    className="text-stone-600 hover:text-[#111111] transition-colors"
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to bag button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center space-x-3 bg-[#7A624E] py-4 text-center text-sm font-semibold tracking-widest text-white uppercase hover:bg-[#5f4b3c] transition-all duration-300 transform"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Shopping Bag</span>
                </button>

              </div>
            )}

            {isOutOfStock && (
              <button
                disabled
                className="w-full bg-stone-200 py-4 text-center text-sm font-semibold tracking-widest text-stone-400 uppercase cursor-not-allowed mb-8"
              >
                Sold Out
              </button>
            )}

            {/* Accordions for Product Care details */}
            <div className="border-t border-stone-200 font-body">
              
              {/* Materials Accordion */}
              <div className="border-b border-stone-200 py-4">
                <button
                  onClick={() => toggleAccordion('materials')}
                  className="flex w-full items-center justify-between text-xs font-semibold tracking-wider text-[#111111] uppercase"
                >
                  <span>Materials & Craftsmanship</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${accordionOpen.materials ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {accordionOpen.materials && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs font-light leading-relaxed text-[#707070]">
                        Individually handcrafted from 100% full-grain calfskin leather sourced from tanneries in Tuscany. The interior is lined in soft, natural cotton-twill and equipped with an interior zippered pocket and brass hardware accents.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Care Instructions Accordion */}
              <div className="border-b border-stone-200 py-4">
                <button
                  onClick={() => toggleAccordion('care')}
                  className="flex w-full items-center justify-between text-xs font-semibold tracking-wider text-[#111111] uppercase"
                >
                  <span>Care Instructions</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${accordionOpen.care ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {accordionOpen.care && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs font-light leading-relaxed text-[#707070]">
                        Keep away from direct heat and water exposure. Clean with a soft, dry cloth. When not in use, store your bag in its provided AURA protective cotton dust pouch and stuff with tissue paper to preserve its structural profile.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns Accordion */}
              <div className="border-b border-stone-200 py-4">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="flex w-full items-center justify-between text-xs font-semibold tracking-wider text-[#111111] uppercase"
                >
                  <span>Shipping & Returns</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${accordionOpen.shipping ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {accordionOpen.shipping && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs font-light leading-relaxed text-[#707070]">
                        We offer complimentary express shipping worldwide. Orders are dispatched within 2 business days and arrive in 3-5 days. Returns or exchanges are accepted on all unused items within 14 days of delivery.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
