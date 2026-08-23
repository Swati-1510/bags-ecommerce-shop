const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_luxury_bag_token_key_123', {
    expiresIn: '30d'
  });
};

/**
 * Register a new consumer account (Sends 6-digit OTP to email)
 * POST /api/auth/register
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (!userExists.isVerified) {
        // Generate new OTP for unverified user and send email
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        userExists.otpCode = otpCode;
        userExists.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await userExists.save();

        try {
          await sendOtpEmail(userExists.email, userExists.name, otpCode);
        } catch (mailErr) {
          console.error('Failed to send OTP email:', mailErr.message);
        }

        return res.status(200).json({
          requireOtp: true,
          email: userExists.email,
          message: 'An unverified account exists. A new OTP verification code has been sent to your email.'
        });
      }
      return res.status(400).json({ message: 'Email already registered. Please log in.' });
    }

    let role = 'customer';
    if (email.toLowerCase().includes('admin') || req.body.role === 'admin') {
      role = 'admin';
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: role === 'admin', // Auto-verify admin accounts for testing convenience
      otpCode: role === 'admin' ? undefined : otpCode,
      otpExpires: role === 'admin' ? undefined : otpExpires
    });

    if (user) {
      if (role !== 'admin') {
        try {
          await sendOtpEmail(user.email, user.name, otpCode);
        } catch (mailErr) {
          console.error('Failed to send OTP email:', mailErr.message);
        }

        return res.status(201).json({
          requireOtp: true,
          email: user.email,
          message: 'Account created! Please enter the 6-digit OTP sent to your email address.'
        });
      }

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ message: 'Invalid registration parameters.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Verify 6-digit Email OTP
 * POST /api/auth/verify-otp
 */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.isVerified) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }

    if (!user.otpCode || user.otpCode !== (otp || '').trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check your email and try again.' });
    }

    if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Resend 6-digit OTP email
 * POST /api/auth/resend-otp
 */
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please log in.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOtpEmail(user.email, user.name, otpCode);
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
    }

    return res.json({ message: 'A new 6-digit OTP verification code has been sent to your email.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Google Sign-In & Sign-Up Auth
 * POST /api/auth/google
 */
const googleAuth = async (req, res) => {
  const { email, name, googleId } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Google authentication did not provide a valid email address.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        googleId,
        isVerified: true,
        role: 'customer'
      });
    } else {
      if (!user.isVerified) {
        user.isVerified = true;
      }
      if (!user.googleId && googleId) {
        user.googleId = googleId;
      }
      await user.save();
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Log in consumer account
 * POST /api/auth/login
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // If customer account is not verified, require OTP step
      if (user.role !== 'admin' && !user.isVerified) {
        // Send fresh OTP email
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
          await sendOtpEmail(user.email, user.name, otpCode);
        } catch (mailErr) {
          console.error('Failed to send OTP email:', mailErr.message);
        }

        return res.status(403).json({
          requireOtp: true,
          email: user.email,
          message: 'Your email address is not verified yet. A 6-digit OTP code has been sent to your email.'
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Secure, isolated admin credentials gate
 * POST /api/auth/admin/login
 */
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Account does not have administrator privileges.' });
      }
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Fetch authenticated profile details
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'Account not found.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  resendOtp,
  googleAuth,
  loginUser,
  loginAdmin,
  getMe
};
