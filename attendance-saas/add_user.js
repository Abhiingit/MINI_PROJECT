require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log("Usage: node add_user.js <name> <email> <password> [role] [department] [companyId]");
  console.log("Example: node add_user.js \"John Doe\" john@example.com mypassword123 student IT comp1");
  process.exit(1);
}

const [name, email, password, role = "student", department = "General", companyId = "comp1"] = args;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-saas').then(async () => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log(`❌ User with email ${email} already exists!`);
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hash,
      role,
      department,
      companyId
    });

    console.log(`✅ Successfully added user: ${newUser.name} (${newUser.email}) as ${newUser.role}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error saving user:', err.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ DB Error:', err.message);
  process.exit(1);
});
