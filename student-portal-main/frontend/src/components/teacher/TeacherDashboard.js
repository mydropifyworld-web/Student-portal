// components/TeacherDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import About from '../sidebar/About';
import Contact from '../sidebar/Contact';
import AttendanceManager from '../attendence/AttendanceManager';
import AssignmentManager from './AssignmentManager';

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  // Minimum swipe distance to trigger sidebar open/close
  const minSwipeDistance = 50;

  useEffect(() => {
  document.title = "Teacher Dashboard";
}, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const isTeacher = localStorage.getItem('isTeacher');
      
      if (!token || !isTeacher) {
        navigate('/teacher-login');
        return;
      }

      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // Get teacher's students
        const studentsRes = await axios.get('https://student-portal-production-7307.up.railway.app/api/teacher/students', config);
        setStudents(studentsRes.data);

        // Get teacher info
        const userRes = await axios.get('https://student-portal-production-7307.up.railway.app/api/auth/teacher', config);
        setUser(userRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('isTeacher');
          navigate('/teacher-login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Hide swipe indicator after 5 seconds
    const indicatorTimer = setTimeout(() => {
      setShowSwipeIndicator(false);
    }, 5000);

    return () => clearTimeout(indicatorTimer);
  }, [navigate]);

  // Touch handlers for swipe gestures
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && sidebarOpen) {
      setSidebarOpen(false);
    } else if (isRightSwipe && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  const handleSidebarItemClick = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isTeacher');
    navigate('/teacher-login');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p>You are teaching: {user?.teacherCourse}</p>
            
            <div className="stats-container" style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
              <div className="stat-card" style={{ 
                background: '#007bff', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '10px', 
                flex: 1,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3>Total Students</h3>
                <p style={{ fontSize: '2rem', margin: '10px 0' }}>{students.length}</p>
              </div>
              <div className="stat-card" style={{ 
                background: '#28a745', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '10px', 
                flex: 1,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3>Course</h3>
                <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>{user?.teacherCourse}</p>
              </div>
            </div>

            {error && <p className="error">{error}</p>}
            
            <div className="user-list">
              <h2>Your Students</h2>
              {students.length === 0 ? (
                <p>No students enrolled in your course yet.</p>
              ) : (
                <div className="students-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  {students.map(student => (
                    <div key={student._id} className="student-card" style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      borderLeft: '4px solid #007bff'
                    }}>
                      <div className="student-info">
                        <h4 style={{ marginBottom: '10px', color: '#333' }}>{student.name}</h4>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Email:</strong> {student.email}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Course:</strong> {student.admissionForm?.courseDetails?.courseName}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Batch:</strong> {student.admissionForm?.courseDetails?.batchNo || 'N/A'}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Shift:</strong> {student.admissionForm?.courseDetails?.shift || 'N/A'}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Joined:</strong> {new Date(student.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'assignments':
        return <AssignmentManager teacherCourse={user?.teacherCourse} />;
      case 'attendance':
        return <AttendanceManager teacher={user} students={students} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p>You are teaching: {user?.teacherCourse}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Swipe Indicator */}
      <div className={`swipe-indicator ${showSwipeIndicator ? '' : 'hidden'}`}>
        <i className="fas fa-chevron-right"></i>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="sidebar-header">
          <h2>IT Centre RYK</h2>
          <p style={{ color: '#ecf0f1', fontSize: '0.9rem', marginTop: '5px' }}>Teacher Portal</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <a 
              href="#home" 
              className={activePage === 'home' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleSidebarItemClick('home');
              }}
            >
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a 
              href="#attendance" 
              className={activePage === 'attendance' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleSidebarItemClick('attendance');
              }}
            >
              <i className="fas fa-calendar-check"></i>
              <span>Attendance</span>
            </a>
          </li>
            <li>
              <a 
                href="#assignments" 
                className={activePage === 'assignments' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleSidebarItemClick('assignments');
                }}
              >
                <i className="fas fa-tasks"></i>
                <span>Assignments</span>
              </a>
            </li>
          <li>
            <a 
              href="#about" 
              className={activePage === 'about' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleSidebarItemClick('about');
              }}
            >
              <i className="fas fa-info-circle"></i>
              <span>About Us</span>
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              className={activePage === 'contact' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleSidebarItemClick('contact');
              }}
            >
              <i className="fas fa-envelope"></i>
              <span>Contact Us</span>
            </a>
          </li>
        </ul>
        <div className="sidebar-logout">
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={contentRef}
        className="main-content"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="content-container">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;