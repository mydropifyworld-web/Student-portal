import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import About from '../sidebar/About';
import Contact from '../sidebar/Contact';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  // Minimum swipe distance to trigger sidebar open/close
  const minSwipeDistance = 50;

  useEffect(() => {
  document.title = "Admin Panel";
}, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const isAdmin = localStorage.getItem('isAdmin');
      
      if (!token || !isAdmin) {
        navigate('/admin-login');
        return;
      }

      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // Fetch both students and teachers
        const [usersRes, teachersRes] = await Promise.all([
          axios.get('https://student-portal-production-7307.up.railway.app/api/admin/users', config),
          axios.get('https://student-portal-production-7307.up.railway.app/api/admin/teachers', config)
        ]);

        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setTeachers(teachersRes.data);
        setFilteredTeachers(teachersRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          navigate('/admin-login');
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

  // Filter users and teachers based on search query and pending filter
  useEffect(() => {
    let filteredUsersList = [...users];
    let filteredTeachersList = [...teachers];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredUsersList = filteredUsersList.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query) ||
        (user.admissionForm?.courseDetails?.courseName && 
         user.admissionForm.courseDetails.courseName.toLowerCase().includes(query))
      );
      
      filteredTeachersList = filteredTeachersList.filter(teacher => 
        teacher.name.toLowerCase().includes(query) || 
        teacher.email.toLowerCase().includes(query) ||
        teacher.teacherCourse.toLowerCase().includes(query)
      );
    }
    
    // Apply pending approval filter
    if (showPendingOnly) {
      filteredUsersList = filteredUsersList.filter(user => !user.isApproved);
      filteredTeachersList = filteredTeachersList.filter(teacher => !teacher.isApproved);
    }
    
    setFilteredUsers(filteredUsersList);
    setFilteredTeachers(filteredTeachersList);
  }, [searchQuery, showPendingOnly, users, teachers]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const togglePendingFilter = () => {
    setShowPendingOnly(!showPendingOnly);
  };

  const viewAdmissionForm = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.get(`https://student-portal-production-7307.up.railway.app/api/admission/${userId}`, config);
      setSelectedUser({ id: userId, formData: res.data });
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching admission form');
    }
  };

  const approveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.put(
        `https://student-portal-production-7307.up.railway.app/api/admin/approve/${userId}`,
        {},
        config
      );

      setUsers(users.map(user => 
        user._id === userId ? res.data : user
      ));
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving user');
    }
  };

  const approveTeacher = async (teacherId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.put(
        `https://student-portal-production-7307.up.railway.app/api/admin/approve-teacher/${teacherId}`,
        {},
        config
      );

      setTeachers(teachers.map(teacher => 
        teacher._id === teacherId ? res.data : teacher
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving teacher');
    }
  };

  // Delete user function
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(
        `https://student-portal-production-7307.up.railway.app/api/admin/delete-user/${userId}`,
        config
      );

      // Remove user from state
      setUsers(users.filter(user => user._id !== userId));
      setFilteredUsers(filteredUsers.filter(user => user._id !== userId));
      
      // Close modal if it's open for this user
      if (showModal && selectedUser && selectedUser.id === userId) {
        setShowModal(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
    }
  };

  // Delete teacher function
  const deleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(
        `https://student-portal-production-7307.up.railway.app/api/admin/delete-teacher/${teacherId}`,
        config
      );

      // Remove teacher from state
      setTeachers(teachers.filter(teacher => teacher._id !== teacherId));
      setFilteredTeachers(filteredTeachers.filter(teacher => teacher._id !== teacherId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting teacher');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
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

  const handleSidebarItemClick = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  // Function to render file links
  const renderFileLink = (filePath, label) => {
    if (!filePath) return null;
    
    const fileName = filePath.split('/').pop();
    
    return (
      <div style={{ marginBottom: '10px' }}>
        <strong>{label}: </strong>
        <a 
          href={`https://student-portal-production-7307.up.railway.app/${filePath}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#007bff', 
            textDecoration: 'underline',
            marginLeft: '10px'
          }}
        >
          View {label} ({fileName})
        </a>
      </div>
    );
  };

  // Function to render multiple file links
  const renderMultipleFileLinks = (filePaths, label) => {
    if (!filePaths || filePaths.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '15px' }}>
        <strong>{label}:</strong>
        {filePaths.map((filePath, index) => {
          const fileName = filePath.split('/').pop();
          return (
            <div key={index} style={{ marginLeft: '20px', marginTop: '5px' }}>
              <a 
                href={`https://student-portal-production-7307.up.railway.app/${filePath}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'underline' }}
              >
                {label} {index + 1} ({fileName})
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  // Add the verifyPayment function
  const verifyPayment = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.put(
        `https://student-portal-production-7307.up.railway.app/api/admission/verify-payment/${userId}`,
        {},
        config
      );

      setUsers(users.map(user => 
        user._id === userId ? res.data.user : user
      ));
      
      // If modal is open, update the selected user
      if (showModal && selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          formData: {
            ...selectedUser.formData,
            paymentVerified: true
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error verifying payment');
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <div>
            <h1>Admin Dashboard</h1>
            
            <div className="stats-container" style={{ display: 'flex', gap: '20px', margin: '20px 0', flexWrap: 'wrap' }}>
              <div className="stat-card" style={{ 
                background: '#007bff', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '10px', 
                flex: '1 1 200px',
                minWidth: '200px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
                onClick={() => setActiveTab('students')}
              >
                <h3>Total Students</h3>
                <p style={{ fontSize: '2rem', margin: '10px 0' }}>{users.length}</p>
              </div>
              <div className="stat-card" style={{ 
                background: '#28a745', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '10px', 
                flex: '1 1 200px',
                minWidth: '200px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
                onClick={() => setActiveTab('teachers')}
              >
                
                <h3>Total Teachers</h3>
                <p style={{ fontSize: '2rem', margin: '10px 0' }}>{teachers.length}</p>
              </div>
              <div 
                className="stat-card" 
                style={{ 
                  background: showPendingOnly ? '#ffcc00' : '#ffc107', 
                  color: 'white', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  flex: '1 1 200px',
                  minWidth: '200px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
                onClick={togglePendingFilter}
              >
                <h3>Pending Approvals</h3>
                <p style={{ fontSize: '2rem', margin: '10px 0' }}>
                  {users.filter(u => !u.isApproved).length + teachers.filter(t => !t.isApproved).length}
                </p>
                {showPendingOnly && <span style={{ fontSize: '0.8rem' }}>Click to show all</span>}
                {!showPendingOnly && <span style={{ fontSize: '0.8rem' }}>Click to show pending only</span>}
              </div>
            </div>

            {error && <p className="error">{error}</p>}
            
            <div className="tab-navigation">
              <button 
                className={activeTab === 'students' ? 'active' : ''}
                onClick={() => setActiveTab('students')}
              >
                Students
              </button>
              <button 
                className={activeTab === 'teachers' ? 'active' : ''}
                onClick={() => setActiveTab('teachers')}
              >
                Teachers
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="search-container" style={{ margin: '20px 0' }}>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  padding: '10px 15px',
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            {activeTab === 'students' && (
              <div className="user-list">
                <h2>Registered Students ({filteredUsers.length})</h2>
                {filteredUsers.length === 0 ? (
                  <p>No students found</p>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user._id} className="user-item" style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div className="user-info" style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '5px' }}>{user.name}</h3>
                        <p style={{ margin: '3px 0', color: '#666' }}>{user.email}</p>
                        <p style={{ margin: '3px 0', color: '#666' }}>
                          Status: <span style={{ color: user.isApproved ? 'green' : 'orange', fontWeight: 'bold' }}>
                            {user.isApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                        </p>
                        <p style={{ margin: '3px 0', color: '#666' }}>
                          Admission Form: {user.hasSubmittedAdmissionForm ? 'Submitted' : 'Not Submitted'}
                        </p>
                        <p style={{ margin: '3px 0', color: '#666' }}>
                          Payment: <span style={{ color: user.admissionForm?.paymentVerified ? 'green' : 'orange', fontWeight: 'bold' }}>
                            {user.admissionForm?.paymentVerified ? 'Verified' : 'Pending'}
                          </span>
                          {user.admissionForm?.paymentMethod === 'card' && user.admissionForm?.paymentVerified && (
                            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>(Via Card)</span>
                          )}
                        </p>
                        {user.hasSubmittedAdmissionForm && user.admissionForm?.courseDetails?.courseName && (
                          <p style={{ margin: '3px 0', color: '#666' }}>
                            Course: {user.admissionForm.courseDetails.courseName}
                          </p>
                        )}
                        <p style={{ margin: '3px 0', color: '#666' }}>
                          Registered: {new Date(user.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="user-actions" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {user.hasSubmittedAdmissionForm && (
                            <button 
                              onClick={() => viewAdmissionForm(user._id)}
                              style={{
                                padding: '8px 12px',
                                background: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              View Application
                            </button>
                          )}
                          {!user.isApproved && (
                            <button 
                              onClick={() => approveUser(user._id)}
                              style={{
                                padding: '8px 12px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                          )}
                          {!user.admissionForm?.paymentVerified && user.admissionForm?.paymentMethod === 'challan' && (
                            <button 
                              onClick={() => verifyPayment(user._id)}
                              style={{
                                padding: '8px 12px',
                                background: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Verify Payment
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={() => deleteUser(user._id)}
                          style={{
                            padding: '8px 12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'teachers' && (
              <div className="user-list">
                <h2>Registered Teachers ({filteredTeachers.length})</h2>
                {filteredTeachers.length === 0 ? (
                  <p>No teachers found</p>
                ) : (
                  filteredTeachers.map(teacher => (
                    <div key={teacher._id} className="user-item" style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div className="user-info" style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '5px' }}>{teacher.name}</h3>
                        <p style={{ margin: '3px 0', color: '#666' }}>{teacher.email}</p>
                        <p style={{ margin: '3px 0', color: '#666' }}>Course: {teacher.teacherCourse}</p>
                        <p style={{ margin: '3px 0', color: '#666' }}>
                          Status: <span style={{ color: teacher.isApproved ? 'green' : 'orange', fontWeight: 'bold' }}>
                            {teacher.isApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                        </p>
                        <p style={{ margin: '3px 0', color: '#666' }}>
                          Registered: {new Date(teacher.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="user-actions" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {!teacher.isApproved && (
                            <button 
                              onClick={() => approveTeacher(teacher._id)}
                              style={{
                                padding: '8px 12px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={() => deleteTeacher(teacher._id)}
                          style={{
                            padding: '8px 12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the administration panel.</p>
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
          <p style={{ color: '#ecf0f1', fontSize: '0.9rem', marginTop: '5px' }}>Admin Portal</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <a 
              href="#dashboard" 
              className={activePage === 'dashboard' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleSidebarItemClick('dashboard');
              }}
            >
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
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
      
      {/* Modal for viewing admission form */}
      {showModal && selectedUser && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Admission Form Details - {selectedUser.formData.personalDetails?.studentName}</h2>
            
            {/* Course Details */}
            <div className="section">
              <h3>Course Details</h3>
              <p><strong>Course:</strong> {selectedUser.formData.courseDetails?.courseName || 'N/A'}</p>
              <p><strong>Batch:</strong> {selectedUser.formData.courseDetails?.batchNo || 'N/A'}</p>
              <p><strong>Shift:</strong> {selectedUser.formData.courseDetails?.shift || 'N/A'}</p>
            </div>

            {/* Personal Details */}
            <div className="section">
              <h3>Personal Details</h3>
              <p><strong>Name:</strong> {selectedUser.formData.personalDetails?.studentName || 'N/A'}</p>
              <p><strong>Date of Birth:</strong> {selectedUser.formData.personalDetails?.dob ? new Date(selectedUser.formData.personalDetails.dob).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Gender:</strong> {selectedUser.formData.personalDetails?.gender || 'N/A'}</p>
              <p><strong>Religion:</strong> {selectedUser.formData.personalDetails?.religion || 'N/A'}</p>
              <p><strong>CNIC:</strong> {selectedUser.formData.personalDetails?.cnic || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedUser.formData.personalDetails?.address || 'N/A'}</p>
              <p><strong>Mobile:</strong> {selectedUser.formData.personalDetails?.mobile || 'N/A'}</p>
              <p><strong>Father's Name:</strong> {selectedUser.formData.personalDetails?.fatherName || 'N/A'}</p>
              <p><strong>Father's Profession:</strong> {selectedUser.formData.personalDetails?.fatherProfession || 'N/A'}</p>
              <p><strong>Father's Income:</strong> {selectedUser.formData.personalDetails?.fatherIncome || 'N/A'}</p>
            </div>

            {/* Educational Details */}
            <div className="section">
              <h3>Educational Details</h3>
              
              <h4>Matriculation</h4>
              <p><strong>School/Board:</strong> {selectedUser.formData.educationalDetails?.matric?.school || 'N/A'}</p>
              <p><strong>Year of Passing:</strong> {selectedUser.formData.educationalDetails?.matric?.year || 'N/A'}</p>
              <p><strong>Subjects:</strong> {selectedUser.formData.educationalDetails?.matric?.subjects || 'N/A'}</p>
              <p><strong>Marks (%):</strong> {selectedUser.formData.educationalDetails?.matric?.marks || 'N/A'}</p>
              
              <h4>Intermediate</h4>
              <p><strong>School/Board:</strong> {selectedUser.formData.educationalDetails?.intermediate?.school || 'N/A'}</p>
              <p><strong>Year of Passing:</strong> {selectedUser.formData.educationalDetails?.intermediate?.year || 'N/A'}</p>
              <p><strong>Subjects:</strong> {selectedUser.formData.educationalDetails?.intermediate?.subjects || 'N/A'}</p>
              <p><strong>Marks (%):</strong> {selectedUser.formData.educationalDetails?.intermediate?.marks || 'N/A'}</p>
              
              <h4>Graduation</h4>
              <p><strong>School/Board:</strong> {selectedUser.formData.educationalDetails?.graduation?.school || 'N/A'}</p>
              <p><strong>Year of Passing:</strong> {selectedUser.formData.educationalDetails?.graduation?.year || 'N/A'}</p>
              <p><strong>Subjects:</strong> {selectedUser.formData.educationalDetails?.graduation?.subjects || 'N/A'}</p>
              <p><strong>Marks (%):</strong> {selectedUser.formData.educationalDetails?.graduation?.marks || 'N/A'}</p>
              
              <h4>Masters</h4>
              <p><strong>School/Board:</strong> {selectedUser.formData.educationalDetails?.masters?.school || 'N/A'}</p>
              <p><strong>Year of Passing:</strong> {selectedUser.formData.educationalDetails?.masters?.year || 'N/A'}</p>
              <p><strong>Subjects:</strong> {selectedUser.formData.educationalDetails?.masters?.subjects || 'N/A'}</p>
              <p><strong>Marks (%):</strong> {selectedUser.formData.educationalDetails?.masters?.marks || 'N/A'}</p>
            </div>

            {/* Work Experience */}
            <div className="section">
              <h3>Work Experience</h3>
              <p><strong>Duration:</strong> {selectedUser.formData.workExperience?.duration || 'N/A'}</p>
              <p><strong>Company Name:</strong> {selectedUser.formData.workExperience?.companyName || 'N/A'}</p>
              <p><strong>Joining Date:</strong> {selectedUser.formData.workExperience?.joiningDate ? new Date(selectedUser.formData.workExperience.joiningDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Reason to Leave:</strong> {selectedUser.formData.workExperience?.reasonLeave || 'N/A'}</p>
              <p><strong>End Date:</strong> {selectedUser.formData.workExperience?.endDate ? new Date(selectedUser.formData.workExperience.endDate).toLocaleDateString() : 'N/A'}</p>
            </div>

            {/* Career Plan */}
            <div className="section">
              <h3>Career Plan</h3>
              <p>{selectedUser.formData.careerPlan || 'N/A'}</p>
            </div>

            {/* Declaration */}
            <div className="section">
              <h3>Declaration</h3>
              <p><strong>Student Name:</strong> {selectedUser.formData.declaration?.studentName || 'N/A'}</p>
              <p><strong>Parent Name:</strong> {selectedUser.formData.declaration?.parentName || 'N/A'}</p>
              <p><strong>Date:</strong> {selectedUser.formData.declaration?.date ? new Date(selectedUser.formData.declaration.date).toLocaleDateString() : 'N/A'}</p>
            </div>

            {/* Documents */}
            <div className="section">
              <h3>Documents</h3>
              {renderFileLink(selectedUser.formData.documents?.passportPic, 'Passport Picture')}
              {renderFileLink(selectedUser.formData.documents?.cnicDoc, 'CNIC/B-Form')}
              {renderMultipleFileLinks(selectedUser.formData.documents?.academicDocs, 'Academic Document')}
              {renderFileLink(selectedUser.formData.documents?.paymentReceipt, 'Payment Receipt')}
            </div>

             {/* // In the modal section, add this after the documents section */}
              <div className="section">
                <h3>Payment Information</h3>
                <p>
                  <strong>Payment Method:</strong> {selectedUser.formData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Challan'}
                </p>
                <p>
                  <strong>Payment Status:</strong> 
                  <span style={{ color: selectedUser.formData.paymentVerified ? 'green' : 'orange', fontWeight: 'bold' }}>
                    {selectedUser.formData.paymentVerified ? 'Verified' : 'Pending'}
                  </span>
                </p>
                {selectedUser.formData.paymentMethod === 'card' && selectedUser.formData.paymentIntentId && (
                  <p>
                    <strong>Stripe Payment ID:</strong> {selectedUser.formData.paymentIntentId}
                  </p>
                )}
              </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              {!users.find(user => user._id === selectedUser.id)?.isApproved && (
                <button onClick={() => approveUser(selectedUser.id)}>Approve Student</button>
              )}
              <button 
                onClick={() => deleteUser(selectedUser.id)}
                style={{
                  background: '#dc3545',
                  color: 'white'
                }}
              >
                Delete Student
              </button>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;