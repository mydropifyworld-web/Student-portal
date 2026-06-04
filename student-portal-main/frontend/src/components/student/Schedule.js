// src/components/student/Schedule.js
import React, { useState } from 'react';

const Schedule = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Course options based on your PDF
  const courses = [
    { id: 'web-dev', name: 'Web Development (MERN Stack)' },
    { id: 'app-dev', name: 'App Development' },
    { id: 'graphic-design', name: 'Graphic Designing' },
    { id: 'digital-marketing', name: 'Digital Marketing' },
    { id: 'ecommerce', name: 'Shopify / Ecommerce' },
    { id: 'business-dev', name: 'Business Development' },
    { id: 'icr-kids', name: 'ICR For Kids' },
    { id: 'youtube-automation', name: 'YouTube Automation' },
    { id: 'ui-ux', name: 'UI/UX Design' },
    { id: 'english', name: 'English Language' },
    { id: 'ielts', name: 'IELTS' }
  ];

  // Sample timetable data for each course type
  const timetableData = {
    'web-dev': {
      '2-Month Training Series': [
        { day: 'Monday', time: '9:00 AM - 11:00 AM', subject: 'HTML & CSS Fundamentals' },
        { day: 'Tuesday', time: '9:00 AM - 11:00 AM', subject: 'JavaScript Basics' },
        { day: 'Wednesday', time: '9:00 AM - 11:00 AM', subject: 'React.js Introduction' },
        { day: 'Thursday', time: '9:00 AM - 11:00 AM', subject: 'Node.js & Express' },
        { day: 'Friday', time: '9:00 AM - 11:00 AM', subject: 'MongoDB & Project Work' }
      ],
      '3-Month Training Series': [
        { day: 'Monday', time: '2:00 PM - 4:00 PM', subject: 'Advanced HTML/CSS' },
        { day: 'Tuesday', time: '2:00 PM - 4:00 PM', subject: 'JavaScript Deep Dive' },
        { day: 'Wednesday', time: '2:00 PM - 4:00 PM', subject: 'React.js Advanced' },
        { day: 'Thursday', time: '2:00 PM - 4:00 PM', subject: 'Backend Development' },
        { day: 'Friday', time: '2:00 PM - 4:00 PM', subject: 'Deployment & Projects' }
      ],
      'Pro-20 Training Series': [
        { day: 'Monday', time: '9:00 AM - 1:00 PM', subject: 'Full Stack Fundamentals' },
        { day: 'Tuesday', time: '9:00 AM - 1:00 PM', subject: 'Advanced React Concepts' },
        { day: 'Wednesday', time: '9:00 AM - 1:00 PM', subject: 'Backend & APIs' },
        { day: 'Thursday', time: '9:00 AM - 1:00 PM', subject: 'Database Management' },
        { day: 'Friday', time: '9:00 AM - 1:00 PM', subject: 'Project Development' },
        { day: 'Saturday', time: '9:00 AM - 12:00 PM', subject: 'Weekly Review & Q&A' }
      ]
    },
    'app-dev': {
      '2-Month Training Series': [
        { day: 'Monday', time: '11:00 AM - 1:00 PM', subject: 'UI Components Basics' },
        { day: 'Tuesday', time: '11:00 AM - 1:00 PM', subject: 'Navigation & Styling' },
        { day: 'Wednesday', time: '11:00 AM - 1:00 PM', subject: 'State Management' },
        { day: 'Thursday', time: '11:00 AM - 1:00 PM', subject: 'API Integration' },
        { day: 'Friday', time: '11:00 AM - 1:00 PM', subject: 'Firebase Basics' }
      ],
      '3-Month Training Series': [
        { day: 'Monday', time: '4:00 PM - 6:00 PM', subject: 'Advanced UI Components' },
        { day: 'Tuesday', time: '4:00 PM - 6:00 PM', subject: 'Complex Navigation' },
        { day: 'Wednesday', time: '4:00 PM - 6:00 PM', subject: 'Redux & State' },
        { day: 'Thursday', time: '4:00 PM - 6:00 PM', subject: 'Advanced APIs' },
        { day: 'Friday', time: '4:00 PM - 6:00 PM', subject: 'Push Notifications' }
      ],
      'Pro-20 Training Series': [
        { day: 'Monday', time: '2:00 PM - 6:00 PM', subject: 'App Fundamentals' },
        { day: 'Tuesday', time: '2:00 PM - 6:00 PM', subject: 'Advanced Components' },
        { day: 'Wednesday', time: '2:00 PM - 6:00 PM', subject: 'State & Data Management' },
        { day: 'Thursday', time: '2:00 PM - 6:00 PM', subject: 'API Integration & Testing' },
        { day: 'Friday', time: '2:00 PM - 6:00 PM', subject: 'Deployment & Projects' }
      ]
    },
    // Add similar data for other courses...
    'graphic-design': {
      '2-Month Training Series': [
        { day: 'Monday', time: '9:00 AM - 11:00 AM', subject: 'Photoshop Basics' },
        { day: 'Tuesday', time: '9:00 AM - 11:00 AM', subject: 'Illustrator Introduction' },
        { day: 'Wednesday', time: '9:00 AM - 11:00 AM', subject: 'Canva & Design Principles' },
        { day: 'Thursday', time: '9:00 AM - 11:00 AM', subject: 'Figma Basics' },
        { day: 'Friday', time: '9:00 AM - 11:00 AM', subject: 'Social Media Design' }
      ],
      '3-Month Training Series': [
        { day: 'Monday', time: '2:00 PM - 4:00 PM', subject: 'Advanced Photoshop' },
        { day: 'Tuesday', time: '2:00 PM - 4:00 PM', subject: 'Advanced Illustrator' },
        { day: 'Wednesday', time: '2:00 PM - 4:00 PM', subject: 'Branding Essentials' },
        { day: 'Thursday', time: '2:00 PM - 4:00 PM', subject: 'Portfolio Development' },
        { day: 'Friday', time: '2:00 PM - 4:00 PM', subject: 'Client Projects' }
      ],
      'Pro-20 Training Series': [
        { day: 'Monday', time: '9:00 AM - 1:00 PM', subject: 'Design Fundamentals' },
        { day: 'Tuesday', time: '9:00 AM - 1:00 PM', subject: 'Advanced Tools' },
        { day: 'Wednesday', time: '9:00 AM - 1:00 PM', subject: 'Branding & Identity' },
        { day: 'Thursday', time: '9:00 AM - 1:00 PM', subject: 'Portfolio Development' },
        { day: 'Friday', time: '9:00 AM - 1:00 PM', subject: 'Real-world Projects' }
      ]
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Get the selected course timetables
  const selectedTimetables = selectedCourse ? timetableData[selectedCourse] : null;

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>Course Schedule</h1>
        <p>View timetables for all available course options</p>
      </div>

      <div className="course-selector">
        <div className="form-group">
          <label htmlFor="course-select">Select Your Course:</label>
          <select 
            id="course-select"
            value={selectedCourse} 
            onChange={handleCourseChange}
            className="course-dropdown"
          >
            <option value="">-- Choose a Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && selectedTimetables ? (
        <div className="timetables-container">
          <h2>{courses.find(c => c.id === selectedCourse).name} Schedules</h2>
          
          {Object.entries(selectedTimetables).map(([courseType, schedule]) => (
            <div key={courseType} className="timetable-card">
              <div className="timetable-header">
                <h3>{courseType}</h3>
              </div>
              
              <div className="timetable-content">
                <table className="timetable-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item, index) => (
                      <tr key={index}>
                        <td>{item.day}</td>
                        <td>{item.time}</td>
                        <td>{item.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-selection">
          <div className="placeholder-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h3>Select a course to view the schedule</h3>
          <p>Choose from the dropdown menu above to see detailed timetables for each course option</p>
        </div>
      )}
    </div>
  );
};

export default Schedule;