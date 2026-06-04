const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  assignmentSubmissions: [{
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  submissionFile: String,
  submittedAt: Date,
  marks: Number,
  feedback: String,
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'pending'
  }
}],
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
  isApproved: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isTeacher: {
    type: Boolean,
    default: false
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
  hasSubmittedAdmissionForm: {
    type: Boolean,
    default: false
  },
admissionForm: {
    paymentMethod: {
    type: String,
    enum: ['challan', 'card'],
    default: 'challan'
  },
  paymentVerified: {
    type: Boolean,
    default: false
  },
  paymentIntentId: String,
  courseDetails: {
    courseName: String,
    mainCategory: String, // Add this field
    batchNo: String,
    shift: String
  },
    personalDetails: {
      studentName: {
        type: String,
        trim: true,
        required: function() { return !this.isTeacher && this.hasSubmittedAdmissionForm; }
      },
      dob: {
        type: Date,
        required: function() { return !this.isTeacher && this.hasSubmittedAdmissionForm; }
      },
      gender: {
        type: String,

        required: function() { return !this.isTeacher && this.hasSubmittedAdmissionForm; }
      },
      religion: {
        type: String,
        trim: true
      },
      cnic: {
        type: String,
        match: /^[0-9]{13}$/,
        required: function() { return !this.isTeacher && this.hasSubmittedAdmissionForm; }
      },
      address: {
        type: String,
        trim: true,
        required: function() { return !this.isTeacher && this.hasSubmittedAdmissionForm; }
      },
      mobile: {
        type: String,
        match: /^[0-9]{10,15}$/,
        required: function() { return !this.isTeacher && this.hasSubmittedAdmissionForm; }
      },
      fatherName: {
        type: String,
        trim: true,
        required: function() { return !this.isTeacher && this.hasSubmittedAdmissionForm; }
      },
      fatherProfession: {
        type: String,
        trim: true
      },
      fatherIncome: {
        type: String,
        trim: true
      }
    },
    educationalDetails: {
      matric: {
        school: String,
        year: String,
        subjects: String,
        marks: String
      },
      intermediate: {
        school: String,
        year: String,
        subjects: String,
        marks: String
      },
      graduation: {
        school: String,
        year: String,
        subjects: String,
        marks: String
      },
      masters: {
        school: String,
        year: String,
        subjects: String,
        marks: String
      }
    },
    workExperience: {
      duration: String,
      companyName: String,
      joiningDate: Date,
      reasonLeave: String,
      endDate: Date
    },
    careerPlan: String,
    declaration: {
      studentName: String,
      parentName: String,
      date: Date
    },
    documents: {
      passportPic: String,
      cnicDoc: String,
      academicDocs: [String],
      paymentReceipt: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);