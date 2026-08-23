import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';

  const getProductImage = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return DEFAULT_PLACEHOLDER;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_ASSET}${imagePath}`;
  };

  const isOutOfStock = product.stockCount === 0;

  return (
    <div className="group relative flex flex-col overflow-hidden bg-transparent">
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFFDFB]">
        <Link to={`/product/${product._id}`}>
          <img
            src={getProductImage(product.images && product.images[0])}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_PLACEHOLDER;
            }}
            className="h-full w-full object-cover object-center transform scale-100 hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
        
        {/* Out of Stock & Sale Badges */}
        {isOutOfStock ? (
          <div className="absolute left-3 top-3 bg-[#E07A5F] px-2.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase shadow-sm rounded-xs z-10">
            Sold Out
          </div>
        ) : (
          product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute left-3 top-3 bg-[#A82C15] text-[#FFFDFB] px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm rounded-xs z-10 flex items-center gap-1">
              <span>SALE</span>
              <span>•</span>
              <span>{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>
            </div>
          )
        )}

        {/* Hover Fast Add Action */}
        {!isOutOfStock && (
          <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <button
              onClick={() => addToCart(product, 1)}
              className="flex w-full items-center justify-center space-x-2 bg-[#111111]/90 py-3 text-center text-xs font-semibold tracking-widest text-white uppercase backdrop-blur-xs hover:bg-[#7A624E] transition-colors duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Bag</span>
            </button>
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="flex flex-col pt-4 pb-2 text-left">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase">
              {product.category}
            </span>
            <h3 className="mt-1 font-heading text-base font-semibold tracking-wide text-[#111111] group-hover:text-[#7A624E] transition-colors duration-300">
              <Link to={`/product/${product._id}`}>{product.name}</Link>
            </h3>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <span className="font-body text-sm font-semibold text-[#111111] block">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-body text-xs text-stone-400 line-through block mt-0.5">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
