import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../../context/AuthContext';

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      name: 'Handbags',
      description: 'Exquisite designs that blend style with daily functionality',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      link: '/shop?category=Handbags'
    },
    {
      name: 'Tote Bags',
      description: 'Spacious, versatile, and elegant totes built for modern life',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      link: '/shop?category=Tote+Bags'
    },
    {
      name: 'Laptop Backpacks',
      description: 'Ergonomic security and smart storage for your workspace',
      image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800',
      link: '/shop?category=Laptop+Backpacks'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE}/settings`),
          axios.get(`${API_BASE}/products`)
        ]);
        setSettings(settingsRes.data);
        
        // Filter products that have originalPrice > price
        const onSale = productsRes.data.filter(p => p.originalPrice && p.originalPrice > p.price);
        setSaleProducts(onSale);
      } catch (err) {
        console.error('Error fetching home configs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#FFFDFB] overflow-x-hidden">
      {/* Hero Banner Section */}
      <div className="relative flex h-[85vh] w-full items-center justify-center bg-stone-900">
        {/* Animated Background Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.65, scale: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1600')"
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 px-4 text-center text-white">
          {settings?.isSaleActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-block text-white text-[9px] uppercase font-bold tracking-[0.3em] px-4 py-2 mb-6 rounded-xs"
              style={{
                background: 'linear-gradient(135deg, #A82C15 0%, #D97706 100%)',
                boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)'
              }}
            >
              🎉 FESTIVE SALE ACTIVE 🎉
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-body text-xs font-semibold tracking-[0.4em] uppercase text-[#C5A880]"
          >
            {settings?.heroSubtitle || "Your Perfect Travel & Style Companion"}
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-4 font-heading text-4xl font-light tracking-[0.2em] sm:text-6xl uppercase font-bold"
          >
            {settings?.heroTitle || "Shivang's Bags Collection"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mx-auto mt-6 max-w-lg font-body text-sm font-light tracking-wide text-stone-200"
          >
            {settings?.isSaleActive 
              ? `Festive Season Offer is Live! Use promo code ${settings?.promoCode || 'SALE'} for an extra ${settings?.discountPercentage || 0}% discount at checkout!`
              : "Shivang's Bags Collection brings durable, stylish, and high-quality bags directly to you online. Discover our curated collections built for your everyday journey."
            }
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-10"
          >
            <Link
              to="/shop"
              className="inline-block bg-[#7A624E] px-8 py-4 text-xs font-semibold tracking-widest uppercase text-white hover:bg-[#5f4b3c] transition-all duration-300 transform hover:scale-105"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Dynamic Promotion Highlight Card */}
      {settings?.isSaleActive && (
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div 
            className="relative overflow-hidden px-6 py-12 shadow-xl sm:px-12 md:py-16 text-center border border-amber-500/20"
            style={{
              background: 'radial-gradient(circle, #25120C 0%, #111111 100%)'
            }}
          >
            {/* Elegant Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-[#D97706]/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <span 
                className="inline-block text-[10px] font-bold tracking-[0.3em] text-[#D97706] uppercase px-4 py-2 border border-[#D97706]/35 rounded-xs"
                style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
              >
                ✨ Special Festive Event ✨
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-wider text-[#FFFDFB] uppercase">
                {settings?.promoCode ? `${settings.promoCode} IS LIVE` : 'FESTIVE OFFER ACTIVE'}
              </h2>
              <p className="font-body text-stone-300 text-xs sm:text-sm tracking-wide leading-relaxed font-light">
                Celebrate the season with exclusive pricing on our premium bag collections. Use promo code <span className="font-bold text-[#D97706] px-2 py-0.5 border border-[#D97706]/30 uppercase tracking-widest" style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>{settings?.promoCode || 'SALE'}</span> at checkout to claim your extra <span className="font-bold text-white text-base">{settings?.discountPercentage || 0}% OFF</span> on your entire cart!
              </p>
              <div className="pt-4">
                <Link
                  to="/shop"
                  className="inline-block bg-[#D97706] hover:bg-[#B23B22] text-white px-8 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-md"
                >
                  Shop the Sale
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Collection Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase">
            Curated Categories
          </h2>
          <p className="mt-2 text-xs font-body tracking-wider text-[#707070] uppercase">
            Tailored shapes for every expression
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              className="group relative flex flex-col items-center bg-transparent"
            >
              {/* Category Image Box */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FFFDFB]">
                <Link to={cat.link}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </Link>
                {/* Overlay shadow */}
                <div className="absolute inset-0 bg-[#111111]/15 group-hover:bg-[#111111]/30 transition-colors duration-500" />
                
                {/* Category Button */}
                <div className="absolute bottom-6 left-6 right-6">
                  <Link
                    to={cat.link}
                    className="block w-full bg-[#FFFDFB]/90 py-3.5 text-center text-xs font-semibold tracking-widest text-[#111111] uppercase backdrop-blur-xs group-hover:bg-[#7A624E] group-hover:text-white transition-all duration-300"
                  >
                    Shop {cat.name}
                  </Link>
                </div>
              </div>

              {/* Category Info */}
              <div className="mt-4 text-center">
                <h3 className="font-heading text-lg font-semibold tracking-wider text-[#111111]">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-[#707070] font-body">
                  {cat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Seasonal Promo Showcase */}
      <section className="bg-stone-50 py-20 border-y border-stone-150">
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 aspect-square overflow-hidden bg-[#FFFDFB]">
            <img
              src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800"
              alt="Luxury leather craftsmanship details"
              className="w-full h-full object-cover rounded-xs"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-6 text-left">
            <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase">
              The Artisan Legacy
            </span>
            <h2 className="font-heading text-3xl font-semibold tracking-wide text-[#111111]">
              Crafted To Live Through Time
            </h2>
            <p className="font-body text-sm leading-relaxed text-[#707070] font-light">
              Every S3 piece is built with precision, durability, and style in mind. As a trusted local shop, we bring high-quality, long-lasting bags directly to our customers. Our collections are designed to accompany you through every occasion with timeless appeal.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-block border border-[#111111] px-6 py-3 text-xs font-semibold tracking-widest uppercase text-[#111111] hover:bg-[#111111] hover:text-white transition-all duration-300"
              >
                Discover The Craft
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Festive Specials Sale Section */}
      {settings?.isSaleActive && saleProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-stone-150">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-widest text-[#E07A5F] uppercase bg-[#E07A5F]/10 px-3 py-1.5 rounded-sm">
              Limited Time Deals
            </span>
            <h2 className="font-heading text-3xl font-light tracking-wider text-[#111111] uppercase mt-4">
              Festive Sale Specials
            </h2>
            <p className="font-body text-xs text-[#707070] tracking-wider uppercase mt-1">
              Premium selections on limited discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {saleProducts.map((product) => {
              const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
              return (
                <div key={product._id} className="group flex flex-col bg-white border border-stone-200 p-4 relative shadow-xs">
                  {/* Sale Badge */}
                  {discountPercent > 0 && (
                    <span className="absolute left-6 top-6 bg-[#E07A5F] text-[#FFFDFB] text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 z-10 shadow-sm rounded-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                  
                  {/* Product Image */}
                  <div className="aspect-[4/5] w-full overflow-hidden bg-stone-50 mb-5 relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-xs"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="text-left space-y-2.5">
                    <div>
                      <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">{product.name}</h3>
                      <span className="text-[9px] text-[#707070] uppercase font-bold tracking-widest">{product.category}</span>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-bold text-[#E07A5F]">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-stone-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link
                        to="/shop"
                        className="block w-full bg-[#111111] hover:bg-[#7A624E] text-[#FFFDFB] text-[10px] uppercase font-bold tracking-widest py-3 text-center transition-colors rounded-xs"
                      >
                        View Collection
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
