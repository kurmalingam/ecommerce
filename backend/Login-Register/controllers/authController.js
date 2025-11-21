const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const registerUser = async (req, res) => {
  const { username, email, password, confirmPassword, contact, recaptchaToken } = req.body;

  // 1. Validate reCAPTCHA
  const secret = process.env.RECAPTCHA_SECRET;
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`;
  const recaptchaRes = await axios.post(verifyURL);
  if (!recaptchaRes.data.success) {
    return res.status(400).json({ success: false, message: 'reCAPTCHA failed' });
  }

  // 2. Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ success: false, message: 'Email already in use' });

  // 3. Hash Password
  const hashedPwd = await bcrypt.hash(password, 10);

  const newUser = new User({ username, email, password: hashedPwd, contact });
  await newUser.save();

  res.json({ success: true, message: 'User registered' });
};

const loginUser = async (req, res) => {
  console.time('loginTotal');
  const { email, password } = req.body;

  console.time('findUser');
  const user = await User.findOne({ email });
  console.timeEnd('findUser');
  if (!user) {
    console.timeEnd('loginTotal');
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  console.time('bcryptCompare');
  const isMatch = await bcrypt.compare(password, user.password);
  console.timeEnd('bcryptCompare');
  if (!isMatch) {
    console.timeEnd('loginTotal');
    return res.status(401).json({ success: false, message: 'Incorrect password' });
  }

  console.time('jwtSign');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  console.timeEnd('jwtSign');
  console.timeEnd('loginTotal');
  res.json({ success: true, token, user: { id: user._id, username: user.username } });
};

module.exports = { registerUser, loginUser };
