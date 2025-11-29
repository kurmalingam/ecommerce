const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./Login-Register/routes/authRoutes');

dotenv.config();

// Validate environment variables
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}
if (!process.env.RECAPTCHA_SECRET) {
  console.error('RECAPTCHA_SECRET is not defined in environment variables');
  process.exit(1);
}
if (!process.env.PORT) {
  console.error('PORT is not defined in environment variables');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes); // All auth-related routes

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Increase connection pool size
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

