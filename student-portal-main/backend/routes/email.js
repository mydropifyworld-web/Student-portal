// backend/routes/email.js
const express = require('express');
const { sendAdmissionEmail } = require('../services/email');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Send admission form via email
router.post('/send-admission', auth, async (req, res) => {
  try {
    const { email, formData, courseFee } = req.body;
    
    await sendAdmissionEmail(email, formData, courseFee);
    
    res.json({ message: 'Admission form sent via email successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Failed to send admission email' });
  }
});

module.exports = router;