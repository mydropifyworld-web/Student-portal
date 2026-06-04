// routes/assignments.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Assignment = require('../models/Assignment');
const User = require('../models/Student');
const { teacherAuth, auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignments/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, Word documents, and images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Teacher: Create assignment
router.post('/create', teacherAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, course, deadline, maxMarks } = req.body;
    
    const assignment = new Assignment({
      title,
      description,
      course,
      teacher: req.teacher.id,
      deadline,
      maxMarks: maxMarks || 10,
      file: req.file ? req.file.filename : null
    });

    await assignment.save();
    res.json({ message: 'Assignment created successfully', assignment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Teacher: Get all assignments for their course
router.get('/teacher/assignments', teacherAuth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      teacher: req.teacher.id  // Changed from req.user.id
    }).sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Teacher: Get assignment with student submissions
router.get('/teacher/assignments/:id', teacherAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Get students enrolled in the teacher's course
    const students = await User.find({
      isApproved: true,
      isTeacher: false,
      hasSubmittedAdmissionForm: true,
      $or: [
        { 'admissionForm.courseDetails.mainCategory': req.teacher.teacherCourse }, // Changed from req.user.teacherCourse
        { 
          'admissionForm.courseDetails.courseName': { 
            $regex: req.teacher.teacherCourse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
            $options: 'i' 
          } 
        }
      ]
    }).select('name email admissionForm assignmentSubmissions');

    // Add submission status for each student
    const studentsWithStatus = students.map(student => {
      const submission = student.assignmentSubmissions.find(
        sub => sub.assignmentId.toString() === req.params.id
      );
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        course: student.admissionForm.courseDetails.courseName,
        submission: submission || null,
        status: submission ? submission.status : 'pending'
      };
    });

    res.json({ assignment, students: studentsWithStatus });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Teacher: Grade assignment
router.put('/teacher/grade/:studentId/:assignmentId', teacherAuth, async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    
    const student = await User.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the submission
    const submissionIndex = student.assignmentSubmissions.findIndex(
      sub => sub.assignmentId.toString() === req.params.assignmentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update the submission
    student.assignmentSubmissions[submissionIndex].marks = marks;
    student.assignmentSubmissions[submissionIndex].feedback = feedback;
    student.assignmentSubmissions[submissionIndex].status = 'graded';
    
    await student.save();
    res.json({ message: 'Assignment graded successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Student: Get assignments for their course
router.get('/student/assignments', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const courseName = user.admissionForm.courseDetails.courseName;
    const mainCategory = user.admissionForm.courseDetails.mainCategory;
    
    // Find assignments for the student's course
    const assignments = await Assignment.find({
      $or: [
        { course: mainCategory },
        { course: { $regex: courseName, $options: 'i' } }
      ],
      deadline: { $gte: new Date() } // Only show assignments that aren't past deadline
    }).sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Student: Submit assignment
router.post('/student/submit/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if already submitted
    const existingSubmission = user.assignmentSubmissions.find(
      sub => sub.assignmentId.toString() === req.params.id
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Add submission
    user.assignmentSubmissions.push({
      assignmentId: req.params.id,
      submissionFile: req.file.filename,
      submittedAt: new Date(),
      status: 'submitted'
    });

    await user.save();
    res.json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Student: Get submission status for an assignment
router.get('/student/submission/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const submission = user.assignmentSubmissions.find(
      sub => sub.assignmentId.toString() === req.params.id
    );

    if (!submission) {
      return res.status(404).json({ message: 'No submission found' });
    }

    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;