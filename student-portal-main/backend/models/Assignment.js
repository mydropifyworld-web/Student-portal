// models/Assignment.js
const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
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
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  file: String // If teacher wants to attach a file
});

module.exports = mongoose.model('Assignment', AssignmentSchema);