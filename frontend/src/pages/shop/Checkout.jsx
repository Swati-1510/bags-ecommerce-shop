import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../context/AuthContext';
import { ChevronRight, ShieldCheck, CreditCard, Check } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Fetch settings config on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings`);
        setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings in Checkout:', err);
      }
    };
    fetchSettings();
  }, []);

  const discountAmount = appliedDiscount > 0 ? Math.round((cartTotal * appliedDiscount) / 100) : 0;
  const finalTotal = cartTotal - discountAmount;

  // Dynamically load Razorpay SDK in the browser
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const API_ASSET = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';
  const getProductImage = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return DEFAULT_PLACEHOLDER;
    return imagePath.startsWith('http') ? imagePath : `${API_ASSET}${imagePath}`;
  };

  const handleShippingChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!shippingDetails.name || !shippingDetails.email || !shippingDetails.address || !shippingDetails.city || !shippingDetails.postalCode || !shippingDetails.phone) {
        setError('Please fill in all shipping details.');
        return;
      }
      
      // Pin code validation (Must be exactly 6 digits for Indian postal codes)
      const pinRegex = /^\d{6}$/;
      if (!pinRegex.test(shippingDetails.postalCode.trim())) {
        setError('Please enter a valid 6-digit PIN code.');
        return;
      }

      // Phone number validation (at least 10 digits)
      const phoneClean = shippingDetails.phone.replace(/\D/g, '');
      if (phoneClean.length < 10) {
        setError('Please enter a valid 10-digit Indian phone number.');
        return;
      }

      setError('');
      setStep(2);
    } else if (step === 2) {
      setError('');
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Request Razorpay order initialization from backend
      const orderInitRes = await axios.post(`${API_BASE}/orders/razorpay-order`, {
        totalAmount: finalTotal
      });

      const { id: razorpayOrderId, mock: isMockOrder } = orderInitRes.data;

      // 2. Configure Razorpay payment gateway options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: "Shivang's Bags",
        description: 'Luxury Collection Purchase Checkout',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            setIsSubmitting(true);
            
            // 3. Compile verification payload
            const payload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartItems.map(item => ({
                product: item.product,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                color: item.color
              })),
              shippingDetails,
              totalAmount: finalTotal,
              promoCode: appliedDiscount > 0 ? settings?.promoCode : undefined,
              isMock: isMockOrder
            };

            const headers = {};
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }

            // 4. Verify signature & register the order in database
            const verifyRes = await axios.post(`${API_BASE}/orders/verify-payment`, payload, { headers });
            
            clearCart();
            navigate(`/order-success?orderId=${verifyRes.data._id}`);
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setError(verifyErr.response?.data?.message || 'Payment signature verification failed. Please contact support.');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          contact: shippingDetails.phone
        },
        theme: {
          color: '#7A624E' // luxury brand brand primary
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      // 3. Open Razorpay payment modal
      // If running in development with mock order response, simulate payment success directly
      if (isMockOrder) {
        setTimeout(async () => {
          try {
            const mockResponse = {
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
              razorpay_signature: 'mock_signature_verified'
            };
            await options.handler(mockResponse);
          } catch (simErr) {
            console.error('Mock payment simulation failed:', simErr);
            setIsSubmitting(false);
          }
        }, 1500);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Error processing payment connection. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center bg-[#FFFDFB]">
        <h2 className="font-heading text-2xl italic text-[#707070] mb-6">Your shopping bag is empty</h2>
        <Link to="/shop" className="bg-[#7A624E] px-8 py-3.5 text-xs font-semibold tracking-widest text-[#FFFDFB] uppercase hover:bg-[#5f4b3c] transition-colors">
          Explore Bags
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase text-center mb-10">
          Checkout
        </h1>

        {/* Progress Tracker */}
        <div className="flex justify-center items-center mb-12 max-w-lg mx-auto font-body text-xs tracking-widest uppercase">
          <div className={`flex items-center ${step >= 1 ? 'text-[#7A624E] font-semibold' : 'text-stone-400'}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-[10px] mr-2 ${step > 1 ? 'bg-[#7A624E] border-[#7A624E] text-white' : 'border-stone-400'}`}>
              {step > 1 ? <Check className="h-3 w-3" /> : '1'}
            </span>
            <span>Shipping</span>
          </div>
          <ChevronRight className="h-4 w-4 mx-4 text-stone-300" />
          
          <div className={`flex items-center ${step >= 2 ? 'text-[#7A624E] font-semibold' : 'text-stone-400'}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-[10px] mr-2 ${step > 2 ? 'bg-[#7A624E] border-[#7A624E] text-white' : 'border-stone-400'}`}>
              {step > 2 ? <Check className="h-3 w-3" /> : '2'}
            </span>
            <span>Payment</span>
          </div>
          <ChevronRight className="h-4 w-4 mx-4 text-stone-300" />

          <div className={`flex items-center ${step === 3 ? 'text-[#7A624E] font-semibold' : 'text-stone-400'}`}>
            <span className="h-6 w-6 rounded-full flex items-center justify-center border border-stone-400 text-[10px] mr-2">
              3
            </span>
            <span>Review</span>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-[#E07A5F]/10 border border-[#E07A5F] p-4 text-center text-xs font-body text-[#E07A5F]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white border border-stone-200 p-8 sm:p-10">
            
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6 font-body text-left">
                <h3 className="font-heading text-lg font-semibold tracking-wide text-[#111111] uppercase pb-3 border-b border-stone-100">
                  Shipping Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={shippingDetails.name}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-sm focus:border-[#7A624E] focus:outline-none transition-colors"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={shippingDetails.email}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-sm focus:border-[#7A624E] focus:outline-none transition-colors"
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={shippingDetails.address}
                    onChange={handleShippingChange}
                    className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-sm focus:border-[#7A624E] focus:outline-none transition-colors"
                    placeholder="Flat/Shop No, Building Name, Local Area/Road"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase flex items-center justify-between">
                      <span>City</span>
                      <span className="text-[9px] text-[#7A624E] font-bold normal-case tracking-normal">India Only</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingDetails.city}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-sm focus:border-[#7A624E] focus:outline-none transition-colors"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={shippingDetails.postalCode}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-sm focus:border-[#7A624E] focus:outline-none transition-colors"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Country</label>
                    <input
                      type="text"
                      name="country"
                      required
                      readOnly
                      value={shippingDetails.country}
                      className="mt-1 block w-full border border-stone-200 bg-stone-100/70 px-3 py-3 text-sm focus:outline-none cursor-not-allowed text-stone-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingDetails.phone}
                    onChange={handleShippingChange}
                    className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-sm focus:border-[#7A624E] focus:outline-none transition-colors"
                    placeholder=""
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#111111] py-4 text-xs font-semibold tracking-widest text-[#FFFDFB] uppercase hover:bg-[#7A624E] transition-colors duration-300"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6 font-body text-left">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-heading text-lg font-semibold tracking-wide text-[#111111] uppercase">
                    Payment Option
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[10px] text-[#707070] uppercase font-bold tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Secure Gateway</span>
                  </div>
                </div>

                <div 
                  onClick={() => setStep(3)}
                  className="border-2 border-[#7A624E] p-5 bg-[#FFFDFB] flex items-center justify-between cursor-pointer rounded-xs hover:bg-stone-50/50 active:scale-[0.99] transition-all duration-200 select-none"
                >
                  <div className="flex items-start space-x-3.5">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="mt-1 accent-[#7A624E] cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-xs text-[#111111] uppercase tracking-wider">Secure Online Payment</p>
                      <p className="text-[10px] text-stone-500 mt-1 font-body normal-case">Pay securely with UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, or popular Wallets via Razorpay.</p>
                    </div>
                  </div>
                  <CreditCard className="h-5 w-5 text-[#7A624E] flex-shrink-0" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 border border-[#111111] py-4 text-xs font-semibold tracking-widest text-[#111111] uppercase hover:bg-stone-50 transition-colors duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#111111] py-4 text-xs font-semibold tracking-widest text-[#FFFDFB] uppercase hover:bg-[#7A624E] transition-colors duration-300"
                  >
                    Review Order
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-6 font-body text-left">
                <h3 className="font-heading text-lg font-semibold tracking-wide text-[#111111] uppercase pb-3 border-b border-stone-100">
                  Review & Place Order
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs leading-relaxed text-[#707070]">
                  <div>
                    <h4 className="font-semibold text-[#111111] uppercase tracking-wider mb-2">Delivery Destination</h4>
                    <p className="font-medium text-stone-850">{shippingDetails.name}</p>
                    <p>{shippingDetails.address}</p>
                    <p>{shippingDetails.city}, {shippingDetails.postalCode}</p>
                    <p>{shippingDetails.country}</p>
                    <p className="mt-2">Phone: {shippingDetails.phone}</p>
                    <p>Email: {shippingDetails.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#111111] uppercase tracking-wider mb-2">Payment Details</h4>
                    <p className="font-medium text-stone-850">Online Payment via Razorpay</p>
                    <p className="mt-3 text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1" /> Fully Encrypted SSL Transaction
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="w-1/3 border border-[#111111] py-4 text-xs font-semibold tracking-widest text-[#111111] uppercase hover:bg-stone-50 disabled:opacity-50 transition-colors duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#7A624E] py-4 text-xs font-semibold tracking-widest text-white uppercase hover:bg-[#5f4b3c] disabled:opacity-50 transition-all duration-300"
                  >
                    {isSubmitting ? 'Processing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Cart Summary Side */}
          <div className="lg:col-span-5 bg-stone-50 border border-stone-200 p-6 sm:p-8 font-body">
            <h3 className="font-heading text-base font-semibold tracking-wider text-[#111111] uppercase pb-4 border-b border-stone-200 mb-6">
              Order Summary
            </h3>

            <div className="divide-y divide-stone-200 max-h-96 overflow-y-auto mb-6 pr-2">
              {cartItems.map((item) => (
                <div key={item.product} className="flex py-4 first:pt-0 last:pb-0">
                  <img
                    src={getProductImage(item.image)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_PLACEHOLDER;
                    }}
                    className="h-16 w-12 object-cover bg-white flex-shrink-0 rounded-xs"
                  />
                  <div className="ml-4 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="font-heading text-sm font-semibold text-[#111111]">{item.name}</h4>
                      {item.color && (
                        <p className="text-[10px] text-stone-500 font-body uppercase mt-0.5">Color: {item.color}</p>
                      )}
                      <p className="text-xs text-[#707070] mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#111111] mt-1 block">
                      ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            {settings?.isSaleActive && settings?.promoCode && (
              <div className="border-t border-stone-200 pt-6 mb-6">
                <label className="block text-[10px] font-bold tracking-widest text-[#111111] uppercase mb-2">Have a Promo Code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError('');
                      setPromoSuccess('');
                    }}
                    placeholder="ENTER CODE"
                    className="flex-1 border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[#7A624E] focus:outline-none uppercase font-bold tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cleanInput = promoInput.trim().toUpperCase();
                      if (cleanInput === settings.promoCode.toUpperCase()) {
                        setAppliedDiscount(settings.discountPercentage);
                        setPromoSuccess(`Promo code applied! Saved ${settings.discountPercentage}%`);
                        setPromoError('');
                      } else {
                        setAppliedDiscount(0);
                        setPromoError('Invalid promo code. Please try again.');
                        setPromoSuccess('');
                      }
                    }}
                    className="bg-[#111111] hover:bg-[#7A624E] text-[#FFFDFB] text-[10px] uppercase font-bold tracking-widest px-4 py-2 transition-colors rounded-xs"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[10px] text-[#E07A5F] mt-2 font-semibold">{promoError}</p>}
                {promoSuccess && <p className="text-[10px] text-emerald-600 mt-2 font-semibold">{promoSuccess}</p>}
              </div>
            )}

            <div className="border-t border-stone-200 pt-6 space-y-3.5 text-xs text-[#707070] leading-relaxed">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#111111]">₹{cartTotal.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Complimentary Shipping</span>
                <span className="font-bold text-emerald-600 uppercase tracking-widest">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-semibold text-[#111111]">₹0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#111111] border-t border-stone-200 pt-4">
                <span className="uppercase tracking-wider">Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
