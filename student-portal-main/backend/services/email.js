const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, code) => {  // Changed parameter from token to code
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Student Portal',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Enter this code on the verification page to complete your registration.</p>
      <p>This code will expire in 1 hour.</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send verification email');
  }
};

const sendApprovalEmail = async (email, role, loginUrl) => {
  const roleName = role === 'teacher' ? 'Teacher' : 'Student';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Account Approved - ${roleName} Portal`,
    html: `
      <h2>Account Approval Notification</h2>
      <p>Your ${roleName} account has been successfully approved by the administrator.</p>
      <p>You can now login to your account using the link below:</p>
      <p><a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to ${roleName} Portal</a></p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p>${loginUrl}</p>
      <p>Thank you for joining our educational platform!</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw new Error('Could not send approval email');
  }
};

const sendAdmissionEmail = async (email, formData, courseFee) => {
  const registrationFee = 0;
  const totalAmount = courseFee + registrationFee;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'IT Centre RYK - Admission Form Submission',
    html: `
      <h2>IT Centre Rahim Yar Khan - Admission Form</h2>
      <p>Dear ${formData.personalDetails.studentName},</p>
      <p>Thank you for submitting your admission form. Below are the details:</p>
      
      <h3>Course Details</h3>
      <p><strong>Course:</strong> ${formData.courseDetails.courseName}</p>
      <p><strong>Batch:</strong> ${formData.courseDetails.batchNo}</p>
      <p><strong>Shift:</strong> ${formData.courseDetails.shift}</p>
      
      <h3>Fee Details</h3>
      <p><strong>Course Fee:</strong> Rs. ${courseFee.toLocaleString()}</p>
      <p><strong>Registration Fee:</strong> Rs. ${registrationFee.toLocaleString()}</p>
      <p><strong>Total Payable:</strong> Rs. ${totalAmount.toLocaleString()}</p>
      
      <h3>Next Steps</h3>
      <p>1. Please download and print the fee challan</p>
      <p>2. Deposit the fee in any authorized bank</p>
      <p>3. Submit the payment receipt through the portal</p>
      <p>4. Your admission will be confirmed after fee verification</p>
      
      <p>If you have any questions, please contact our admission office.</p>
      
      <p>Best regards,<br/>IT Centre Rahim Yar Khan</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Admission email sent to', email);
  } catch (error) {
    console.error('Error sending admission email:', error);
    throw new Error('Could not send admission email');
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendApprovalEmail, 
  sendAdmissionEmail 
};