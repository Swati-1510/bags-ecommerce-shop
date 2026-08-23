import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../context/AuthContext';
import { CheckCircle, Truck, Package, Clock } from 'lucide-react';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';

  const getProductImage = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return DEFAULT_PLACEHOLDER;
    return imagePath.startsWith('http') ? imagePath : `${API_ASSET}${imagePath}`;
  };

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_BASE}/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not retrieve tracking details. Order was placed successfully.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Determine active steps in timeline based on orderStatus
  const getTimelineStatus = (status) => {
    return [
      { name: 'Order Placed', desc: 'Receipt confirmed', icon: CheckCircle, completed: true },
      { name: 'Processing', desc: 'Preparing selection', icon: Clock, completed: ['Processing', 'Shipped', 'Delivered'].includes(status) },
      { name: 'Dispatched', desc: 'In transit to you', icon: Truck, completed: ['Shipped', 'Delivered'].includes(status) },
      { name: 'Delivered', desc: 'Signed & received', icon: Package, completed: status === 'Delivered' }
    ];
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center animate-pulse space-y-6">
        <div className="h-12 w-12 bg-stone-100 rounded-full mx-auto" />
        <div className="h-8 bg-stone-100 w-1/3 mx-auto" />
        <div className="h-24 bg-stone-100 w-full" />
      </div>
    );
  }

  const timelineSteps = getTimelineStatus(order?.orderStatus || 'Pending');

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-stone-200 p-8 sm:p-12 shadow-xs">
        
        {/* Success Header */}
        <div className="text-center pb-8 border-b border-stone-100">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600 stroke-[1.5]" />
          </div>
          <h1 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase">
            Thank You For Your Order
          </h1>
          <p className="mt-2 text-xs font-body tracking-wider text-[#707070] uppercase">
            Order ID: <span className="font-semibold text-[#111111]">{orderId || 'MOCK-10293'}</span>
          </p>
        </div>

        {/* Graphical Timeline Nodes */}
        <div className="py-12 border-b border-stone-100">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase text-left mb-8">
            Delivery Status Timeline
          </h3>

          <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-8 md:gap-0">
            {/* Timeline connectors (Desktop) */}
            <div className="absolute top-[18px] left-0 right-0 hidden md:block h-0.5 bg-stone-100 -z-0" />
            
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative z-10 flex md:flex-col items-center text-left md:text-center w-full md:w-auto">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-colors duration-500 ${
                    step.completed 
                      ? 'bg-[#7A624E] border-[#7A624E] text-white shadow-xs' 
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}>
                    <Icon className="h-4.5 w-4.5 stroke-[1.75]" />
                  </div>
                  
                  <div className="ml-4 md:ml-0 md:mt-3">
                    <h4 className={`text-xs font-bold tracking-wider uppercase font-body ${step.completed ? 'text-[#111111]' : 'text-stone-400'}`}>
                      {step.name}
                    </h4>
                    <p className="text-[10px] text-[#707070] mt-0.5 font-body">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Receipt details */}
        {order ? (
          <div className="py-8 border-b border-stone-100 text-left font-body text-xs space-y-6">
            <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase">
              Receipt Details
            </h3>

            {/* Product list */}
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getProductImage(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PLACEHOLDER;
                      }}
                      className="h-12 w-9 object-cover bg-stone-50 flex-shrink-0 rounded-xs"
                    />
                    <div>
                      <p className="font-heading text-sm font-medium text-[#111111]">{item.name}</p>
                      {item.color && (
                        <p className="text-[10px] text-stone-500 font-body uppercase mt-0.5">Color: {item.color}</p>
                      )}
                      <p className="text-[10px] text-[#707070] mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#111111]">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-1.5 text-[#707070] leading-relaxed">
                <h4 className="font-semibold text-[#111111] uppercase tracking-wider mb-1">Shipping Destination</h4>
                <p className="font-medium text-stone-800">{order.shippingDetails.name}</p>
                <p>{order.shippingDetails.address}</p>
                <p>{order.shippingDetails.city}, {order.shippingDetails.postalCode}</p>
                <p>{order.shippingDetails.country}</p>
                <p className="mt-1">Phone: {order.shippingDetails.phone}</p>
              </div>
              <div className="space-y-2 text-[#707070]">
                <h4 className="font-semibold text-[#111111] uppercase tracking-wider mb-1">Financial Outline</h4>
                <div className="flex justify-between text-[11px]">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-medium">₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#111111] pt-2 border-t border-stone-100">
                  <span className="uppercase tracking-wider">Total Paid</span>
                  <span>₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          error && (
            <div className="py-8 text-center text-xs font-body text-[#E07A5F]">
              {error}
            </div>
          )
        )}

        {/* Action controls */}
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center font-body">
          <Link
            to="/shop"
            className="border border-[#111111] px-8 py-3.5 text-xs font-semibold tracking-widest text-[#111111] uppercase hover:bg-[#111111] hover:text-white transition-all duration-300 text-center"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="bg-[#7A624E] px-8 py-3.5 text-xs font-semibold tracking-widest text-white uppercase hover:bg-[#5f4b3c] transition-all duration-300 text-center"
          >
            Go to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
