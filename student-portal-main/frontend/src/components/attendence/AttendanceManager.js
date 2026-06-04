// components/AttendanceManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const AttendanceManager = ({ teacher, students }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendanceHistory, setStudentAttendanceHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
    fetchAvailableDates();
  }, [selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Fetching attendance for date:', selectedDate); // Debug log

      const res = await axios.get(`https://student-portal-production-7307.up.railway.app/api/attendance/date/${selectedDate}`, config);
      
      if (res.data && res.data.length > 0) {
        // Handle both populated and unpopulated records
        const formattedRecords = res.data.map(record => ({
          _id: record._id,
          studentId: record.studentId._id || record.studentId,
          studentName: record.studentId.name || record.studentName,
          status: record.status,
          date: record.date
        }));
        setAttendanceRecords(formattedRecords);
        setIsEditing(true);
      } else {
        // Initialize with default records (all absent)
        const defaultRecords = students.map(student => ({
          studentId: student._id,
          studentName: student.name,
          status: 'absent',
          date: selectedDate
        }));
        setAttendanceRecords(defaultRecords);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setMessage('Error loading attendance data');
    }
  };

  const fetchAvailableDates = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.get('https://student-portal-production-7307.up.railway.app/api/attendance/dates', config);
      setAvailableDates(res.data);
    } catch (err) {
      console.error('Error fetching available dates:', err);
    }
  };

  const fetchStudentAttendanceHistory = async (studentId) => {
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.get(`https://student-portal-production-7307.up.railway.app/api/attendance/student/${studentId}`, config);
      setStudentAttendanceHistory(res.data);
    } catch (err) {
      console.error('Error fetching student attendance history:', err);
      setMessage('Error loading student attendance history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => 
        record.studentId === studentId ? { ...record, status: newStatus } : record
      )
    );
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    await fetchStudentAttendanceHistory(student.studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setStudentAttendanceHistory([]);
  };

  const handleHistoryStatusChange = (recordId, newStatus) => {
    setStudentAttendanceHistory(prevRecords => 
      prevRecords.map(record => 
        record._id === recordId ? { ...record, status: newStatus } : record
      )
    );
  };

  const updateStudentAttendance = async (recordId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const payload = {
        status: newStatus
      };

      await axios.put(`https://student-portal-production-7307.up.railway.app/api/attendance/${recordId}`, payload, config);
      
      // Update local state
      setStudentAttendanceHistory(prevRecords => 
        prevRecords.map(record => 
          record._id === recordId ? { ...record, status: newStatus } : record
        )
      );
      
      // Also update the main attendance records if the updated record is for today
      const updatedRecord = studentAttendanceHistory.find(record => record._id === recordId);
      if (updatedRecord && format(parseISO(updatedRecord.date), 'yyyy-MM-dd') === selectedDate) {
        setAttendanceRecords(prevRecords => 
          prevRecords.map(record => 
            record.studentId === updatedRecord.studentId ? { ...record, status: newStatus } : record
          )
        );
      }
      
      setMessage('Attendance updated successfully!');
    } catch (err) {
      console.error('Error updating attendance:', err);
      setMessage('Error updating attendance: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const payload = {
        date: selectedDate,
        attendanceRecords: attendanceRecords.map(record => ({
          studentId: record.studentId || record.studentId._id,
          status: record.status
        }))
      };

      const res = await axios.post('https://student-portal-production-7307.up.railway.app/api/attendance/submit', payload, config);
      
      setMessage('Attendance submitted successfully!');
      setIsEditing(true);
      fetchAvailableDates();
      fetchAttendanceData();
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setMessage('Error submitting attendance: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = (studentId, currentStatus) => {
    let newStatus;
    switch (currentStatus) {
      case 'absent':
        newStatus = 'present';
        break;
      case 'present':
        newStatus = 'leave';
        break;
      case 'leave':
        newStatus = 'absent';
        break;
      default:
        newStatus = 'absent';
    }
    handleStatusChange(studentId, newStatus);
  };

  const getStatusButtonClass = (status) => {
    switch (status) {
      case 'present': return 'btn-present';
      case 'absent': return 'btn-absent';
      case 'leave': return 'btn-leave';
      default: return 'btn-absent';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="attendance-manager">
      <h1>Attendance Management</h1>
      <p>Course: {teacher.teacherCourse}</p>

      <div className="date-selector">
        <label htmlFor="attendance-date">Select Date: </label>
        <input
          type="date"
          id="attendance-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {availableDates.length > 0 && (
          <div className="available-dates">
            <p>Available dates with records:</p>
            <div className="date-badges">
              {availableDates.map(date => (
                <span
                  key={date}
                  className={`date-badge ${date === selectedDate ? 'active' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {format(parseISO(date), 'MMM dd, yyyy')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="attendance-list">
        <h2>Student Attendance for {format(parseISO(selectedDate), 'MMMM dd, yyyy')}</h2>
        
        {attendanceRecords.length === 0 ? (
          <p>No students found for this course.</p>
        ) : (
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(record => (
                  <tr key={record.studentId}>
                    <td>
                      <span 
                        className="student-name-link"
                        onClick={() => handleStudentClick(record)}
                      >
                        {record.studentName}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${getStatusButtonClass(record.status)}`}
                        onClick={() => toggleStatus(record.studentId, record.status)}
                        disabled={isSubmitting}
                      >
                        Mark {getStatusText(record.status === 'absent' ? 'present' : 
                                          record.status === 'present' ? 'leave' : 'absent')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="attendance-actions">
          <button
            className={`btn ${isEditing ? 'btn-edit' : 'btn-submit'}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : isEditing ? 'Update Attendance' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      {/* Student Attendance History Modal */}
      {isModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Attendance History for {selectedStudent.studentName}</h3>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {isLoadingHistory ? (
                <p>Loading attendance history...</p>
              ) : studentAttendanceHistory.length === 0 ? (
                <p>No attendance records found for this student.</p>
              ) : (
                <div className="attendance-history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentAttendanceHistory.map(record => (
                        <tr key={record._id}>
                          <td>{format(parseISO(record.date), 'MMMM dd, yyyy')}</td>
                          <td>
                            <span className={`status-badge ${record.status}`}>
                              {getStatusText(record.status)}
                            </span>
                          </td>
                          <td>
                            <select
                              value={record.status}
                              onChange={(e) => updateStudentAttendance(record._id, e.target.value)}
                              className="status-select"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="leave">Leave</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;