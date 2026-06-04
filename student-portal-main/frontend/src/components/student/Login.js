import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';



const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

const onSubmit = async e => {
  e.preventDefault();
  try {
    const res = await axios.post('https://student-portal-production-7307.up.railway.app/api/auth/login', {
      email,
      password
    });
    
    localStorage.setItem('token', res.data.token);
    navigate('/dashboard');
  } catch (err) {
    if (err.response?.data?.requiresVerification) {
      // Redirect to verification page if email is not verified
      navigate('/verify-email', { state: { email } });
    } else {
      setError(err.response?.data?.message || 'Login failed');
    }
  }
};

useEffect(() => {
  document.title = "Student Login";
}, []);

  return (
    <div className="container">
      <h1>Student Login</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
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
        <button type="submit">Login</button>
      </form>
      <div className="toggle-form">
        <p>Don't have an account? <Link to="/register">Register</Link></p>
        <p>Admin login? <Link to="/admin-login">Admin Login</Link></p>
      </div>
    </div>
  );
};

export default Login;