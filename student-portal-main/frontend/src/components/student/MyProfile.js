// src/components/student/MyProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const res = await axios.get('https://student-portal-production-7307.up.railway.app/api/auth/user', config);
        setUserData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading profile data...</div>;
  }

  if (!userData) {
    return <div>Error loading profile data.</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      {userData.hasSubmittedAdmissionForm && userData.admissionForm ? (
        <div className="profile-details">
          {/* Personal Details */}
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Full Name:</label>
                <span>{userData.admissionForm.personalDetails.studentName}</span>
              </div>
              <div className="profile-item">
                <label>Date of Birth:</label>
                <span>{new Date(userData.admissionForm.personalDetails.dob).toLocaleDateString()}</span>
              </div>
              <div className="profile-item">
                <label>Gender:</label>
                <span>{userData.admissionForm.personalDetails.gender}</span>
              </div>
              <div className="profile-item">
                <label>CNIC:</label>
                <span>{userData.admissionForm.personalDetails.cnic}</span>
              </div>
              <div className="profile-item">
                <label>Address:</label>
                <span>{userData.admissionForm.personalDetails.address}</span>
              </div>
              <div className="profile-item">
                <label>Mobile Number:</label>
                <span>{userData.admissionForm.personalDetails.mobile}</span>
              </div>
              <div className="profile-item">
                <label>Father's Name:</label>
                <span>{userData.admissionForm.personalDetails.fatherName}</span>
              </div>
              {userData.admissionForm.personalDetails.fatherProfession && (
                <div className="profile-item">
                  <label>Father's Profession:</label>
                  <span>{userData.admissionForm.personalDetails.fatherProfession}</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Details */}
          <div className="profile-section">
            <h2>Course Information</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Course Name:</label>
                <span>{userData.admissionForm.courseDetails.courseName}</span>
              </div>
              <div className="profile-item">
                <label>Batch Number:</label>
                <span>{userData.admissionForm.courseDetails.batchNo}</span>
              </div>
              <div className="profile-item">
                <label>Shift:</label>
                <span>{userData.admissionForm.courseDetails.shift}</span>
              </div>
            </div>
          </div>

          {/* Educational Details */}
          {userData.admissionForm.educationalDetails && (
            <div className="profile-section">
              <h2>Educational Background</h2>
              
              {userData.admissionForm.educationalDetails.matric && (
                <div className="education-level">
                  <h3>Matriculation</h3>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <label>School:</label>
                      <span>{userData.admissionForm.educationalDetails.matric.school || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Year:</label>
                      <span>{userData.admissionForm.educationalDetails.matric.year || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Subjects:</label>
                      <span>{userData.admissionForm.educationalDetails.matric.subjects || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Marks:</label>
                      <span>{userData.admissionForm.educationalDetails.matric.marks || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {userData.admissionForm.educationalDetails.intermediate && (
                <div className="education-level">
                  <h3>Intermediate</h3>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <label>School/College:</label>
                      <span>{userData.admissionForm.educationalDetails.intermediate.school || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Year:</label>
                      <span>{userData.admissionForm.educationalDetails.intermediate.year || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Subjects:</label>
                      <span>{userData.admissionForm.educationalDetails.intermediate.subjects || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Marks:</label>
                      <span>{userData.admissionForm.educationalDetails.intermediate.marks || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="no-data-message">
          <p>You haven't submitted an admission form yet.</p>
          <a href="/admission-form">Complete your admission form now</a>
        </div>
      )}
    </div>
  );
};

export default MyProfile;