import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth, API_BASE } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Scroll to Top Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Components
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import AdminSidebar from './components/AdminSidebar';
import Logo from './components/Logo';

// Pages
import Home from './pages/shop/Home';
import ProductCatalog from './pages/shop/ProductCatalog';
import ProductDetail from './pages/shop/ProductDetail';
import Checkout from './pages/shop/Checkout';
import OrderSuccess from './pages/shop/OrderSuccess';
import Login from './pages/shop/Login';
import Register from './pages/shop/Register';
import Contact from './pages/shop/Contact';
import MyOrders from './pages/shop/MyOrders';
import Terms from './pages/shop/Terms';
import Privacy from './pages/shop/Privacy';
import Refund from './pages/shop/Refund';
import Shipping from './pages/shop/Shipping';

import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageQueries from './pages/admin/ManageQueries';
import StoreSettings from './pages/admin/StoreSettings';

import { LayoutDashboard, ShoppingBag, Receipt, LogOut, Menu, X, MessageSquare, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Client Storefront Layout
const ShopLayout = () => {
  const [footerCategories, setFooterCategories] = useState([
    'Handbags', 'Tote Bags', 'Sling Bags', 'Laptop Backpacks', 'Laptop Sleeves', 'Wallets', 'Mini Wallets'
  ]);

  React.useEffect(() => {
    const fetchFooterCategories = async () => {
      try {
        const [prodRes, settRes] = await Promise.all([
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/settings`)
        ]);
        const disabled = settRes.data?.disabledCategories || [];
        const fetchedCats = prodRes.data.map(p => p.category).filter(Boolean);
        const defaults = ['Handbags', 'Tote Bags', 'Sling Bags', 'Laptop Backpacks', 'Laptop Sleeves', 'Wallets', 'Mini Wallets'];
        const combined = Array.from(new Set([...defaults, ...fetchedCats])).filter(c => !disabled.includes(c));
        setFooterCategories(combined);
      } catch (err) {
        console.error('Error fetching categories in footer:', err);
      }
    };
    fetchFooterCategories();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDFB]">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <CartDrawer />
      
      {/* Premium Footer */}
      <footer className="bg-[#111111] text-[#FFFDFB] py-16 border-t border-stone-800 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Logo size={10} theme="dark" />
              </div>
              <p className="font-body text-xs font-light text-stone-400 max-w-xs leading-relaxed">
                Your trusted local shop bringing durable, stylish, and high-quality bags directly to you online.
              </p>
            </div>
            
            <div className="space-y-3.5 text-xs font-body tracking-wider uppercase text-stone-400">
              <h4 className="font-bold text-white mb-2">Explore Collections</h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {footerCategories.map(cat => (
                  <p key={cat}>
                    <Link to={`/shop?category=${encodeURIComponent(cat)}`} className="hover:text-[#C5A880] transition-colors">
                      {cat}
                    </Link>
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs font-body text-stone-400">
              <h4 className="font-bold text-white mb-2 uppercase tracking-wider">Store & Support</h4>
              <p className="leading-relaxed">
                Shop No. 3, Shivang's Bags Collection,<br/>
                Mohili Village, Sakinaka Pipeline,<br/>
                Mumbai 400072
              </p>
              <p className="pt-2">
                <span className="font-bold text-white">Call / WhatsApp:</span> +91 8451021245 / +91 8779269047
              </p>
              <p>
                <span className="font-bold text-white">Email:</span> s3bagscollection@gmail.com
              </p>
              <p className="pt-1 text-[11px] text-stone-400">
                <span className="font-bold text-white">Hours:</span> Mon - Sun: 11:00 AM to 11:00 PM
              </p>
            </div>

            <div className="space-y-3.5 text-xs font-body tracking-wider uppercase text-stone-400">
              <h4 className="font-bold text-white mb-2">Legal Policies</h4>
              <div className="flex flex-col space-y-2">
                <Link to="/terms" className="hover:text-[#C5A880] transition-colors">Terms & Conditions</Link>
                <Link to="/privacy" className="hover:text-[#C5A880] transition-colors">Privacy Policy</Link>
                <Link to="/refund" className="hover:text-[#C5A880] transition-colors">Refund & Cancellation Policy</Link>
                <Link to="/shipping" className="hover:text-[#C5A880] transition-colors">Shipping & Delivery</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-body text-stone-500 uppercase tracking-widest gap-4">
            <p>© 2026 S3 Fashion Gallery. All Rights Reserved.</p>
            <div className="flex items-center space-x-4">
              <p>Quality Bags for Every Occasion</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Admin Control Panel Layout with route guards
const AdminLayout = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center font-body text-xs tracking-widest uppercase">
        Verifying administrative session...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Manage Orders', path: '/admin/orders', icon: Receipt },
    { name: 'Customer Queries', path: '/admin/queries', icon: MessageSquare },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop Sidebar (visible on md and up) */}
      <AdminSidebar />

      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-stone-200 bg-white px-6 md:hidden">
        <div className="flex-1"></div>
        <Link to="/" className="flex flex-1 justify-center items-center space-x-2">
          <Logo size={10} theme="light" />
        </Link>
        <div className="flex flex-1 justify-end">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-xs border border-stone-200 p-1.5 text-stone-600 hover:bg-stone-50"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            />

            {/* Sidebar Slide-over */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col border-r border-stone-800 text-[#FFFDFB] p-6 shadow-2xl md:hidden"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="flex items-center justify-between pb-6 border-b border-stone-800">
                <Link to="/" onClick={() => setMobileSidebarOpen(false)} className="flex items-center space-x-2.5 group">
                  <Logo size={12} theme="dark" />
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 py-6 font-body text-xs tracking-widest uppercase">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                        isActive
                          ? 'bg-[#7A624E] text-[#FFFDFB]'
                          : 'text-stone-400 hover:bg-stone-900 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-stone-800 pt-6">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-3 px-4 py-3 font-body text-xs tracking-widest uppercase text-rose-400 hover:bg-stone-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="md:pl-64">
        <main className="p-4 sm:p-10 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* FRONTEND CLIENT STOREFRONT WORKSPACE */}
            <Route element={<ShopLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ProductCatalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/shipping" element={<Shipping />} />
            </Route>

            {/* SECURE ADMINISTRATIVE CONTROL PORTAL */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin/queries" element={<ManageQueries />} />
              <Route path="/admin/settings" element={<StoreSettings />} />
            </Route>

            {/* REDIRECTS FOR ADMIN SIDE ENTRIES */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* CATCH ALL REDIRECTS */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}