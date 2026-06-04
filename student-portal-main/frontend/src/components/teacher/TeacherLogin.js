import React, { useState , useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const TeacherLogin = () => {
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
      const res = await axios.post('https://student-portal-production-7307.up.railway.app/api/auth/teacher-login', {
        email,
        password
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isTeacher', 'true');
      navigate('/teacher-dashboard');
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-email', { state: { email } });
      } else if (err.response?.data?.requiresApproval) {
        navigate('/waiting-approval-teacher');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
  };

  useEffect(() => {
    document.title = "Teacher Login";
  }, []);

  return (
    <div className="container">
      <h1>Teacher Login</h1>
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
        <p>Don't have an account? <Link to="/teacher-register">Teacher Register</Link></p>
        <p>Student login? <Link to="/login">Student Login</Link></p>
        <p>Admin login? <Link to="/admin-login">Admin Login</Link></p>
      </div>
    </div>
  );
};

export default TeacherLogin;