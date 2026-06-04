// components/teacher/AssignmentManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AssignmentManager = ({ teacherCourse }) => {
  const [showForm, setShowForm] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: teacherCourse || '', // Set default to teacher's course
    deadline: '',
    maxMarks: 10,
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);


  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://student-portal-production-7307.up.railway.app/api/assignments/teacher/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setMessage('Error loading assignments');
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });

      await axios.post('https://student-portal-production-7307.up.railway.app/api/assignments/create', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        course: teacherCourse || '', // Reset to teacher's course
        deadline: '',
        maxMarks: 10,
        file: null
      });
      fetchAssignments();
      setMessage('Assignment created successfully!');
    } catch (err) {
      console.error('Error creating assignment:', err);
      setMessage('Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  const viewAssignmentDetails = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://student-portal-production-7307.up.railway.app/api/assignments/teacher/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAssignment(res.data.assignment);
      setStudents(res.data.students);
    } catch (err) {
      console.error('Error fetching assignment details:', err);
      setMessage('Error loading assignment details');
    }
  };

  const gradeAssignment = async (studentId, marks, feedback) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://student-portal-production-7307.up.railway.app/api/assignments/teacher/grade/${studentId}/${selectedAssignment._id}`, 
        { marks, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the student list
      viewAssignmentDetails(selectedAssignment._id);
      setMessage('Grades updated successfully!');
    } catch (err) {
      console.error('Error grading assignment:', err);
      setMessage('Error updating grades');
    }
  };

  return (
    <div className="assignment-manager">
      <h2>Assignment Management</h2>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className="assignment-header">
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Create New Assignment'}
        </button>
      </div>

      {showForm && (
        <div className="assignment-form">
          <h3>Create New Assignment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>
              <div className="form-group">
                <label>Course</label>
                <div className="course-display">
                  <strong>{teacherCourse}</strong>
                  <input
                    type="hidden"
                    name="course"
                    value={teacherCourse}
                  />
                </div>
                <p className="course-note">Assignments are automatically created for your teaching course</p>
              </div>
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Maximum Marks</label>
              <input
                type="number"
                name="maxMarks"
                value={formData.maxMarks}
                onChange={handleChange}
                min="1"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Attachment (Optional)</label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </form>
        </div>
      )}

      <div className="assignments-list">
        <h3>Your Assignments</h3>
        {assignments.length === 0 ? (
          <p>No assignments created yet.</p>
        ) : (
          assignments.map(assignment => (
            <div key={assignment._id} className="assignment-card">
              <div className="assignment-info">
                <h4>{assignment.title}</h4>
                <p>{assignment.description}</p>
                <div className="assignment-meta">
                  <span>Course: {assignment.course}</span>
                  <span>Deadline: {format(new Date(assignment.deadline), 'PPpp')}</span>
                  <span>Max Marks: {assignment.maxMarks}</span>
                </div>
              </div>
              <div className="assignment-actions">
                <button 
                  onClick={() => viewAssignmentDetails(assignment._id)}
                  className="btn btn-secondary"
                >
                  View Submissions
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAssignment && (
        <div className="submission-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submissions for: {selectedAssignment.title}</h3>
              <button onClick={() => setSelectedAssignment(null)}>×</button>
            </div>
            <div className="students-list">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Marks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <StudentRow 
                      key={student._id} 
                      student={student} 
                      onGrade={gradeAssignment}
                      maxMarks={selectedAssignment.maxMarks}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudentRow = ({ student, onGrade, maxMarks }) => {
  const [showGrading, setShowGrading] = useState(false);
  const [marks, setMarks] = useState(student.submission?.marks || '');
  const [feedback, setFeedback] = useState(student.submission?.feedback || '');

  const handleGradeSubmit = () => {
    onGrade(student._id, parseFloat(marks), feedback);
    setShowGrading(false);
  };

  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.email}</td>
      <td>{student.course}</td>
      <td>
        <span className={`status-badge ${student.status}`}>
          {student.status}
        </span>
      </td>
      <td>
        {student.submission?.marks !== undefined ? 
          `${student.submission.marks}/${maxMarks}` : 'N/A'
        }
      </td>
      <td>
        {student.submission ? (
          <>
            <button 
              onClick={() => window.open(`https://student-portal-production-7307.up.railway.app/uploads/assignments/${student.submission.submissionFile}`, '_blank')}
              className="btn btn-sm btn-info"
            >
              View Submission
            </button>
            <button 
              onClick={() => setShowGrading(true)}
              className="btn btn-sm btn-warning"
            >
              {student.submission.marks !== undefined ? 'Edit Grade' : 'Grade'}
            </button>
          </>
        ) : (
          <span className="text-muted">Not submitted</span>
        )}
      </td>

      {showGrading && (
        <div className="grading-modal">
          <div className="modal-content">
            <h4>Grade Assignment for {student.name}</h4>
            <div className="form-group">
              <label>Marks (0-{maxMarks})</label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                min="0"
                max={maxMarks}
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleGradeSubmit}>Save</button>
              <button onClick={() => setShowGrading(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </tr>
  );
};

export default AssignmentManager;