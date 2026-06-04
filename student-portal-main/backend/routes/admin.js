const express = require('express');
const User = require('../models/Student');
const Teacher = require('../models/Teacher');
const { adminAuth } = require('../middleware/auth');
const { sendApprovalEmail } = require('../services/email');
const router = express.Router();

// All routes should use adminAuth middleware
// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ isTeacher: false }).select('-password').sort({ date: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all teachers (admin only)
router.get('/teachers', adminAuth, async (req, res) => {
  try {
    const teachers = await Teacher.find({ isTeacher: true }).select('-password').sort({ date: -1 });
    res.json(teachers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Approve user (admin only)
router.put('/approve/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    
    // Send approval email to student
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/login`;
      await sendApprovalEmail(user.email, 'student', loginUrl);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails, just log it
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Approve teacher (admin only)
router.put('/approve-teacher/:id', adminAuth, async (req, res) => {
  try {
    const user = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    
    // Send approval email to teacher
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/teacher-login`;
      await sendApprovalEmail(user.email, 'teacher', loginUrl);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails, just log it
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Delete user (student)
router.delete('/delete-user/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deletion of admin accounts
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete teacher
router.delete('/delete-teacher/:id', adminAuth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Make sure it's a teacher
    if (!teacher.isTeacher) {
      return res.status(400).json({ message: 'Not a teacher account' });
    }
    
    // Prevent deletion of admin accounts
    if (teacher.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }
    
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;