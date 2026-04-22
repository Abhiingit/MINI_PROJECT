require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-saas').then(async () => {
  const emails = ['admin@comp1.com', 'student@example.com'];
  const users = await User.find({ email: { $in: emails } });

  if (users.length === 0) {
    console.log('❌ No users found in DB at all!');
    process.exit(1);
  }

  for (const u of users) {
    const a = await bcrypt.compare('admin123', u.password);
    const s = await bcrypt.compare('student123', u.password);
    console.log(`\nEmail   : ${u.email}`);
    console.log(`Role    : ${u.role}`);
    console.log(`CompanyId: ${u.companyId}`);
    console.log(`admin123 matches  : ${a}`);
    console.log(`student123 matches: ${s}`);
  }
  process.exit(0);
}).catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});
