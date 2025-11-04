const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const registerUser = async (req, res) => {
  console.time('registerTotal');
  const { regType, username, email, password, confirmPassword, contact, recaptchaToken } = req.body;

  // 1. Validate reCAPTCHA
  console.time('recaptcha');
  const secret = process.env.RECAPTCHA_SECRET;
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`;
  const recaptchaRes = await axios.post(verifyURL);
  console.timeEnd('recaptcha');
  if (!recaptchaRes.data.success) {
    console.timeEnd('registerTotal');
    return res.status(400).json({ success: false, message: 'reCAPTCHA failed' });
  }

  // 2. Check if user exists
  console.time('dbCheck');
  const existingUser = await User.findOne({ email });
  console.timeEnd('dbCheck');
  if (existingUser) {
    console.timeEnd('registerTotal');
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  // 3. Hash Password
  console.time('hashPassword');
  const hashedPwd = await bcrypt.hash(password, 8); // Reduced from 10 to 8 for better performance
  console.timeEnd('hashPassword');

  console.time('dbSave');
  const newUser = new User({ regType, username, email, password: hashedPwd, contact });
  await newUser.save();
  console.timeEnd('dbSave');

  console.timeEnd('registerTotal');
  res.json({ success: true, message: 'User registered' });
};

const loginUser = async (req, res) => {
  console.time('loginTotal');
  const { email, password, role } = req.body;

  console.time('findUser');
  const user = await User.findOne({ email });
  console.timeEnd('findUser');
  if (!user) {
    console.timeEnd('loginTotal');
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.regType !== role) {
    console.timeEnd('loginTotal');
    return res.status(401).json({ success: false, message: 'Invalid role' });
  }

  console.time('bcryptCompare');
  const isMatch = await bcrypt.compare(password, user.password);
  console.timeEnd('bcryptCompare');
  if (!isMatch) {
    console.timeEnd('loginTotal');
    return res.status(401).json({ success: false, message: 'Incorrect password' });
  }

  console.time('jwtSign');
  const token = jwt.sign({ id: user._id, role: user.regType }, process.env.JWT_SECRET, { expiresIn: '1d' });
  console.timeEnd('jwtSign');
  console.timeEnd('loginTotal');
  res.json({ success: true, token, user: { id: user._id, username: user.username, role: user.regType } });
};

module.exports = { registerUser, loginUser };
