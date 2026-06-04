import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import Challan from './Challan';
import '../../styles/AdmissionForm.css';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S0HXjGZwTv0wMspmbKha0IlXNfe4Vbcsc9L6ZjutbNmxNCv1ADy9eOk6AmOdBuIWnCWAKXHqajqgYw2fGIBtH5T008VuKEyIb');


// Stripe Checkout Form Component
const StripeCheckoutForm = ({ 
  amount, 
  onSuccess, 
  onCancel, 
  formData,
  courseFee 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the component mounts
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const response = await axios.post(
          'https://student-portal-production-7307.up.railway.app/api/admission/create-payment-intent',
          { amount: courseFee, currency: 'pkr' },
          config
        );
        
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment');
        console.error('Error creating payment intent:', err);
      }
    };

    createPaymentIntent();
  }, [courseFee]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: formData.personalDetails.studentName,
          email: formData.personalDetails.email,
          phone: formData.personalDetails.mobile,
        },
      }
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm payment with backend
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        await axios.post(
          'https://student-portal-production-7307.up.railway.app/api/admission/confirm-payment',
          { paymentIntentId: paymentIntent.id },
          config
        );
        
        onSuccess();
      } catch (err) {
        setError('Payment verification failed');
        console.error('Error confirming payment:', err);
      }
    }
  };

  return (
    <div className="stripe-payment-modal">
      <div className="stripe-payment-content">
        <h3>Pay with Card</h3>
        <div className="payment-summary">
          <h4>Payment Summary</h4>
          <p><strong>Course:</strong> {formData.courseDetails.courseName}</p>
          <p><strong>Amount:</strong> PKR {courseFee.toLocaleString()}</p>
          <p><strong>Student:</strong> {formData.personalDetails.studentName}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="stripe-form">
          <div className="card-element-container">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          
          {error && <div className="stripe-error">{error}</div>}
          
          <div className="stripe-buttons">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!stripe || processing}
            >
              {processing ? 'Processing...' : `Pay PKR ${courseFee.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AdmissionForm = () => {
  const [formData, setFormData] = useState({
    courseDetails: { 
      courseName: '', 
      mainCategory: '',
      batchNo: '', 
      shift: '' 
    },
    personalDetails: { 
      studentName: '', 
      dob: '', 
      gender: '', 
      religion: '', 
      cnic: '', 
      address: '', 
      mobile: '', 
      email: '',
      fatherName: '', 
      fatherProfession: '', 
      fatherIncome: '' 
    },
    educationalDetails: {
      matric: { school: '', year: '', subjects: '', marks: '' },
      intermediate: { school: '', year: '', subjects: '', marks: '' },
      graduation: { school: '', year: '', subjects: '', marks: '' },
      masters: { school: '', year: '', subjects: '', marks: '' }
    },
    workExperience: { 
      duration: '', 
      companyName: '', 
      joiningDate: '', 
      reasonLeave: '', 
      endDate: '' 
    },
    careerPlan: '',
    declaration: { 
      studentName: '', 
      parentName: '', 
      date: new Date().toISOString().split('T')[0] 
    }
  });

  const [files, setFiles] = useState({
    passportPic: null,
    cnicDoc: null,
    academicDocs: [],
    paymentReceipt: null
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChallanDownloaded, setIsChallanDownloaded] = useState(false);
  const [courseFee, setCourseFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('challan');
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
  verified: false,
  method: 'challan'
});
  const [user, setUser] = useState(null);
  const challanRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
  document.title = "Admission Form";
}, []); 

  // Add this useEffect to check payment status on component load
useEffect(() => {
  const checkPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const res = await axios.get(
        `https://student-portal-production-7307.up.railway.app/api/admission/payment-status/${user._id}`,
        config
      );
      
      setPaymentStatus({
        verified: res.data.paymentVerified,
        method: res.data.paymentMethod
      });
      
      // If payment is already verified via card, update local state
      if (res.data.paymentVerified && res.data.paymentMethod === 'card') {
        setPaymentVerified(true);
        setPaymentMethod('card');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };
  
  if (user && user._id) {
    checkPaymentStatus();
  }
}, [user]);

  // Check authentication and admission form status
  useEffect(() => {
    const checkAuthAndFormStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const res = await axios.get('https://student-portal-production-7307.up.railway.app/api/auth/user', config);
        setUser(res.data);
        
        // Redirect to dashboard if admission form is already submitted
        if (res.data.hasSubmittedAdmissionForm) {
          navigate('/dashboard');
          return;
        }
        
        // Redirect to waiting page if already approved
        if (res.data.isApproved) {
          navigate('/waiting-approval');
          return;
        }
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuthAndFormStatus();
  }, [navigate]);

  // Calculate course fee based on selection
  useEffect(() => {
    const feeMapping = {
      '2-Month Training Series - Rs. 16,000 (Web Dev)': 16000,
      '3-Month Training Series - Rs. 21,000 (Web Dev)': 21000,
      'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Web Dev)': 35000,
      '2-Month Training Series - Rs. 16,000 (App Dev)': 16000,
      '3-Month Training Series - Rs. 21,000 (App Dev)': 21000,
      'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (App Dev)': 35000,
      '2-Month Training Series - Rs. 16,000 (Graphic Design)': 16000,
      '3-Month Training Series - Rs. 21,000 (Graphic Design)': 21000,
      'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Graphic Design)': 35000,
      '2-Month Training Series - Rs. 16,000 (Digital Marketing)': 16000,
      '3-Month Training Series - Rs. 21,000 (Digital Marketing)': 21000,
      'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Digital Marketing)': 35000,
      '2-Month Training Series - Rs. 25,000': 25000,
      '1-Month Training Series - Rs. 15,000': 15000,
      '2-Month Training Series - Rs. 10,000': 10000,
      '1-Month Training Series - Rs. 20,000': 20000,
      '2-Month Training Series - Rs. 15,000': 15000,
      '2-Month Training Series - Rs. 20,000': 20000,
      '2-Month Training Series - Rs. 25,000 (IELTS)': 25000,
      'Amazon FBA Mastery': 30000,
      'Forex Trading': 25000,
      'SEO Blogging': 20000
    };
    
    if (formData.courseDetails.courseName) {
      setCourseFee(feeMapping[formData.courseDetails.courseName] || 0);
    }
  }, [formData.courseDetails.courseName]);

  const handleInputChange = (section, field, value, subSection = null) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      if (section === 'courseDetails' && field === 'courseName') {
        const courseMapping = {
          '2-Month Training Series - Rs. 16,000 (Web Dev)': 'Web Development (MERN Stack)',
          '3-Month Training Series - Rs. 21,000 (Web Dev)': 'Web Development (MERN Stack)',
          'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Web Dev)': 'Web Development (MERN Stack)',
          '2-Month Training Series - Rs. 16,000 (App Dev)': 'App Development',
          '3-Month Training Series - Rs. 21,000 (App Dev)': 'App Development',
          'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (App Dev)': 'App Development',
          '2-Month Training Series - Rs. 16,000 (Graphic Design)': 'Graphic Designing',
          '3-Month Training Series - Rs. 21,000 (Graphic Design)': 'Graphic Designing',
          'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Graphic Design)': 'Graphic Designing',
          '2-Month Training Series - Rs. 16,000 (Digital Marketing)': 'Digital Marketing',
          '3-Month Training Series - Rs. 21,000 (Digital Marketing)': 'Digital Marketing',
          'Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Digital Marketing)': 'Digital Marketing',
          '2-Month Training Series - Rs. 25,000': 'Shopify / Ecommerce',
          '1-Month Training Series - Rs. 15,000': 'Business Development',
          '2-Month Training Series - Rs. 10,000': 'ICR For Kids',
          '1-Month Training Series - Rs. 20,000': 'YouTube Automation',
          '2-Month Training Series - Rs. 15,000': 'UI/UX Design',
          '2-Month Training Series - Rs. 20,000': 'English Language',
          '2-Month Training Series - Rs. 25,000 (IELTS)': 'IELTS',
          'Amazon FBA Mastery': 'Other Specialized',
          'Forex Trading': 'Other Specialized',
          'SEO Blogging': 'Other Specialized'
        };
        
        updated[section][field] = value;
        updated[section].mainCategory = courseMapping[value] || 'Other Specialized';
      } else if (subSection) {
        updated[section][subSection][field] = value;
      } else {
        updated[section][field] = value;
      }
      return updated;
    });
  };

  const handleFileChange = (field, selectedFiles) => {
    setFiles(prev => {
      if (field === 'academicDocs') {
        return { ...prev, [field]: Array.from(selectedFiles) };
      } else {
        return { ...prev, [field]: selectedFiles[0] };
      }
    });
  };

  // Download challan as PDF
  const downloadChallan = () => {
    if (!challanRef.current) return;
    
    const element = challanRef.current;
    const opt = {
      filename: 'ICR_Fee_Challan.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      setIsChallanDownloaded(true);
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check payment verification based on method
    if (paymentMethod === 'challan' && !isChallanDownloaded) {
      setError('Please download the challan first');
      setIsLoading(false);
      return;
    }

    if (paymentMethod === 'card' && !paymentVerified) {
      setError('Please complete the payment first');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData object to handle file uploads
      const submissionData = new FormData();
      
      // Ensure mainCategory is included in the form data
      const formDataWithMainCategory = {
        ...formData,
        courseDetails: {
          ...formData.courseDetails,
          mainCategory: formData.courseDetails.mainCategory || 'Other Specialized'
        },
        paymentMethod: paymentMethod,
        paymentVerified: paymentMethod === 'card'
      };
      
      // Append all form data
      submissionData.append('data', JSON.stringify(formDataWithMainCategory));
      
      // Append files
      if (files.passportPic) submissionData.append('passportPic', files.passportPic);
      if (files.cnicDoc) submissionData.append('cnicDoc', files.cnicDoc);
      if (files.paymentReceipt) submissionData.append('paymentReceipt', files.paymentReceipt);
      
      // Append multiple academic docs
      files.academicDocs.forEach((file, index) => {
        submissionData.append('academicDocs', file);
      });

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('https://student-portal-production-7307.up.railway.app/api/admission/submit', submissionData, config);
      
      // Send email with admission form details
      try {
        await axios.post('https://student-portal-production-7307.up.railway.app/api/email/send-admission', {
          email: formData.personalDetails.email,
          formData: formDataWithMainCategory,
          courseFee: courseFee
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the submission if email fails
      }
      
      setSuccess('Admission form submitted successfully! Waiting for admin approval.');
      setTimeout(() => navigate('/waiting-approval'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Form submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Add payment method selection UI
  const renderPaymentMethodSelection = () => (
    <div className="section">
      <h3>Payment Method</h3>
      <div className="payment-method-options">
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="challan"
            checked={paymentMethod === 'challan'}
            onChange={() => setPaymentMethod('challan')}
          />
          Bank Challan
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={() => setPaymentMethod('card')}
          />
          Credit/Debit Card
        </label>
      </div>
    </div>
  );

  // Update the fee challan section to conditionally render based on payment method
const renderFeeSection = () => {
  if (paymentMethod === 'challan') {
    return (
      <div className="section">
        <h3>Fee Challan</h3>
        <div ref={challanRef}>
          <Challan formData={formData} courseFee={courseFee} />
        </div>
        <button 
          type="button" 
          className="download-challan-btn"
          onClick={downloadChallan}
          disabled={!formData.courseDetails.courseName || !formData.personalDetails.studentName}
        >
          Download Challan
        </button>
        
        {/* Show payment status for challan */}
        {paymentStatus.verified && paymentStatus.method === 'challan' && (
          <div className="payment-verified">
            <i className="fas fa-check-circle"></i>
            Payment verified by admin
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="section">
        <h3>Card Payment</h3>
        <p>Pay securely using your credit or debit card</p>
        
        {paymentVerified || paymentStatus.verified ? (
          <div className="payment-verified">
            <i className="fas fa-check-circle"></i>
            Payment successful
          </div>
        ) : (
          <button 
            type="button" 
            className="stripe-payment-btn"
            onClick={() => setShowStripeModal(true)}
            disabled={!formData.courseDetails.courseName || !formData.personalDetails.studentName}
          >
            Pay with Card
          </button>
        )}
      </div>
    );
  }
};

  // Show loading while checking authentication
  if (!user) {
    return <div className="admission-form-container">Loading...</div>;
  }

  return (
    <div className="admission-form-container">
      <h2>IT CENTRE Rahim Yar Khan<br />Student Admission Form</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Course Details */}
        <div className="section">
          <h3>Course Details</h3>
          <label>Course Name:
            <select 
              value={formData.courseDetails.courseName} 
              onChange={e => handleInputChange('courseDetails', 'courseName', e.target.value)} 
              required
            >
              <option value="">--Select a Course--</option>
                <optgroup label="Web Development (MERN Stack)">
                  <option>2-Month Training Series - Rs. 16,000 (Web Dev)</option>
                  <option>3-Month Training Series - Rs. 21,000 (Web Dev)</option>
                  <option>Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Web Dev)</option>
                </optgroup>
                <optgroup label="App Development">
                  <option>2-Month Training Series - Rs. 16,000 (App Dev)</option>
                  <option>3-Month Training Series - Rs. 21,000 (App Dev)</option>
                  <option>Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (App Dev)</option>
                </optgroup>
                <optgroup label="Graphic Designing">
                  <option>2-Month Training Series - Rs. 16,000 (Graphic Design)</option>
                  <option>3-Month Training Series - Rs. 21,000 (Graphic Design)</option>
                  <option>Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Graphic Design)</option>
                </optgroup>
                <optgroup label="Business Development">
                  <option>1-Month Training Series - Rs. 15,000</option>
                </optgroup>
                <optgroup label="ICR For Kids">
                  <option>2-Month Training Series - Rs. 10,000</option>
                </optgroup>
                <optgroup label="YouTube Automation">
                  <option>1-Month Training Series - Rs. 20,000</option>
                </optgroup>
                <optgroup label="UI/UX Design">
                  <option>2-Month Training Series - Rs. 15,000</option>
                </optgroup>
                <optgroup label="English Language">
                  <option>2-Month Training Series - Rs. 20,000</option>
                </optgroup>
                <optgroup label="IELTS">
                  <option>2-Month Training Series - Rs. 25,000 (IELTS)</option>
                </optgroup>
                <optgroup label="Digital Marketing">
                  <option>2-Month Training Series - Rs. 16,000 (Digital Marketing)</option>
                  <option>3-Month Training Series - Rs. 21,000 (Digital Marketing)</option>
                  <option>Pro-20 Training Series (3 Months, 8 hrs) - Rs. 35,000 (Digital Marketing)</option>
                </optgroup>
                <optgroup label="Shopify / Ecommerce">
                  <option>2-Month Training Series - Rs. 25,000</option>
                </optgroup>
                <optgroup label="Other Specialized">
                  <option>Amazon FBA Mastery</option>
                  <option>Forex Trading</option>
                  <option>SEO Blogging</option>
                </optgroup>
            </select>
          </label>
          <label>Batch #: 
            <input 
              type="text" 
              value={formData.courseDetails.batchNo} 
              onChange={e => handleInputChange('courseDetails', 'batchNo', e.target.value)} 
            />
          </label>
          <label>Shift: 
            <input 
              type="text" 
              value={formData.courseDetails.shift} 
              onChange={e => handleInputChange('courseDetails', 'shift', e.target.value)} 
            />
          </label>
        </div>

        {/* Personal Details */}
        <div className="section">
          <h3>Personal Details</h3>
          <label>Name (Mr./Ms.): 
            <input 
              type="text" 
              value={formData.personalDetails.studentName} 
              onChange={e => handleInputChange('personalDetails', 'studentName', e.target.value)} 
              required 
            />
          </label>
          <label>Date of Birth (DD/MM/YYYY): 
            <input 
              type="date" 
              value={formData.personalDetails.dob} 
              onChange={e => handleInputChange('personalDetails', 'dob', e.target.value)} 
            />
          </label>
          <label>Gender:
            <select 
              value={formData.personalDetails.gender} 
              onChange={e => handleInputChange('personalDetails', 'gender', e.target.value)}
            >
              <option value="">--Select--</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </label>
          <label>Religion: 
            <input 
              type="text" 
              value={formData.personalDetails.religion} 
              onChange={e => handleInputChange('personalDetails', 'religion', e.target.value)} 
            />
          </label>
          <label>CNIC: 
            <input 
              type="text" 
              value={formData.personalDetails.cnic} 
              onChange={e => handleInputChange('personalDetails', 'cnic', e.target.value)} 
            />
          </label>
          <label>Address: 
            <textarea 
              value={formData.personalDetails.address} 
              onChange={e => handleInputChange('personalDetails', 'address', e.target.value)} 
            />
          </label>
          <label>Mobile No: 
            <input 
              type="text" 
              value={formData.personalDetails.mobile} 
              onChange={e => handleInputChange('personalDetails', 'mobile', e.target.value)} 
            />
          </label>
          <label>Email ID: 
            <input 
              type="email" 
              value={formData.personalDetails.email} 
              onChange={e => handleInputChange('personalDetails', 'email', e.target.value)} 
            />
          </label>
          <label>Father's Name (with Mobile No.): 
            <input 
              type="text" 
              value={formData.personalDetails.fatherName} 
              onChange={e => handleInputChange('personalDetails', 'fatherName', e.target.value)} 
            />
          </label>
          <label>Father/Guardian Profession: 
            <input 
              type="text" 
              value={formData.personalDetails.fatherProfession} 
              onChange={e => handleInputChange('personalDetails', 'fatherProfession', e.target.value)} 
            />
          </label>
          <label>Father Income Status: 
            <input 
              type="text" 
              value={formData.personalDetails.fatherIncome} 
              onChange={e => handleInputChange('personalDetails', 'fatherIncome', e.target.value)} 
            />
          </label>
        </div>

        {/* Educational Details */}
        <div className="section">
          <h3>Educational Details</h3>
          <table>
            <thead>
              <tr>
                <th>Exam Passed</th>
                <th>Name of School / Board</th>
                <th>Year of Passing</th>
                <th>Subjects</th>
                <th>% of Marks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Matriculation</td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.matric.school} 
                    onChange={e => handleInputChange('educationalDetails', 'school', e.target.value, 'matric')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.matric.year} 
                    onChange={e => handleInputChange('educationalDetails', 'year', e.target.value, 'matric')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.matric.subjects} 
                    onChange={e => handleInputChange('educationalDetails', 'subjects', e.target.value, 'matric')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.matric.marks} 
                    onChange={e => handleInputChange('educationalDetails', 'marks', e.target.value, 'matric')} 
                  />
                </td>
              </tr>
              <tr>
                <td>Intermediate</td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.intermediate.school} 
                    onChange={e => handleInputChange('educationalDetails', 'school', e.target.value, 'intermediate')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.intermediate.year} 
                    onChange={e => handleInputChange('educationalDetails', 'year', e.target.value, 'intermediate')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.intermediate.subjects} 
                    onChange={e => handleInputChange('educationalDetails', 'subjects', e.target.value, 'intermediate')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.intermediate.marks} 
                    onChange={e => handleInputChange('educationalDetails', 'marks', e.target.value, 'intermediate')} 
                  />
                </td>
              </tr>
              <tr>
                <td>Graduation</td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.graduation.school} 
                    onChange={e => handleInputChange('educationalDetails', 'school', e.target.value, 'graduation')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.graduation.year} 
                    onChange={e => handleInputChange('educationalDetails', 'year', e.target.value, 'graduation')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.graduation.subjects} 
                    onChange={e => handleInputChange('educationalDetails', 'subjects', e.target.value, 'graduation')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.graduation.marks} 
                    onChange={e => handleInputChange('educationalDetails', 'marks', e.target.value, 'graduation')} 
                  />
                </td>
              </tr>
              <tr>
                <td>Masters</td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.masters.school} 
                    onChange={e => handleInputChange('educationalDetails', 'school', e.target.value, 'masters')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.masters.year} 
                    onChange={e => handleInputChange('educationalDetails', 'year', e.target.value, 'masters')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.masters.subjects} 
                    onChange={e => handleInputChange('educationalDetails', 'subjects', e.target.value, 'masters')} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.educationalDetails.masters.marks} 
                    onChange={e => handleInputChange('educationalDetails', 'marks', e.target.value, 'masters')} 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Work Experience */}
        <div className="section">
          <h3>Work Experience</h3>
          <table>
            <thead>
              <tr>
                <th>Duration</th>
                <th>Company Name</th>
                <th>Joining</th>
                <th>Reason to Leave</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input 
                    type="text" 
                    value={formData.workExperience.duration} 
                    onChange={e => handleInputChange('workExperience', 'duration', e.target.value)} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.workExperience.companyName} 
                    onChange={e => handleInputChange('workExperience', 'companyName', e.target.value)} 
                  />
                </td>
                <td>
                  <input 
                    type="date" 
                    value={formData.workExperience.joiningDate} 
                    onChange={e => handleInputChange('workExperience', 'joiningDate', e.target.value)} 
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={formData.workExperience.reasonLeave} 
                    onChange={e => handleInputChange('workExperience', 'reasonLeave', e.target.value)} 
                  />
                </td>
                <td>
                  <input 
                    type="date" 
                    value={formData.workExperience.endDate} 
                    onChange={e => handleInputChange('workExperience', 'endDate', e.target.value)} 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Career Plan */}
        <div className="section">
          <h3>Career Plan</h3>
          <label>Are you willing for Job Part time/Full Time? Explain Career plan:</label>
          <textarea 
            value={formData.careerPlan} 
            onChange={e => setFormData(prev => ({...prev, careerPlan: e.target.value}))} 
          />
        </div>

        {/* Terms and Conditions */}
        <div className="section">
          <h3>Terms and Conditions</h3>
          <ol>
            <li>Trainee must have their own Laptop.</li>
            <li>4 Hours class each day for 2 to 3 months.</li>
            <li>Training session time: Morning (10 to 2), After Noon (2 to 6 Pm).</li>
            <li>Seat availability is based on first come, first serve.</li>
            <li>Absence without informing is strictly prohibited.</li>
            <li>Must attend weekly scrum meetings.</li>
            <li>HR's permission is compulsory before device usage.</li>
            <li>Misbehavior is not acceptable.</li>
            <li>Task completion is mandatory for certification.</li>
            <li>A certificate will be given at the end of the training.</li>
            <li>Refund: 50% after one week, 60% within one week.</li>
          </ol>
        </div>

        {/* Declaration */}
        <div className="section">
          <h3>Declaration</h3>
          <label>
            I, <input 
                  type="text" 
                  value={formData.declaration.studentName} 
                  onChange={e => handleInputChange('declaration', 'studentName', e.target.value)} 
                  required 
                /> 
            son/daughter of <input 
                              type="text" 
                              value={formData.declaration.parentName} 
                              onChange={e => handleInputChange('declaration', 'parentName', e.target.value)} 
                              required 
                            /> 
            have read and hereby certify that the information submitted is accurate.
          </label>
          <label>Date: 
            <input 
              type="date" 
              value={formData.declaration.date} 
              onChange={e => handleInputChange('declaration', 'date', e.target.value)} 
              required 
            />
          </label>
        </div>



        {/* Checklist */}
        <div className="section">
          <h3>Checklist (Upload Required Documents)</h3>
          <label>Passport Picture: 
            <input 
              type="file" 
              onChange={e => handleFileChange('passportPic', e.target.files)} 
              accept="image/*" 
              required
            />
          </label>
          <label>CNIC/B-Form: 
            <input 
              type="file" 
              onChange={e => handleFileChange('cnicDoc', e.target.files)} 
              accept="image/*,.pdf" 
              required
            />
          </label>
          <label>Academic Documents: 
            <input 
              type="file" 
              onChange={e => handleFileChange('academicDocs', e.target.files)} 
              accept="image/*,.pdf" 
              multiple 
              required
            />
          </label>
          <label>Payment Receipt: 
            <input 
              type="file" 
              onChange={e => handleFileChange('paymentReceipt', e.target.files)} 
              accept="image/*,.pdf" 
              required
            />
          </label>
        </div>

        {/* Payment Method Selection */}
        {renderPaymentMethodSelection()}

        {/* Fee Section (Challan or Card Payment) */}
        {renderFeeSection()}

        <button 
          type="submit" 
          disabled={isLoading || (paymentMethod === 'challan' && !isChallanDownloaded) || (paymentMethod === 'card' && !paymentVerified)}
        >
          {isLoading ? 'Submitting...' : 'Submit Admission Form'}
        </button>
      </form>

      {/* Stripe Payment Modal */}
      {showStripeModal && (
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm
            amount={courseFee}
            onSuccess={() => {
              setPaymentVerified(true);
              setShowStripeModal(false);
            }}
            onCancel={() => setShowStripeModal(false)}
            formData={formData}
            courseFee={courseFee}
          />
        </Elements>
      )}
    </div>
  );
};

export default AdmissionForm;