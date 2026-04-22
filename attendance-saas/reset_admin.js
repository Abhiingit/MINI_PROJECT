
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-saas').then(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  const result = await User.updateOne({ email: 'admin@comp1.com' }, { password: hash });
  console.log('Admin password updated to: admin123', result);
  process.exit(0);
});
