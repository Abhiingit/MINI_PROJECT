require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-saas').then(async () => {
  // ── Admin ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const adminResult = await User.findOneAndUpdate(
    { email: 'admin@comp1.com' },
    {
      $set: {
        name: 'Admin',
        email: 'admin@comp1.com',
        password: adminHash,
        role: 'admin',
        companyId: 'comp1',
        department: 'Management'
      }
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Admin  →  email: admin@comp1.com  |  password: admin123  (id: ${adminResult._id})`);

  // ── Student ────────────────────────────────────────────────────────────
  const studentHash = await bcrypt.hash('student123', 10);
  const studentResult = await User.findOneAndUpdate(
    { email: 'student@example.com' },
    {
      $set: {
        name: 'Test Student',
        email: 'student@example.com',
        password: studentHash,
        role: 'student',
        companyId: 'comp1',
        department: 'Engineering'
      }
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Student →  email: student@example.com  |  password: student123  (id: ${studentResult._id})`);

  console.log('\nDone! Both accounts are ready.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
