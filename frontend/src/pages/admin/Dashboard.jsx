import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../context/AuthContext';
import { IndianRupee, ClipboardList, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [ordersRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE}/orders/all`, { headers }),
          axios.get(`${API_BASE}/products`, { headers })
        ]);
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Statistics calculations
  const totalSales = orders
    .filter(order => order.paymentStatus === 'Paid' || order.orderStatus !== 'Cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const activeOrdersCount = orders.filter(
    order => order.orderStatus === 'Pending' || order.orderStatus === 'Processing'
  ).length;

  const lowStockProducts = products.filter(product => product.stockCount <= 3);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 w-1/4 rounded-sm" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-stone-200 rounded-sm" />
          <div className="h-32 bg-stone-200 rounded-sm" />
          <div className="h-32 bg-stone-200 rounded-sm" />
        </div>
        <div className="h-64 bg-stone-200 rounded-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-body">
      
      {/* Title */}
      <div>
        <h1 className="font-heading text-3xl font-light tracking-wider text-[#111111] uppercase">
          Dashboard
        </h1>
        <p className="mt-1 text-xs text-[#707070] tracking-wider uppercase">
          Key Operational Metrics and Real-time Logistics
        </p>
      </div>

      {/* Tactile Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1: Total Sales */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-[#FFFDFB] border border-stone-200 p-6 flex items-center justify-between shadow-xs cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-[#707070] uppercase">
              Total Revenue
            </span>
            <h3 className="text-2xl font-bold text-[#111111] tracking-wide">
              ₹{totalSales.toLocaleString()}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#7A624E]/10 flex items-center justify-center text-[#7A624E]">
            <IndianRupee className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Metric Card 2: Active Pending Orders */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-[#FFFDFB] border border-stone-200 p-6 flex items-center justify-between shadow-xs cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-[#707070] uppercase">
              Active Orders
            </span>
            <h3 className="text-2xl font-bold text-[#111111] tracking-wide">
              {activeOrdersCount}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880]">
            <ClipboardList className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Metric Card 3: Low Stock Warnings */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-[#FFFDFB] border border-stone-200 p-6 flex items-center justify-between shadow-xs cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-[#707070] uppercase">
              Low Stock Warnings
            </span>
            <h3 className="text-2xl font-bold text-[#E07A5F] tracking-wide">
              {lowStockProducts.length}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#E07A5F]/10 flex items-center justify-center text-[#E07A5F]">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </motion.div>

      </div>

      {/* Detail Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Low Stock warnings list */}
        <div className="lg:col-span-6 bg-white border border-stone-200 p-6 sm:p-8 flex flex-col shadow-xs">
          <div className="flex items-center space-x-2 pb-4 border-b border-stone-100 mb-4">
            <AlertTriangle className="h-5 w-5 text-[#E07A5F]" />
            <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase">
              Low Stock Alert Register
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-stone-550 text-xs italic py-10 text-center">All products are adequately stocked.</p>
            ) : (
              lowStockProducts.map(product => (
                <div key={product._id} className="flex justify-between items-center py-2.5 border-b border-stone-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-[#111111]">{product.name}</p>
                    <span className="text-[10px] text-[#707070] uppercase font-bold tracking-wider">{product.category}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 uppercase rounded-xs ${
                    product.stockCount === 0 
                      ? 'bg-[#E07A5F]/10 text-[#E07A5F]' 
                      : 'bg-[#C5A880]/15 text-[#7A624E]'
                  }`}>
                    {product.stockCount === 0 ? 'Out of Stock' : `${product.stockCount} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Summary Order Logs */}
        <div className="lg:col-span-6 bg-white border border-stone-200 p-6 sm:p-8 flex flex-col shadow-xs">
          <div className="flex items-center space-x-2 pb-4 border-b border-stone-100 mb-4">
            <TrendingUp className="h-5 w-5 text-[#7A624E]" />
            <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase">
              Recent Activity logs
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-4">
            {orders.length === 0 ? (
              <p className="text-stone-550 text-xs italic py-10 text-center">No orders registered in system.</p>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order._id} className="flex justify-between items-center py-2.5 border-b border-stone-50 last:border-0 text-xs">
                  <div>
                    <p className="font-semibold text-[#111111]">{order.shippingDetails?.name || 'Guest Client'}</p>
                    <p className="text-[10px] text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#111111]">₹{order.totalAmount.toLocaleString()}</p>
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${
                      order.orderStatus === 'Delivered' 
                        ? 'text-emerald-600' 
                        : order.orderStatus === 'Cancelled'
                        ? 'text-[#E07A5F]'
                        : 'text-stone-600'
                    }`}>{order.orderStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
