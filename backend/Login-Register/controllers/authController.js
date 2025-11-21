const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, contact, recaptchaToken } = req.body;

    // Input validation
    if (!username || !email || !password || !confirmPassword || !contact || !recaptchaToken) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // 1. Validate reCAPTCHA
    const secret = process.env.RECAPTCHA_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`;
    const recaptchaRes = await axios.post(verifyURL);
    if (!recaptchaRes.data.success) {
      return res.status(400).json({ success: false, message: 'reCAPTCHA failed' });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or username already in use' });
    }

    // 3. Create new user (password hashing handled by pre-save middleware)
    const newUser = new User({ username, email, password, contact });
    await newUser.save();

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ success: false, message: 'Email or username already in use' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compare password using model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Generate token using model method
    const token = user.generateToken();

    res.json({ success: true, token, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { registerUser, loginUser };
