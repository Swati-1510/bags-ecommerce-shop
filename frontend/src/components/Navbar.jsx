import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth, API_BASE } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const Navbar = () => {
  const { setCartOpen, cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  const [categoriesList, setCategoriesList] = useState([
    { name: 'Handbags', path: '/shop?category=Handbags' },
    { name: 'Tote Bags', path: '/shop?category=Tote+Bags' },
    { name: 'Sling Bags', path: '/shop?category=Sling+Bags' },
    { name: 'Laptop Backpacks', path: '/shop?category=Laptop+Backpacks' },
    { name: 'Laptop Sleeves', path: '/shop?category=Laptop+Sleeves' },
    { name: 'Wallets', path: '/shop?category=Wallets' },
    { name: 'Mini Wallets', path: '/shop?category=Mini+Wallets' }
  ]);

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
        setCategoriesList(combined.map(cat => ({
          name: cat,
          path: `/shop?category=${encodeURIComponent(cat)}`
        })));
      } catch (err) {
        console.error('Error fetching dynamic categories in Navbar:', err);
      }
    };
    fetchDynamicCategories();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings`);
        setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings in Navbar:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div 
        className="w-full text-[#FFFDFB] text-[10px] uppercase tracking-widest py-2.5 px-4 text-center font-body font-semibold flex items-center justify-center gap-1.5 z-45 relative transition-all duration-300"
        style={{
          background: settings?.isSaleActive 
            ? 'linear-gradient(90deg, #A82C15 0%, #D97706 50%, #A82C15 100%)' 
            : '#7A624E',
          boxShadow: settings?.isSaleActive ? '0 2px 12px rgba(217, 119, 6, 0.45)' : 'none',
          borderBottom: settings?.isSaleActive ? '1px solid rgba(255,255,255,0.15)' : 'none'
        }}
      >
        <span>{settings?.isSaleActive ? '✨' : '📍'}</span>
        <span className={settings?.isSaleActive ? 'animate-pulse tracking-[0.15em]' : ''}>
          {settings?.announcementText || "Free Shipping & Delivery All Over India"}
        </span>
      </div>
      <nav className="sticky top-0 z-40 w-full border-b border-stone-100 bg-white">
        <div className="w-full px-4 md:px-12 lg:px-16">
          <div className="flex h-20 items-center justify-between relative">
            
            {/* Left Column: Mobile menu & Desktop Left Links */}
            <div className="flex-1 flex items-center justify-start">
              {/* Mobile menu trigger */}
              <div className="flex md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-[#111111] hover:text-[#7A624E]"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Links - Left (Desktop) */}
              <div className="hidden md:flex md:items-center md:space-x-5 lg:space-x-8 font-body text-xs tracking-widest uppercase">
                <Link to="/shop" className="text-[#111111] hover:text-[#7A624E] transition-colors duration-300 whitespace-nowrap">
                  Shop All
                </Link>
                
                {/* Collections Dropdown */}
                <div 
                  className="relative py-6 cursor-pointer group"
                  onMouseEnter={() => setCollectionsDropdownOpen(true)}
                  onMouseLeave={() => setCollectionsDropdownOpen(false)}
                >
                  <span className="text-[#111111] hover:text-[#7A624E] transition-colors duration-300 whitespace-nowrap flex items-center gap-1">
                    Collections
                    <ChevronDown className="h-3 w-3 stroke-[2] transition-transform duration-300 group-hover:rotate-180" />
                  </span>
                  
                  {/* Floating Panel */}
                  <AnimatePresence>
                    {collectionsDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 top-full bg-[#FFFDFB] border border-stone-200 shadow-xl py-3 min-w-[220px] z-50 text-left"
                      >
                        {categoriesList.map((cat) => (
                          <Link 
                            key={cat.name}
                            to={cat.path}
                            className="block px-6 py-2.5 text-[10px] text-[#111111] hover:text-[#FFFDFB] hover:bg-[#7A624E] transition-all duration-200 tracking-widest uppercase font-semibold"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/contact" className="text-[#111111] hover:text-[#7A624E] transition-colors duration-300 whitespace-nowrap">
                  Contact
                </Link>
              </div>
            </div>

            {/* Center Column: Logo */}
            <div className="flex-1 flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 z-10 pointer-events-none">
              <Link to="/" className="flex items-center space-x-2 group pointer-events-auto">
                <Logo size={16} theme="light" />
              </Link>
            </div>

            {/* Right Column: Actions */}
            <div className="flex-1 flex items-center justify-end space-x-6">
              {/* Search Toggle */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-[#111111] hover:text-[#7A624E] transition-colors"
                >
                  <Search className="h-5 w-5 stroke-[1.5]" />
                </button>

                {/* Dropdown Search Form */}
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-4 w-72 bg-[#FFFDFB] border border-stone-200 p-4 shadow-xl z-50 text-left"
                    >
                      <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-[#111111] py-1">
                        <input
                          type="text"
                          placeholder="Search collections..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full border-b border-[#111111] bg-transparent py-1 text-sm text-[#111111] focus:outline-none"
                        />
                        <button type="submit" className="text-[#111111] ml-2">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User / Admin portal access */}
              {user ? (
                <div className="relative group hidden md:block">
                  <button className="flex items-center text-xs font-semibold tracking-wider text-[#111111] uppercase hover:text-[#7A624E] transition-colors duration-300">
                    <User className="h-5 w-5 stroke-[1.5] mr-1" />
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-[#FFFDFB] border border-stone-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-left py-2 font-body text-[10px] tracking-widest uppercase">
                    <Link to="/my-orders" className="block px-4 py-2 text-stone-600 hover:bg-stone-50 hover:text-[#7A624E]">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-stone-600 hover:bg-stone-50 hover:text-[#7A624E]">
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-[#E07A5F] hover:bg-stone-50"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center text-xs font-semibold tracking-wider text-[#111111] uppercase hover:text-[#7A624E] transition-colors duration-300"
                >
                  <User className="h-5 w-5 stroke-[1.5]" />
                </Link>
              )}

              {/* Shopping Bag Trigger */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-[#111111] hover:text-[#7A624E] transition-colors"
              >
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="absolute -right-2.5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#7A624E] text-[10px] font-semibold text-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer (CSS Transition based) */}
      {/* Backdrop Overlay */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className="fixed inset-0 z-40 md:hidden"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {/* Sidebar Drawer Panel */}
      <div
        className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col p-6 md:hidden"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Logo size={12} theme="light" />
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-[#111111]">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col space-y-5 text-base font-heading tracking-widest uppercase mb-12 text-left">
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7A624E] border-b border-stone-50 pb-2">Shop All</Link>
          
          {/* Mobile Accordion */}
          <div className="border-b border-stone-50 pb-2">
            <button 
              onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
              className="w-full flex items-center justify-between hover:text-[#7A624E] uppercase tracking-widest font-heading text-base text-left focus:outline-none"
            >
              <span>Collections</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileCollectionsOpen ? 'rotate-180 text-[#7A624E]' : ''}`} />
            </button>
            
            <AnimatePresence>
              {mobileCollectionsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-4 pt-3 flex flex-col space-y-3.5 normal-case font-body text-xs text-stone-500 tracking-wider"
                >
                  {categoriesList.map((cat) => (
                    <Link 
                      key={cat.name} 
                      to={cat.path} 
                      onClick={() => { setMobileMenuOpen(false); setMobileCollectionsOpen(false); }}
                      className="hover:text-[#7A624E] transition-colors uppercase text-[10px]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#7A624E] border-b border-stone-50 pb-2">Contact</Link>
          {isAdmin && (
            <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-[#C5A880] border-b border-stone-50 pb-2">Admin Dashboard</Link>
          )}
        </div>

        <div className="mt-auto border-t border-stone-100 pt-6">
          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-[#111111] font-medium">Logged in as {user.name}</span>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center text-[#E07A5F] text-sm uppercase tracking-wider font-semibold">
                <LogOut className="h-4.5 w-4.5 mr-2" /> Log out
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center bg-[#111111] py-3 text-center text-sm font-semibold tracking-wider text-white uppercase hover:bg-[#7A624E] transition-colors duration-300">
              Log In
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
