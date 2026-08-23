require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const queryRoutes = require('./routes/queryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Initialize Mongoose connection
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload directory locally for Cloudinary fallback uploading
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/settings', settingsRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: "Women's luxury bag brand API is running smoothly."
  });
});

// Fallback route 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Endpoint not found: ${req.originalUrl}` });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Express Server Error:", err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on Port ${PORT} under ${process.env.NODE_ENV || 'development'} mode.`);
});
