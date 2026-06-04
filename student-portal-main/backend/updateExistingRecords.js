const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const updateExistingRecords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update existing records to add mainCategory based on courseName
    const result = await User.updateMany(
      {
        "hasSubmittedAdmissionForm": true,
        "admissionForm.courseDetails.courseName": { $exists: true },
        $or: [
          { "admissionForm.courseDetails.mainCategory": { $exists: false } },
          { "admissionForm.courseDetails.mainCategory": "" }
        ]
      },
      [
        {
          $set: {
            "admissionForm.courseDetails.mainCategory": {
              $switch: {
                branches: [
                  { 
                    case: { 
                      $in: [
                        "$admissionForm.courseDetails.courseName", 
                        [
                          "2-Month Training Series - Rs. 16,000", 
                          "3-Month Training Series - Rs. 21,000", 
                          "Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000"
                        ]
                      ] 
                    }, 
                    then: "Web Development (MERN Stack)" 
                  },
                  { 
                    case: { 
                      $in: [
                        "$admissionForm.courseDetails.courseName", 
                        [
                          "2-Month Training Series - Rs. 16,000", 
                          "3-Month Training Series - Rs. 21,000", 
                          "Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000"
                        ]
                      ] 
                    }, 
                    then: "App Development" 
                  },
                  { 
                    case: { 
                      $in: [
                        "$admissionForm.courseDetails.courseName", 
                        [
                          "2-Month Training Series - Rs. 16,000", 
                          "3-Month Training Series - Rs. 21,000", 
                          "Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000"
                        ]
                      ] 
                    }, 
                    then: "Graphic Designing" 
                  },
                  { 
                    case: { 
                      $in: [
                        "$admissionForm.courseDetails.courseName", 
                        [
                          "2-Month Training Series - Rs. 16,000", 
                          "3-Month Training Series - Rs. 21,000", 
                          "Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000"
                        ]
                      ] 
                    }, 
                    then: "Digital Marketing" 
                  },
                  { 
                    case: { $eq: ["$admissionForm.courseDetails.courseName", "2-Month Training Series - Rs. 25,000"] }, 
                    then: "Shopify / Ecommerce" 
                  },
                  { 
                    case: { $eq: ["$admissionForm.courseDetails.courseName", "1-Month Training Series - Rs. 15,000"] }, 
                    then: "Business Development" 
                  },
                  { 
                    case: { $eq: ["$admissionForm.courseDetails.courseName", "2-Month Training Series - Rs. 10,000"] }, 
                    then: "ICR For Kids" 
                  },
                  { 
                    case: { $eq: ["$admissionForm.courseDetails.courseName", "1-Month Training Series - Rs. 20,000"] }, 
                    then: "YouTube Automation" 
                  },
                  { 
                    case: { $eq: ["$admissionForm.courseDetails.courseName", "2-Month Training Series - Rs. 15,000"] }, 
                    then: "UI/UX Design" 
                  },
                  { 
                    case: { $eq: ["$admissionForm.courseDetails.courseName", "2-Month Training Series - Rs. 20,000"] }, 
                    then: "English Language" 
                  },
                  { 
                    case: { $eq: ["$admissionForm.courseDetails.courseName", "2-Month Training Series - Rs. 25,000"] }, 
                    then: "IELTS" 
                  },
                  { 
                    case: { 
                      $in: [
                        "$admissionForm.courseDetails.courseName", 
                        ["Amazon FBA Mastery", "Forex Trading", "SEO Blogging"]
                      ] 
                    }, 
                    then: "Other Specialized" 
                  }
                ],
                default: "Other Specialized"
              }
            }
          }
        }
      ]
    );

    console.log(`Updated ${result.modifiedCount} records`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating records:', error);
    process.exit(1);
  }
};

updateExistingRecords();