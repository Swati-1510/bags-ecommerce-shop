import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Receipt, Store, LogOut, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 border-r border-stone-800 bg-[#111111] text-[#FFFDFB] md:flex md:flex-col">
      {/* Brand Logo header */}
      <div className="flex h-20 items-center px-6 border-b border-stone-800">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <Logo size={8} theme="dark" />
          <span className="font-heading text-lg font-bold tracking-[0.2em] text-[#FFFDFB] group-hover:text-[#C5A880] transition-colors uppercase">
            S3 ADMIN
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 font-body text-xs tracking-widest uppercase">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3.5 px-4 py-3.5 transition-all duration-300 ${
                isActive
                  ? 'bg-[#7A624E] text-[#FFFDFB] font-semibold'
                  : 'text-stone-400 hover:bg-[#FFFDFB]/10 hover:text-[#FFFDFB]'
              }`}
            >
              <Icon className="h-4.5 w-4.5 stroke-[1.5]" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer operations */}
      <div className="border-t border-stone-800 p-4 space-y-1">
        <Link
          to="/"
          className="flex items-center space-x-3.5 px-4 py-3 text-stone-400 rounded-sm hover:bg-[#FFFDFB]/10 hover:text-[#FFFDFB] transition-all font-body text-[10px] tracking-widest uppercase"
        >
          <Store className="h-4 w-4" />
          <span>View Shop</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3.5 px-4 py-3 text-[#E07A5F] rounded-sm hover:bg-[#E07A5F]/10 transition-all font-body text-[10px] tracking-widest uppercase text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
