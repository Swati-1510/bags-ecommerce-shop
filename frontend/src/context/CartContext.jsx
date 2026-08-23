import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Retrieve cart details from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('aura_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error parsing cart items:', err);
      }
    }
  }, []);

  // Sync cart contents to localStorage
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedColor = '') => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product === product._id && item.color === selectedColor);

      if (existingItem) {
        const potentialQty = existingItem.quantity + quantity;
        if (potentialQty > product.stockCount) {
          alert(`Stock limit reached. Only ${product.stockCount} units of this bag are currently available.`);
          return prevItems;
        }
        return prevItems.map((item) =>
          (item.product === product._id && item.color === selectedColor) ? { ...item, quantity: potentialQty } : item
        );
      }

      if (product.stockCount < quantity) {
        alert(`Stock limit reached. Only ${product.stockCount} units of this bag are currently available.`);
        return prevItems;
      }

      return [
        ...prevItems,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          color: selectedColor,
          image: product.images[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
          stockCount: product.stockCount
        }
      ];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId, color = '') => {
    setCartItems((prevItems) => prevItems.filter((item) => !(item.product === productId && item.color === color)));
  };

  const updateQuantity = (productId, quantity, color = '') => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product === productId && item.color === color) {
          if (quantity > item.stockCount) {
            alert(`Stock limit reached. Only ${item.stockCount} units are available.`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
