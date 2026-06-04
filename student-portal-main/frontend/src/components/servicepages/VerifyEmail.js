import React, { useState , useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const isTeacher = location.state?.isTeacher || false; // Get teacher status

  const onChange = e => setVerificationCode(e.target.value);

  useEffect(() => {
  document.title = "Verify Email";
}, []);

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('https://student-portal-production-7307.up.railway.app/api/auth/verify-email', {
        code: verificationCode // Sending 6-digit code
      });

setSuccess(res.data.message);
        setTimeout(() => {
          // Use the isTeacher value from response or from location state
          const userIsTeacher = res.data.isTeacher !== undefined 
            ? res.data.isTeacher 
            : isTeacher;
            
          if (userIsTeacher) {
            navigate('/teacher-login');
          } else {
            navigate('/login');
          }
        }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      await axios.post('https://student-portal-production-7307.up.railway.app/api/auth/resend-verification', {
        email
      });
      setSuccess('Verification email sent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend verification email');
    }
  };

  const redirectToLogin = () => {
    if (isTeacher) {
      navigate('/teacher-login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="container">
      <h1>Verify Your Email</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>6-Digit Verification Code</label>
          <input
            type="text"
            name="verificationCode"
            value={verificationCode}
            onChange={onChange}
            required
            maxLength="6"
            placeholder="Enter the 6-digit code sent to your email"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <p>Didn't receive the code?</p>
        <button
          onClick={resendVerification}
          style={{
            background: 'none',
            color: '#007bff',
            textDecoration: 'underline',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          Resend Verification Email
        </button>
      </div>

      <div className="toggle-form" style={{ marginTop: '2rem' }}>
        <p>
          Already verified?{' '}
          <button
            onClick={redirectToLogin}
            style={{
              background: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            {isTeacher ? 'Teacher Login' : 'Student Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;