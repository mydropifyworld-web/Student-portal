import React, { useState , useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    teacherCourse: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, password2, teacherCourse } = formData;

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
      const res = await axios.post('https://student-portal-production-7307.up.railway.app/api/auth/teacher-register', {
        name,
        email,
        password,
        teacherCourse
      });
      
      if (res.data.requiresVerification) {
        // Pass isTeacher flag to verification page
        navigate('/verify-email', { state: { email, isTeacher: true } });
      } else {
        setSuccess(res.data.message);
        setError('');
        setFormData({
          name: '',
          email: '',
          password: '',
          password2: '',
          teacherCourse: ''
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
  document.title = "Teacher Register";
}, []);
  
  return (
    <div className="container">
      <h1>Teacher Registration</h1>
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
        <div className="form-group">
          <label>Course</label>
            <select
            name="teacherCourse"
            value={teacherCourse}
            onChange={onChange}
            required
            >
            <option value="">Select a Course</option>
            <option value="Web Development (MERN Stack)">Web Development (MERN Stack)</option>
            <option value="App Development">App Development</option>
            <option value="Graphic Designing">Graphic Designing</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Shopify / Ecommerce">Shopify / Ecommerce</option>
            <option value="Business Development">Business Development</option>
            <option value="ICR For Kids">ICR For Kids</option>
            <option value="YouTube Automation">YouTube Automation</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="English Language">English Language</option>
            <option value="IELTS">IELTS</option>
            <option value="Other Specialized">Other Specialized</option>
            </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="toggle-form">
        <p>Already have an account? <Link to="/teacher-login">Teacher Login</Link></p>
        <p>Student registration? <Link to="/register">Student Register</Link></p>
      </div>
    </div>
  );
};

export default TeacherRegister;