// components/Dashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import About from '../sidebar/About';
import Contact from '../sidebar/Contact';
import AttendanceSummary from '../attendence/AttendanceSummary';
import MyProfile from './MyProfile';
import MyCourses from './MyCourses';
import Schedule from './Schedule';
import Assignments from './Assignments';


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [attendanceData, setAttendanceData] = useState(null);
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
  document.title = "Student Dashboard";
}, []);

  useEffect(() => {
    const fetchUser = async () => {
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
        
        // Redirect to admission form if not submitted
        if (!res.data.hasSubmittedAdmissionForm) {
          navigate('/admission-form');
          return;
        }
        

        

        // Fetch attendance data
        const attendanceRes = await axios.get('https://student-portal-production-7307.up.railway.app/api/attendance/student/summary', config);
        setAttendanceData(attendanceRes.data);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUser();

    // Hide swipe indicator after 5 seconds
    const indicatorTimer = setTimeout(() => {
      setShowSwipeIndicator(false);
    }, 5000);

    return () => clearTimeout(indicatorTimer);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSidebarItemClick = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

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

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div>
            <h1>Welcome, {user?.name}!</h1>
            
            {attendanceData && (
              <AttendanceSummary data={attendanceData} />
            )}
            
            <div className="dashboard-cards">
              <div className="card">
                <h3>My Courses</h3>
                <p>Explore all available courses and training programs</p>
                <button 
                  onClick={() => handleSidebarItemClick('courses')}
                  style={{marginTop: '10px', padding: '8px 16px'}}
                >
                  View Courses
                </button>
              </div>
              <div className="card">
                  <h3>Schedule</h3>
                  <p>Check all of your class timetable and course schedules</p>
                  <button 
                    onClick={() => handleSidebarItemClick('schedule')}
                    style={{marginTop: '10px', padding: '8px 16px'}}
                  >
                    View Schedule
                  </button>
                </div>
              <div className="card">
                <h3>My Assignments</h3>
                <p>Explore all available assignments and their statuses</p>
                <button 
                  onClick={() => handleSidebarItemClick('assignments')}
                  style={{marginTop: '10px', padding: '8px 16px'}}
                >
                  View Assignments
                </button>
              </div>
            </div>
          </div>
        );
      case 'assignments':
          return <Assignments />;
      case 'schedule':
          return <Schedule />;
      case 'courses':
          return <MyCourses />;
      case 'profile':
          return <MyProfile />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'attendance':
        
        return attendanceData ? (
          <div>
            <h2>Attendance Details</h2>
            <AttendanceSummary data={attendanceData} detailed={true} />
          </div>
        ) : (
          <p>Loading attendance data...</p>
        );
      default:
        return (
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p>Hello World! You have successfully accessed the student portal.</p>
          </div>
        );
    }
  };

  if (!user) {
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
          <p style={{ color: '#ecf0f1', fontSize: '0.9rem', marginTop: '5px' }}>Student Portal</p>
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
              <span>Home</span>
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
                href="#profile" 
                className={activePage === 'profile' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleSidebarItemClick('profile');
                }}
              >
                <i className="fas fa-user"></i>
                <span>My Profile</span>
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

export default Dashboard;