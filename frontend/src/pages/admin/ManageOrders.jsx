import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../context/AuthContext';
import { Eye, Clock, Truck, CheckCircle, AlertCircle, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null); // { orderId, type: 'payment' | 'fulfillment' }
  const [modalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [modalFulfillmentOpen, setModalFulfillmentOpen] = useState(false);
  
  // Modal viewer state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const getProductImage = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${API_ASSET}${imagePath}`;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE}/orders/all`, { headers });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [targetOrderForTracking, setTargetOrderForTracking] = useState(null);
  const [courierName, setCourierName] = useState('Blue Dart');
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleStatusChange = async (orderId, newStatus, trackingNo = '', courier = 'Blue Dart') => {
    if (newStatus === 'Shipped' && !trackingNo) {
      const order = orders.find(o => o._id === orderId);
      setTargetOrderForTracking(order);
      setCourierName(order?.courierName || 'Blue Dart');
      setTrackingNumber(order?.trackingNumber || '');
      setTrackingModalOpen(true);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { 
        orderStatus: newStatus,
        ...(trackingNo ? { trackingNumber: trackingNo, courierName: courier } : {})
      };
      const res = await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        payload,
        { headers }
      );
      
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...res.data } : o));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, ...res.data }));
      }
      setTrackingModalOpen(false);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        { paymentStatus: newPaymentStatus },
        { headers }
      );
      
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: res.data.paymentStatus } : o));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: res.data.paymentStatus }));
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const openOrderViewer = (order) => {
    setSelectedOrder(order);
    setViewerOpen(true);
  };

  const filteredOrders = orders
    .filter(o => statusFilter === 'All' || o.orderStatus === statusFilter)
    .filter(o => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o._id.toLowerCase().includes(q) ||
        o.shippingDetails?.name?.toLowerCase().includes(q) ||
        o.shippingDetails?.phone?.toLowerCase().includes(q) ||
        o.shippingDetails?.email?.toLowerCase().includes(q)
      );
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4 text-[#7A624E]" />;
      case 'Processing': return <Clock className="h-4 w-4 text-[#C5A880]" />;
      case 'Shipped': return <Truck className="h-4 w-4 text-sky-600" />;
      case 'Delivered': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      default: return <AlertCircle className="h-4 w-4 text-[#E07A5F]" />;
    }
  };

  return (
    <div className="space-y-8 text-left font-body">
      <div>
        <h1 className="font-heading text-3xl font-light tracking-wider text-[#111111] uppercase">
          Manage Orders
        </h1>
        <p className="mt-1 text-xs text-[#707070] tracking-wider uppercase">
          Track customer purchases, invoice details, and update dispatch stages
        </p>
      </div>

      {/* Filter and Search Bar Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-2 gap-4">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto scrollbar-none pb-1">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`pb-2 px-4 text-xs font-semibold tracking-widest uppercase border-b-2 transition-all duration-300 flex-shrink-0 ${
                statusFilter === filter
                  ? 'border-[#7A624E] text-[#111111]'
                  : 'border-transparent text-[#707070] hover:text-[#111111]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search orders (Name, ID, Phone...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-stone-200 bg-white px-3 py-2 text-xs font-body tracking-wider placeholder-stone-400 focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-stone-100 rounded-sm" />
          <div className="h-24 bg-stone-100 rounded-sm" />
          <div className="h-24 bg-stone-100 rounded-sm" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 text-xs text-[#707070] uppercase tracking-widest font-semibold italic">
          No orders found matching status selection.
        </div>
      ) : (
        <div className="overflow-x-auto border border-stone-200 bg-white shadow-xs pb-16">
          <table className="min-w-full divide-y divide-stone-200 text-left text-xs font-body tracking-wider uppercase">
            <thead className="bg-stone-50 font-semibold text-[#111111]">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Customer details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total amount</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4 text-center">Fulfillment stage</th>
                <th className="px-6 py-4 text-right">Invoice details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 bg-white text-stone-600 normal-case font-body">
              {filteredOrders.map((order, index) => {
                const openUpwards = index > 0;
                return (
                  <tr key={order._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#111111] uppercase">
                      #{order._id.substring(order._id.length - 6)}
                    </td>
                    <td className="px-6 py-4 normal-case">
                      <p className="font-semibold text-[#111111]">{order.shippingDetails?.name || 'Guest User'}</p>
                      <p className="text-[10px] text-stone-400 font-body">{order.shippingDetails?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#111111]">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    
                    {/* Payment Status */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown?.orderId === order._id && activeDropdown?.type === 'payment' ? null : { orderId: order._id, type: 'payment' })}
                          className={`font-semibold bg-[#FFFDFB] border border-stone-200 focus:border-[#7A624E] focus:outline-none text-[10px] py-1.5 px-3 cursor-pointer rounded-xs uppercase tracking-wider flex items-center justify-between min-w-[100px] gap-2 ${
                            order.paymentStatus === 'Paid' ? 'text-emerald-700 font-bold' : 'text-[#E07A5F]'
                          }`}
                        >
                          <span>{order.paymentStatus}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-300 ${activeDropdown?.orderId === order._id && activeDropdown?.type === 'payment' ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {activeDropdown?.orderId === order._id && activeDropdown?.type === 'payment' && (
                          <>
                            {/* Close backdrop */}
                            <div className="fixed inset-0 z-20" onClick={() => setActiveDropdown(null)} />
                            
                            {/* Options menu */}
                            <div className={`absolute left-0 w-28 bg-[#FFFDFB] border border-stone-200 shadow-md z-30 rounded-xs overflow-hidden font-body text-[10px] tracking-wider py-1 text-left ${
                              openUpwards ? 'bottom-full mb-1' : 'mt-1'
                            }`}>
                              {['Pending', 'Paid', 'Failed'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => {
                                    handlePaymentStatusChange(order._id, status);
                                    setActiveDropdown(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 transition-colors uppercase font-semibold block ${
                                    order.paymentStatus === status ? 'text-[#7A624E] bg-stone-50/50' : 'text-stone-700'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Fulfillment stage */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(order.orderStatus)}
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown?.orderId === order._id && activeDropdown?.type === 'fulfillment' ? null : { orderId: order._id, type: 'fulfillment' })}
                            className="border border-stone-200 bg-[#FFFDFB] text-[#111111] text-[10px] px-3 py-1.5 focus:border-[#7A624E] focus:outline-none cursor-pointer rounded-xs uppercase tracking-wider flex items-center justify-between min-w-[125px] gap-2"
                          >
                            <span>{order.orderStatus}</span>
                            <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-300 ${activeDropdown?.orderId === order._id && activeDropdown?.type === 'fulfillment' ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {activeDropdown?.orderId === order._id && activeDropdown?.type === 'fulfillment' && (
                            <>
                              {/* Close backdrop */}
                              <div className="fixed inset-0 z-20" onClick={() => setActiveDropdown(null)} />
                              
                              {/* Options menu */}
                              <div className={`absolute right-0 w-32 bg-[#FFFDFB] border border-stone-200 shadow-md z-30 rounded-xs overflow-hidden font-body text-[10px] tracking-wider py-1 text-left ${
                                openUpwards ? 'bottom-full mb-1' : 'mt-1'
                              }`}>
                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      handleStatusChange(order._id, status);
                                      setActiveDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 transition-colors uppercase font-semibold block ${
                                      order.orderStatus === status ? 'text-[#7A624E] bg-stone-50/50' : 'text-stone-700'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Invoice details */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openOrderViewer(order)}
                        className="inline-flex text-stone-400 hover:text-[#7A624E] transition-colors"
                        title="View Invoice Detail"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {viewerOpen && selectedOrder && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setViewerOpen(false)}
            className="fixed inset-0 z-50 backdrop-blur-xs animate-in fade-in duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />

          {/* Modal Dialog */}
          <div
            className="fixed inset-0 z-50 m-auto flex h-fit max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto p-8 shadow-2xl border border-stone-200 text-xs font-body uppercase tracking-wider text-stone-800 animate-in fade-in zoom-in-95 duration-200"
            style={{ backgroundColor: '#FFFDFB' }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-150 mb-6">
              <h3 className="font-heading text-lg font-semibold tracking-wider text-[#111111] uppercase">
                Invoice Details - #{selectedOrder?._id || 'N/A'}
              </h3>
              <button onClick={() => setViewerOpen(false)} className="text-stone-400 hover:text-[#111111]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Info splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left leading-relaxed border-b border-stone-150 pb-6 mb-6">
              <div className="space-y-1">
                <h4 className="font-bold text-[#111111] border-b border-stone-100 pb-1 mb-2">Customer Profile</h4>
                <p className="normal-case"><span className="font-semibold">Name:</span> {selectedOrder?.shippingDetails?.name || 'N/A'}</p>
                <p className="normal-case"><span className="font-semibold">Email:</span> {selectedOrder?.shippingDetails?.email || 'N/A'}</p>
                <p><span className="font-semibold">Phone:</span> {selectedOrder?.shippingDetails?.phone || 'N/A'}</p>
                <p><span className="font-semibold">Order Date:</span> {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#111111] border-b border-stone-100 pb-1 mb-2">Shipping Destination</h4>
                <p className="normal-case">{selectedOrder?.shippingDetails?.address || 'N/A'}</p>
                <p className="normal-case">{selectedOrder?.shippingDetails?.city || ''}, {selectedOrder?.shippingDetails?.postalCode || ''}</p>
                <p>{selectedOrder?.shippingDetails?.country || ''}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4 text-left mb-6 border-b border-stone-150 pb-6">
              <h4 className="font-bold text-[#111111] mb-2 pb-1 border-b border-stone-100">Ordered Products</h4>
              <div className="divide-y divide-stone-100">
                {(selectedOrder?.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3 normal-case">
                      <img
                        src={getProductImage(item?.image)}
                        alt={item?.name || 'Product'}
                        className="h-12 w-9 object-cover bg-stone-50"
                      />
                      <div>
                        <p className="font-heading text-sm font-semibold text-[#111111]">{item?.name || 'N/A'}</p>
                        {item?.color && (
                          <p className="text-[9px] text-stone-500 font-body uppercase mt-0.5">Color: {item.color}</p>
                        )}
                        <p className="text-[10px] text-stone-400 mt-0.5">Qty: {item?.quantity || 1} × ₹{(item?.price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#111111]">₹{((item?.price || 0) * (item?.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Select updates */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left bg-stone-50 p-4 border border-stone-200">
              <div className="flex gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Invoice Status</label>
                  <div className="relative">
                    <button
                      onClick={() => setModalPaymentOpen(!modalPaymentOpen)}
                      className="border border-stone-200 bg-[#FFFDFB] text-[#111111] text-xs px-3 py-1.5 focus:border-[#7A624E] focus:outline-none cursor-pointer rounded-xs uppercase tracking-wider flex items-center justify-between min-w-[105px] gap-2"
                    >
                      <span>{selectedOrder?.paymentStatus || 'Pending'}</span>
                      <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${modalPaymentOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {modalPaymentOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setModalPaymentOpen(false)} />
                        <div className="absolute left-0 mt-1 w-28 bg-[#FFFDFB] border border-stone-200 shadow-md z-30 rounded-xs overflow-hidden font-body text-xs tracking-wider py-1 text-left">
                          {['Pending', 'Paid', 'Failed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                handlePaymentStatusChange(selectedOrder?._id, status);
                                setModalPaymentOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors uppercase font-semibold block ${
                                selectedOrder?.paymentStatus === status ? 'text-[#7A624E] bg-stone-50/50' : 'text-stone-700'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Fulfillment Cycle</label>
                  <div className="relative">
                    <button
                      onClick={() => setModalFulfillmentOpen(!modalFulfillmentOpen)}
                      className="border border-stone-200 bg-[#FFFDFB] text-[#111111] text-xs px-3 py-1.5 focus:border-[#7A624E] focus:outline-none cursor-pointer rounded-xs uppercase tracking-wider flex items-center justify-between min-w-[130px] gap-2"
                    >
                      <span>{selectedOrder?.orderStatus || 'Pending'}</span>
                      <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${modalFulfillmentOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {modalFulfillmentOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setModalFulfillmentOpen(false)} />
                        <div className="absolute left-0 mt-1 w-32 bg-[#FFFDFB] border border-stone-200 shadow-md z-30 rounded-xs overflow-hidden font-body text-xs tracking-wider py-1 text-left">
                          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                handleStatusChange(selectedOrder?._id, status);
                                setModalFulfillmentOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors uppercase font-semibold block ${
                                selectedOrder?.orderStatus === status ? 'text-[#7A624E] bg-stone-50/50' : 'text-stone-700'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-500 block mb-1">Total Paid</span>
                <span className="text-lg font-bold text-[#111111]">₹{(selectedOrder?.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tracking Number Input Modal */}
      {trackingModalOpen && targetOrderForTracking && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" onClick={() => setTrackingModalOpen(false)} />
          <div className="fixed inset-0 z-50 m-auto flex h-fit w-full max-w-md flex-col bg-[#FFFDFB] p-6 shadow-2xl border border-stone-200 rounded-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150 mb-4">
              <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase">
                Dispatch & Tracking Details
              </h3>
              <button onClick={() => setTrackingModalOpen(false)} className="text-stone-400 hover:text-[#111111]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              Enter courier tracking details for order <strong>#{targetOrderForTracking._id.substring(targetOrderForTracking._id.length - 6).toUpperCase()}</strong>. These will be sent to the customer via email.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStatusChange(targetOrderForTracking._id, 'Shipped', trackingNumber, courierName);
              }}
              className="space-y-4 text-xs font-body uppercase"
            >
              <div>
                <label className="block font-bold text-[#111111] mb-1">Courier Partner</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Blue Dart / Delhivery / DTDC"
                  className="w-full border border-stone-200 px-3 py-2 text-xs focus:border-[#7A624E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] mb-1">AWB Tracking Number</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 3819402810"
                  className="w-full border border-stone-200 px-3 py-2 text-xs font-mono focus:border-[#7A624E] focus:outline-none normal-case"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="w-1/3 border border-[#111111] py-2 text-[10px] font-bold tracking-widest text-[#111111] uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7A624E] py-2 text-[10px] font-bold tracking-widest text-white uppercase hover:bg-[#5f4b3c]"
                >
                  Save & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageOrders;
