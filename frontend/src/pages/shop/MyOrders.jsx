import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { Package, Clock, Truck, CheckCircle, AlertCircle, X, ExternalLink, RefreshCw, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyOrders = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');

  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';

  const getProductImage = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return DEFAULT_PLACEHOLDER;
    return imagePath.startsWith('http') ? imagePath : `${API_ASSET}${imagePath}`;
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE}/orders/my-orders`, { headers });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    }
  }, [token]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    setSubmittingCancel(true);
    const reasonToSave = cancellationReason === 'Other' ? customReason : cancellationReason;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${API_BASE}/orders/${cancellingOrder._id}/cancel`,
        { cancellationReason: reasonToSave },
        { headers }
      );

      setOrders(prev => prev.map(o => o._id === cancellingOrder._id ? res.data : o));
      setCancelSuccess(`Order #${cancellingOrder._id.substring(cancellingOrder._id.length - 6).toUpperCase()} cancelled successfully.`);
      setCancellingOrder(null);
      setCancellationReason('Ordered by mistake');
      setCustomReason('');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return -1;
    }
  };

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-body text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase">
            My Order History
          </h1>
          <p className="mt-1 text-xs text-[#707070] tracking-wider uppercase">
            Track dispatches, view invoices, or manage active purchases
          </p>
        </div>

        <button
          onClick={fetchMyOrders}
          className="inline-flex items-center space-x-2 border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-[#111111] transition-colors rounded-xs self-start sm:self-auto uppercase tracking-wider"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {cancelSuccess && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between rounded-xs">
          <span>{cancelSuccess}</span>
          <button onClick={() => setCancelSuccess('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-[#707070] tracking-widest uppercase animate-pulse">
          Loading your bag purchases...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-stone-200 bg-white p-8 space-y-4 rounded-xs">
          <Package className="h-12 w-12 text-stone-300 mx-auto" />
          <h3 className="font-heading text-lg text-[#111111] uppercase tracking-wider">No Orders Placed Yet</h3>
          <p className="text-xs text-stone-500 uppercase tracking-wider max-w-sm mx-auto">
            You haven't ordered any luxury bags yet. Explore our handcrafted collection today!
          </p>
          <Link
            to="/shop"
            className="inline-block bg-[#7A624E] text-white px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-[#5f4b3c] transition-colors rounded-xs"
          >
            Explore Bags
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const invoiceId = order._id.substring(order._id.length - 6).toUpperCase();
            const isCancelled = order.orderStatus === 'Cancelled';
            const currentStepIdx = getStepIndex(order.orderStatus);
            const canCancel = !isCancelled && (order.orderStatus === 'Pending' || order.orderStatus === 'Processing');

            return (
              <div key={order._id} className="border border-stone-200 bg-white shadow-2xs rounded-xs overflow-hidden">
                {/* Header */}
                <div className="bg-[#F9F7F5] px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs font-body">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Order ID</span>
                      <span className="font-bold text-[#111111]">#{invoiceId}</span>
                    </div>
                    <div className="border-l border-stone-200 pl-4">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Date</span>
                      <span className="font-semibold text-stone-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs ${
                      isCancelled
                        ? 'bg-[#E07A5F]/10 text-[#E07A5F]'
                        : order.orderStatus === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-stone-100 text-[#7A624E]'
                    }`}>
                      <span>{order.orderStatus}</span>
                    </span>

                    <span className="font-bold text-[#111111] text-sm">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress Status Bar Timeline */}
                {!isCancelled && (
                  <div className="px-6 py-5 border-b border-stone-150 bg-stone-50/40">
                    <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                      {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="flex flex-col items-center z-10 flex-1">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isCompleted
                                ? 'bg-[#7A624E] text-white shadow-sm'
                                : 'bg-stone-200 text-stone-400'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] font-semibold tracking-wider uppercase mt-1.5 ${
                              isCurrent ? 'text-[#7A624E] font-bold' : isCompleted ? 'text-stone-700' : 'text-stone-400'
                            }`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                      
                      {/* Connecting Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0">
                        <div
                          className="h-full bg-[#7A624E] transition-all duration-500"
                          style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Tracking Info Alert */}
                    {order.orderStatus === 'Shipped' && order.trackingNumber && (
                      <div className="mt-4 bg-sky-50 border border-sky-200 p-3 text-xs text-sky-900 rounded-xs flex items-center justify-between">
                        <div>
                          <strong className="uppercase tracking-wider">Dispatched via {order.courierName || 'Blue Dart'}:</strong>
                          <span className="font-mono ml-2 font-bold">{order.trackingNumber}</span>
                        </div>
                        <a
                          href={`https://www.bluedart.com/tracking?handler=bluedart&action=awbquery&numbers=${order.trackingNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 font-bold text-sky-700 hover:underline text-[10px] uppercase"
                        >
                          <span>Track Package</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancelled Notice */}
                {isCancelled && (
                  <div className="px-6 py-3 bg-[#E07A5F]/10 border-b border-[#E07A5F]/20 text-xs text-[#E07A5F] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong>ORDER CANCELLED:</strong> {order.cancellationReason || 'Cancelled upon request.'}
                    </div>
                    <div className="text-[10px] font-semibold uppercase">
                      Refund status: Initiated (3-5 business days)
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="p-6 divide-y divide-stone-150">
                  {order.items?.map((item, i) => (
                    <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={getProductImage(item.image)}
                          alt={item.name}
                          className="h-14 w-12 object-cover border border-stone-200 rounded-xs"
                        />
                        <div>
                          <p className="font-semibold text-xs text-[#111111]">{item.name}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-bold text-xs text-[#7A624E]">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="bg-[#F9F7F5] px-6 py-3.5 border-t border-stone-200 flex items-center justify-between">
                  <a
                    href="https://wa.me/918451021245"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-[#7A624E] transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Need help? WhatsApp Support</span>
                  </a>

                  {canCancel && (
                    <button
                      onClick={() => setCancellingOrder(order)}
                      className="border border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 rounded-xs"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingOrder(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-50 w-full max-w-md bg-[#FFFDFB] p-6 shadow-2xl border border-stone-200 rounded-xs font-body text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-150 mb-4">
                <h3 className="font-heading text-base font-bold tracking-wider text-[#111111] uppercase">
                  Cancel Order #{cancellingOrder._id.substring(cancellingOrder._id.length - 6).toUpperCase()}
                </h3>
                <button onClick={() => setCancellingOrder(null)} className="text-stone-400 hover:text-[#111111]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCancelOrder} className="space-y-4 text-xs uppercase">
                <p className="text-stone-500 normal-case">
                  Are you sure you want to cancel this order? Please select your reason below:
                </p>

                <div>
                  <label className="block font-bold text-[#111111] mb-2">Reason for Cancellation</label>
                  <select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[#7A624E] focus:outline-none"
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Want to change shipping address">Want to change shipping address</option>
                    <option value="Want to order different color/style">Want to order different color/style</option>
                    <option value="Delivery time is too long">Delivery time is too long</option>
                    <option value="Other">Other reason...</option>
                  </select>
                </div>

                {cancellationReason === 'Other' && (
                  <div>
                    <label className="block font-bold text-[#111111] mb-1">Please specify</label>
                    <input
                      type="text"
                      required
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Type your reason..."
                      className="w-full border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[#7A624E] focus:outline-none normal-case"
                    />
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 normal-case rounded-xs">
                  <strong>Refund Info:</strong> If your payment was already completed via Razorpay/Cards, your refund will automatically initiate and reflect in your account within 3-5 business days.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    className="w-1/3 border border-[#111111] py-2 text-[10px] font-bold tracking-widest text-[#111111] uppercase"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCancel}
                    className="flex-1 bg-[#E07A5F] py-2 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
