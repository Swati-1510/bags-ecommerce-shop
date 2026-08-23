import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';
  const getProductImage = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return DEFAULT_PLACEHOLDER;
    return imagePath.startsWith('http') ? imagePath : `${API_ASSET}${imagePath}`;
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
           {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 backdrop-blur-xs"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-full flex-col shadow-2xl sm:max-w-md"
            style={{ backgroundColor: '#FFFDFB' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-stone-100 p-6">
              <h2 className="font-heading text-xl font-semibold tracking-wider text-[#111111] uppercase">
                Shopping Bag
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-[#111111] hover:opacity-75 transition-opacity"
              >
                <X className="h-6 w-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Drawer Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                  <span className="font-heading text-lg italic text-[#707070]">
                    Your shopping bag is empty
                  </span>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="border border-[#111111] px-6 py-2.5 text-xs font-semibold tracking-widest text-[#111111] uppercase hover:bg-[#111111] hover:text-white transition-all duration-300"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product} className="flex space-x-4 border-b border-stone-100 pb-6">
                    {/* Item Image */}
                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-stone-50">
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_PLACEHOLDER;
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between text-sm font-semibold tracking-wide text-[#111111]">
                          <h3 className="font-heading">{item.name}</h3>
                          <span>₹{item.price.toLocaleString()}</span>
                        </div>
                        {item.color && (
                          <p className="mt-0.5 text-[10px] text-stone-500 font-body tracking-wider uppercase">Color: {item.color}</p>
                        )}
                        <p className="mt-1 text-xs text-[#707070]">Qty: {item.quantity}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-stone-200">
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity - 1, item.color)}
                            className="p-1 px-2.5 text-stone-600 hover:bg-stone-50 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-[#111111]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity + 1, item.color)}
                            className="p-1 px-2.5 text-stone-600 hover:bg-stone-50 transition-colors"
                            disabled={item.quantity >= item.stockCount}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product, item.color)}
                          className="flex items-center text-xs text-[#E07A5F] hover:text-red-700 transition-colors space-x-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-stone-100 p-6 space-y-4">
                <div className="flex justify-between text-base font-semibold tracking-wide text-[#111111]">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#707070] italic">
                  Shipping and taxes calculated at checkout.
                </p>

                <button
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center space-x-2 bg-[#7A624E] py-4 text-center text-sm font-semibold tracking-widest text-white uppercase hover:bg-[#5f4b3c] transition-colors duration-300"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
