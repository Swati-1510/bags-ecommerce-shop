import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import { API_BASE } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);

  // Extract category and search query from URL parameters
  const currentCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `${API_BASE}/products`;
        const params = [];
        if (currentCategory && currentCategory !== 'All') {
          params.push(`category=${encodeURIComponent(currentCategory)}`);
        }
        if (searchQuery) {
          params.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        const res = await axios.get(url);
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please check connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, searchQuery]);

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const [categories, setCategories] = useState(['All', 'Handbags', 'Tote Bags', 'Sling Bags', 'Laptop Backpacks', 'Laptop Sleeves', 'Wallets', 'Mini Wallets']);

  useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const [prodRes, settRes] = await Promise.all([
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/settings`)
        ]);
        const disabled = settRes.data?.disabledCategories || [];
        const fetchedCats = prodRes.data.map(p => p.category).filter(Boolean);
        const defaults = ['Handbags', 'Tote Bags', 'Sling Bags', 'Laptop Backpacks', 'Laptop Sleeves', 'Wallets', 'Mini Wallets'];
        const combined = Array.from(new Set([...defaults, ...fetchedCats])).filter(c => !disabled.includes(c));
        setCategories(['All', ...combined]);
      } catch (err) {
        console.error('Error fetching dynamic categories in ProductCatalog:', err);
      }
    };
    fetchDynamicCategories();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    return 0;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <div className="bg-[#FFFDFB] min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Catalog Title */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-light tracking-widest text-[#111111] uppercase">
          {searchQuery ? `Search Results: "${searchQuery}"` : `${currentCategory} Bags`}
        </h1>
        <p className="mt-2 text-xs font-body tracking-wider text-[#707070] uppercase">
          Discover high-end luxury pieces tailored for durability and design
        </p>
      </div>

      {/* Category Navigation & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 mb-12 pb-2 gap-4">
        {/* Category Tabs */}
        {!searchQuery ? (
          <div className="flex flex-nowrap items-center space-x-6 overflow-x-auto scrollbar-none pb-2 pt-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`pb-1.5 text-xs font-semibold tracking-widest uppercase border-b-2 transition-all duration-300 flex-shrink-0 cursor-pointer whitespace-nowrap ${
                  currentCategory === cat
                    ? 'border-[#7A624E] text-[#111111]'
                    : 'border-transparent text-[#707070] hover:text-[#111111]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}

        {/* Sort Select */}
        <div className="flex items-center space-x-3 text-xs font-body uppercase text-stone-500 self-end sm:self-auto relative">
          <span>Sort By:</span>
          <div className="relative w-44">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="w-full flex items-center justify-between border border-stone-200 bg-[#FFFDFB] text-[#111111] px-3 py-1.5 text-xs font-semibold rounded-xs tracking-wider focus:border-[#7A624E] focus:outline-none transition-colors duration-300"
            >
              <span>
                {sortBy === 'priceAsc' ? 'Price: Low to High' : sortBy === 'priceDesc' ? 'Price: High to Low' : 'Default'}
              </span>
              <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortOpen && (
              <>
                {/* Backdrop toggle closer */}
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                
                {/* Menu list */}
                <div className="absolute right-0 mt-1 w-full bg-[#FFFDFB] border border-stone-200 shadow-md z-20 rounded-xs overflow-hidden font-body text-[11px] tracking-wider py-1 text-left">
                  {[
                    { value: 'default', label: 'Default' },
                    { value: 'priceAsc', label: 'Price: Low to High' },
                    { value: 'priceDesc', label: 'Price: High to Low' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors uppercase font-semibold block ${
                        sortBy === option.value
                          ? 'text-[#7A624E] bg-stone-50/50'
                          : 'text-[#111111]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] w-full bg-stone-100 rounded-sm" />
              <div className="h-4 bg-stone-100 w-1/3 rounded-sm" />
              <div className="h-6 bg-stone-100 w-2/3 rounded-sm" />
              <div className="h-4 bg-stone-100 w-1/4 rounded-sm" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-xs font-body text-[#E07A5F]">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 font-heading text-lg italic text-[#707070]">
          No luxury bags found in this collection.
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10"
        >
          {sortedProducts.map((product) => (
            <motion.div key={product._id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ProductCatalog;
