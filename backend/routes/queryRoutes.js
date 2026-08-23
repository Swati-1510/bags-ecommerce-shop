const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { sendQueryNotificationEmail } = require('../services/emailService');

// @desc    Submit a new customer query
// @route   POST /api/queries
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const query = await Query.create({ name, email, phone, message });
    
    // Dispatch email notification asynchronously without blocking the response
    sendQueryNotificationEmail(query).catch(console.error);

    res.status(201).json(query);
  } catch (error) {
    console.error('Error submitting query:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// @desc    Get all queries
// @route   GET /api/queries
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete/Dismiss a query
// @route   DELETE /api/queries/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    await query.deleteOne();
    res.json({ message: 'Query dismissed successfully' });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
