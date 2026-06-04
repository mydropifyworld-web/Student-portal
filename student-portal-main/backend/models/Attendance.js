// models/Attendance.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  course: {
    type: String,
    required: true,
    enum: [
      'Web Development (MERN Stack)', 
      'App Development', 
      'Graphic Designing', 
      'Digital Marketing', 
      'Shopify / Ecommerce',
      'Business Development',
      'ICR For Kids',
      'YouTube Automation',
      'UI/UX Design',
      'English Language',
      'IELTS',
      'Other Specialized'
    ]
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'leave'],
    default: 'absent'
  },
  batchNo: String,
  shift: String
}, {
  timestamps: true
});

// Create compound index to prevent duplicate attendance records
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);