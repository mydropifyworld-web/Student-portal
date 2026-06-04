// routes/attendance.js
const express = require('express');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/Student');
const { auth, teacherAuth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Submit attendance (teacher only)
// routes/attendance.js (update the submit route)
router.post('/submit', teacherAuth, async (req, res) => {
  try {
    const { date, attendanceRecords } = req.body;
    const teacherId = req.teacher.id;
    const teacherCourse = req.teacher.teacherCourse;

    // Validate input
    if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const results = [];
    const bulkOperations = [];

    // Process each attendance record
    for (const record of attendanceRecords) {
      const { studentId, status } = record;
      
      // Check if student exists and is enrolled in teacher's course
      const student = await User.findOne({
        _id: studentId,
        isTeacher: false,
        isApproved: true,
        hasSubmittedAdmissionForm: true,
        $or: [
          { 'admissionForm.courseDetails.mainCategory': teacherCourse },
          { 
            'admissionForm.courseDetails.courseName': { 
              $regex: teacherCourse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
              $options: 'i' 
            } 
          }
        ]
      });

      if (!student) {
        results.push({
          studentId,
          status: 'error',
          message: 'Student not found or not enrolled in your course'
        });
        continue;
      }

      // Create upsert operation
      bulkOperations.push({
        updateOne: {
          filter: {
            studentId: studentId,
            date: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          },
          update: {
            $set: {
              studentId: studentId,
              teacherId: teacherId,
              course: teacherCourse,
              date: attendanceDate,
              status: status,
              batchNo: student.admissionForm.courseDetails.batchNo,
              shift: student.admissionForm.courseDetails.shift
            }
          },
          upsert: true
        }
      });

      results.push({
        studentId,
        status: 'processed'
      });
    }

    // Execute all operations in bulk
    if (bulkOperations.length > 0) {
      const bulkResult = await Attendance.bulkWrite(bulkOperations);
      
      res.json({ 
        message: 'Attendance submitted successfully',
        results,
        bulkResult: {
          upsertedCount: bulkResult.upsertedCount,
          modifiedCount: bulkResult.modifiedCount
        }
      });
    } else {
      res.status(400).json({ message: 'No valid attendance records to process' });
    }
  } catch (err) {
    console.error('Attendance submission error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get attendance for a specific date (teacher only)
router.get('/date/:date', teacherAuth, async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const teacherCourse = req.teacher.teacherCourse;
    const dateParam = new Date(req.params.date);
    
    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateParam);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      teacherId,
      course: teacherCourse,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).populate('studentId', 'name email admissionForm.courseDetails');

    res.json(attendance);
  } catch (err) {
    console.error('Error fetching attendance:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get student attendance summary (student only)
router.get('/student/summary', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get attendance records for the last 30 days
    const attendance = await Attendance.find({
      studentId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    // Calculate summary
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const leaveDays = attendance.filter(a => a.status === 'leave').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    res.json({
      summary: {
        totalDays,
        presentDays,
        absentDays,
        leaveDays,
        attendancePercentage: attendancePercentage.toFixed(2)
      },
      recentRecords: attendance.slice(0, 10) // Last 10 records
    });
  } catch (err) {
    console.error('Error fetching attendance summary:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get all attendance dates for a teacher
router.get('/dates', teacherAuth, async (req, res) => {
  try {
    const dates = await Attendance.aggregate([
      {
        $match: {
          teacherId: req.teacher._id,
          course: req.teacher.teacherCourse
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json(dates.map(d => d._id));
  } catch (err) {
    console.error('Error fetching attendance dates:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get attendance history for a specific student (teacher only)
router.get('/student/:studentId', teacherAuth, async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const teacherCourse = req.teacher.teacherCourse;
    const { studentId } = req.params;

    // Verify the student is in the teacher's course
    const student = await User.findOne({
      _id: studentId,
      isTeacher: false,
      isApproved: true,
      hasSubmittedAdmissionForm: true,
      $or: [
        { 'admissionForm.courseDetails.mainCategory': teacherCourse },
        { 
          'admissionForm.courseDetails.courseName': { 
            $regex: teacherCourse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
            $options: 'i' 
          } 
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found in your course' });
    }

    const attendance = await Attendance.find({
      studentId,
      teacherId,
      course: teacherCourse
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error('Error fetching student attendance:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Update attendance record (teacher only)
router.put('/:id', teacherAuth, async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const { id } = req.params;
    const { status } = req.body;

    // Find the attendance record
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Verify the teacher owns this record
    if (attendance.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }

    // Update the record
    attendance.status = status;
    await attendance.save();

    res.json({ message: 'Attendance updated successfully', attendance });
  } catch (err) {
    console.error('Error updating attendance:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;