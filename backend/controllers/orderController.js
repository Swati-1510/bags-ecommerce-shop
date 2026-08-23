const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance = null;
if (key_id && key_secret) {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret
  });
} else {
  console.warn("WARNING: Razorpay API keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are missing. Running backend checkout in development test mode.");
}

/**
 * Place a new customer order (supports guest checkouts and registered accounts)
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  const { items, shippingDetails, totalAmount } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No products present in order queue.' });
  }

  try {
    // 1. Validate stock limits before performing deductions
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stockCount < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.name}. Available: ${product.stockCount}`
        });
      }
    }

    // 2. Decrement stock counts for items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: -item.quantity }
      });
    }

    // 3. Persist order document
    const order = new Order({
      user: req.user ? req.user._id : null,
      items,
      shippingDetails,
      totalAmount,
      paymentStatus: 'Pending',
      orderStatus: 'Pending'
    });

    const createdOrder = await order.save();
    return res.status(201).json(createdOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Fetch orders for authenticated consumer
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Fetch all orders (Admin only)
 * GET /api/orders/all
 */
const getAllOrders = async (req, res) => {
  try {
    // Populate user name and email fields if they are registered accounts
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update order status parameters (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus, trackingNumber, courierName, cancellationReason } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.orderStatus;
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (courierName) order.courierName = courierName;
      if (cancellationReason) order.cancellationReason = cancellationReason;

      // If status changed to Cancelled, restock items back into inventory
      if (orderStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
        order.cancelledAt = new Date();
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockCount: item.quantity }
          });
        }
      }

      const updatedOrder = await order.save();

      // Trigger status update email to customer
      try {
        const { sendOrderStatusUpdateEmail } = require('../services/emailService');
        await sendOrderStatusUpdateEmail(updatedOrder, oldStatus);
      } catch (emailErr) {
        console.error('Failed to send status update email:', emailErr.message);
      }

      return res.json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Allow Customer to Cancel Order (if not yet shipped)
 * PUT /api/orders/:id/cancel
 */
const cancelOrderByCustomer = async (req, res) => {
  const { cancellationReason } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check ownership
    const isOwner = req.user && order.user && req.user._id.toString() === order.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You can only cancel your own orders.' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'This order is already cancelled.' });
    }

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      return res.status(400).json({ message: 'Cannot cancel an order that has already been shipped or delivered. Please contact support.' });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by customer';
    order.cancelledAt = new Date();

    // Restock items in inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: item.quantity }
      });
    }

    const updatedOrder = await order.save();

    // Send email notification to Customer & Admin
    try {
      const { sendOrderCancellationEmail } = require('../services/emailService');
      await sendOrderCancellationEmail(updatedOrder);
    } catch (emailErr) {
      console.error('Failed to send cancellation email:', emailErr.message);
    }

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/**
 * Fetch a single order's details by ID (authenticated or guest checkouts)
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    
    // Authorization check: allow only owner user or admin (or guests for guest orders)
    if (order.user) {
      const isOwner = req.user && req.user._id.toString() === order.user._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Access denied. Unauthorized order view.' });
      }
    }
    
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new Razorpay Order Transaction
 * POST /api/orders/razorpay-order
 */
const createRazorpayOrder = async (req, res) => {
  const { totalAmount } = req.body;

  if (!totalAmount) {
    return res.status(400).json({ message: 'Amount is required to create a transaction order' });
  }

  // If in mock mode (no keys configured), return a mock order response
  if (!razorpayInstance) {
    return res.json({
      id: `order_mock_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      amount: totalAmount * 100,
      currency: "INR",
      mock: true
    });
  }

  try {
    const options = {
      amount: Math.round(totalAmount * 100), // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };
    const order = await razorpayInstance.orders.create(options);
    return res.json(order);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return res.status(500).json({ message: 'Failed to create payment transaction. ' + error.message });
  }
};

/**
 * Verify Razorpay payment signature & save order to DB
 * POST /api/orders/verify-payment
 */
const verifyRazorpayPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    shippingDetails,
    totalAmount,
    isMock
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items present in order queue.' });
  }

  try {
    // 1. Verify payment signature (skip verification only if running in mock mode)
    if (razorpayInstance && !isMock) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification details are missing.' });
      }
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Cryptographic signature mismatch. Payment rejected.' });
      }
    }

    // 2. Validate stock limits before performing deductions
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stockCount < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.name}. Available: ${product.stockCount}`
        });
      }
    }

    // 3. Decrement stock counts for items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: -item.quantity }
      });
    }

    // 4. Save order to database
    const order = new Order({
      user: req.user ? req.user._id : null,
      items,
      shippingDetails,
      totalAmount,
      paymentStatus: 'Paid',
      orderStatus: 'Pending',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    const savedOrder = await order.save();

    // 5. Send order notification emails (SMTP nodemailer trigger will be added next)
    try {
      const { sendOrderReceipts } = require('../services/emailService');
      await sendOrderReceipts(savedOrder);
    } catch (mailErr) {
      console.error("Nodemailer failed to dispatch emails:", mailErr.message);
    }

    return res.status(201).json(savedOrder);

  } catch (error) {
    console.error("Payment verification server error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrderByCustomer,
  getOrderById,
  createRazorpayOrder,
  verifyRazorpayPayment
};
