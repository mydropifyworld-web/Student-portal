const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/Student');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const { auth, teacherAuth } = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/email');
const router = express.Router();

// Student Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if email exists in Teacher collection
    let teacher = await Teacher.findOne({ email });
    if (teacher) {
      return res.status(400).json({ message: 'Email already registered as teacher' });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = Date.now() + 3600000; // 1 hour

    user = new User({
      name,
      email,
      password,
      isTeacher: false, // Explicitly set as student
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
      res.json({ 
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true
      });
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Could not send verification email' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Teacher Register
router.post('/teacher-register', async (req, res) => {
  const { name, email, password, teacherCourse } = req.body;

  try {
    let teacher = await Teacher.findOne({ email });
    if (teacher) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if email exists in User collection
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered as student' });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = Date.now() + 3600000; // 1 hour

    teacher = new Teacher({
      name,
      email,
      password,
      isTeacher: true, // Explicitly set as teacher
      teacherCourse,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires
    });

    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(password, salt);

    await teacher.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
      res.json({ 
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true
      });
    } catch (emailError) {
      await Teacher.findByIdAndDelete(teacher._id);
      return res.status(500).json({ message: 'Could not send verification email' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Verify Email (for both students and teachers)
router.post('/verify-email', async (req, res) => {
  const { code } = req.body;
  try {
    // Check in User collection first
    let user = await User.findOne({
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    });

    let isTeacher = false;
    
    // If not found in User collection, check in Teacher collection
    if (!user) {
      user = await Teacher.findOne({
        emailVerificationCode: code,
        emailVerificationExpires: { $gt: Date.now() }
      });
      isTeacher = true;
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const message = isTeacher 
      ? 'Email verified successfully! Waiting for admin approval to access teacher dashboard.'
      : 'Email verified successfully! Please complete your admission form.';

    res.json({ 
      message,
      isTeacher
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    // Check in both collections
    let user = await User.findOne({ email });
    let isTeacher = false;
    
    if (!user) {
      user = await Teacher.findOne({ email });
      isTeacher = true;
    }
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = Date.now() + 3600000; // 1 hour

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);
    
    res.json({ message: 'Verification email sent successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Student Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is a teacher trying to login as student
    if (user.isTeacher) {
      return res.status(400).json({ message: 'Please use teacher login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }

    const payload = {
      id: user.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            isApproved: user.isApproved,
            hasSubmittedAdmissionForm: user.hasSubmittedAdmissionForm
          } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Teacher Login
router.post('/teacher-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await Teacher.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is a student trying to login as teacher
    if (!user.isTeacher) {
      return res.status(400).json({ message: 'Please use student login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }

    // Check if admin approval is required for teachers
    if (!user.isApproved) {
      return res.status(400).json({ 
        message: 'Account not approved yet. Please wait for admin approval.',
        requiresApproval: true
      });
    }

    const payload = {
      id: user.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            isApproved: user.isApproved,
            isTeacher: user.isTeacher,
            teacherCourse: user.teacherCourse
          } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: admin.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          admin: { 
            id: admin.id, 
            name: admin.name, 
            email: admin.email
          } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user data
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get teacher data
router.get('/teacher', teacherAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher.id).select('-password');
    res.json(teacher);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;