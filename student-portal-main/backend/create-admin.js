// create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const createAdmin = async () => {
  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email: 'ahmedqasim123@gmail.com' });
    
    if (!admin) {
      // Create admin user
      admin = new Admin({
        name: 'Admin User',
        email: 'ahmedqasim123@gmail.com',
        password: 'Pakistan', // Change this to a secure password
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);

      await admin.save();
      console.log('Admin user created successfully');
      console.log('Email: ahmedqasim123@gmail.com');
      console.log('Password: Pakistan');
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  }
};

createAdmin();