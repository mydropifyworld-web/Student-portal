import React, { useState , useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, password2 } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    
    if (password !== password2) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('https://student-portal-production-7307.up.railway.app/api/auth/register', {
        name,
        email,
        password
      });
      
      if (res.data.requiresVerification) {
        // Redirect to verification page with email
        navigate('/verify-email', { state: { email, isTeacher: false } });
      } else {
        setSuccess(res.data.message);
        setError('');
        setFormData({
          name: '',
          email: '',
          password: '',
          password2: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
  document.title = "Student Register";
}, []);

  return (
    <div className="container">
      <h1>Student Registration</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="toggle-form">
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;