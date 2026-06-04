const express = require('express');
const User = require('../models/Student');
const { auth, adminAuth } = require('../middleware/auth');
const uploadFiles = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Submit admission form
router.post('/submit', auth, uploadFiles, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.hasSubmittedAdmissionForm) {
      return res.status(400).json({ message: 'Admission form already submitted' });
    }
    
    // Parse the form data from the request
    let formData = {};
    try {
      formData = JSON.parse(req.body.data);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid form data format' });
    }

    // Handle file uploads
    const documents = {};
    
    if (req.files) {
      if (req.files['passportPic']) {
        documents.passportPic = req.files['passportPic'][0].path;
      }
      if (req.files['cnicDoc']) {
        documents.cnicDoc = req.files['cnicDoc'][0].path;
      }
      if (req.files['academicDocs']) {
        documents.academicDocs = req.files['academicDocs'].map(file => file.path);
      }
      if (req.files['paymentReceipt']) {
        documents.paymentReceipt = req.files['paymentReceipt'][0].path;
      }
    }
    
    // Log the form data for debugging
    console.log('Form data received:', {
      courseDetails: formData.courseDetails,
      hasMainCategory: !!formData.courseDetails?.mainCategory
    });
    
    // Update user with admission form data
    user.admissionForm = {
      ...formData,
      documents: documents
    };
    user.hasSubmittedAdmissionForm = true;
    
    await user.save();
    
    // Log the saved data for verification
    console.log('User admission form saved:', {
      userId: user._id,
      courseName: user.admissionForm.courseDetails?.courseName,
      mainCategory: user.admissionForm.courseDetails?.mainCategory,
      hasSubmitted: user.hasSubmittedAdmissionForm
    });
    
    res.json({ message: 'Admission form submitted successfully. Waiting for admin approval.' });
  } catch (err) {
    console.error('Submission error:', err.message);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      });
    }
    
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get admission form data (for admin)
router.get('/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.hasSubmittedAdmissionForm) {
      return res.status(404).json({ message: 'Admission form not submitted yet' });
    }
    
    res.json(user.admissionForm);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add this route for creating Stripe payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'pkr' } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents/paisa
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user.id.toString(),
      }
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Add this route for confirming payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Verify the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update user record to mark payment as completed
      await User.findByIdAndUpdate(req.user.id, {
        'admissionForm.paymentVerified': true,
        'admissionForm.paymentMethod': 'card',
        'admissionForm.paymentIntentId': paymentIntentId
      });
      
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});



// Add these routes to your admission.js file

// Verify payment (for admin)
router.put('/verify-payment/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.admissionForm.paymentVerified = true;
    await user.save();
    
    res.json({ message: 'Payment verified successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Check payment status
router.get('/payment-status/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('admissionForm');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      paymentVerified: user.admissionForm.paymentVerified,
      paymentMethod: user.admissionForm.paymentMethod
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update the existing confirm-payment endpoint to set paymentVerified to true
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update payment details
    user.admissionForm.paymentVerified = true;
    user.admissionForm.paymentIntentId = paymentIntentId;
    user.admissionForm.paymentMethod = 'card';
    
    await user.save();
    
    res.json({ message: 'Payment confirmed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;