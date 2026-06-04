import React, { useState , useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
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
      const res = await axios.post('https://student-portal-production-7307.up.railway.app/api/auth/admin-login', {
        email,
        password
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    }
  };

    useEffect(() => {
  document.title = "Admin Login";
}, []);


  return (
    <div className="container">
      <h1>Admin Login</h1>
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
        <button type="submit">Admin Login</button>
      </form>
      <div className="toggle-form">
        <p>Student login? <Link to="/login">Login</Link></p>
        <p>Student registration? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default AdminLogin;