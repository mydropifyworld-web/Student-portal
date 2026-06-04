const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true
    },
    email: {
    type: String,
    required: true,
    unique: true
    },
    password: {
    type: String,
    required: true
    },
    teacherCourse: {
  type: String,
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
    isTeacher: {
    type: Boolean,
    default: false
    },
    isApproved: {
    type: Boolean,
    default: false
   },
    isEmailVerified: {
    type: Boolean,
    default: false
    },
    emailVerificationCode: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
});

module.exports = mongoose.model('Teacher', TeacherSchema);
