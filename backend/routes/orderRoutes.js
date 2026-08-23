const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrderByCustomer,
  getOrderById,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/orderController');
const { protect, adminOnly, optionalProtect } = require('../middleware/authMiddleware');

router.post('/', optionalProtect, createOrder);
router.post('/razorpay-order', optionalProtect, createRazorpayOrder);
router.post('/verify-payment', optionalProtect, verifyRazorpayPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/:id', optionalProtect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrderByCustomer);

module.exports = router;
