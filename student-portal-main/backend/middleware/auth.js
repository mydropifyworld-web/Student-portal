const jwt = require('jsonwebtoken');
const User = require('../models/Student');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check Admin collection first
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      req.admin = admin;
      return next();
    }
    
    // Check Teacher collection
    const teacher = await Teacher.findById(decoded.id).select('-password');
    if (teacher) {
      req.teacher = teacher;
      return next();
    }
    
    // Check User collection (students)
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      return next();
    }
    
    throw new Error('User not found');
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Admin-specific authentication
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Teacher-specific authentication
const teacherAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const teacher = await Teacher.findById(decoded.id).select('-password');
    if (!teacher) {
      return res.status(403).json({ message: 'Teacher access required' });
    }
    
    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Student-specific authentication
const studentAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(403).json({ message: 'Student access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = { auth, adminAuth, teacherAuth, studentAuth };