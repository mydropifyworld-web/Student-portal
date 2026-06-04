// components/student/Assignments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isAfter } from 'date-fns';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://student-portal-production-7307.up.railway.app/api/assignments/student/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);

      // Check submission status for each assignment
      const statuses = {};
      for (const assignment of res.data) {
        try {
          const statusRes = await axios.get(
            `https://student-portal-production-7307.up.railway.app/api/assignments/student/submission/${assignment._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          statuses[assignment._id] = statusRes.data;
        } catch (err) {
          if (err.response?.status === 404) {
            statuses[assignment._id] = null;
          }
        }
      }
      setSubmissionStatus(statuses);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setMessage('Error loading assignments');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(
        `https://student-portal-production-7307.up.railway.app/api/assignments/student/submit/${selectedAssignment._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage('Assignment submitted successfully!');
      setSelectedAssignment(null);
      setFile(null);
      fetchAssignments(); // Refresh the list
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setMessage(err.response?.data?.message || 'Error submitting assignment');
    } finally {
      setLoading(false);
    }
  };

  const isPastDeadline = (deadline) => {
    return isAfter(new Date(), new Date(deadline));
  };

  return (
    <div className="assignments-page">
      <h1>My Assignments</h1>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      {assignments.length === 0 ? (
        <div className="no-assignments">
          <i className="fas fa-clipboard-list fa-3x"></i>
          <h3>No assignments yet</h3>
          <p>Your teacher hasn't posted any assignments yet.</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map(assignment => {
            const submission = submissionStatus[assignment._id];
            const deadlinePassed = isPastDeadline(assignment.deadline);
            
            return (
              <div key={assignment._id} className="assignment-card">
                <div className="assignment-header">
                  <h3>{assignment.title}</h3>
                  {assignment.file && (
                    <a 
                      href={`https://student-portal-production-7307.up.railway.app/uploads/assignments/${assignment.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      <i className="fas fa-download"></i> Download
                    </a>
                  )}
                </div>
                
                <div className="assignment-body">
                  <p>{assignment.description}</p>
                  
                  <div className="assignment-details">
                    <div className="detail">
                      <i className="fas fa-book"></i>
                      <span>{assignment.course}</span>
                    </div>
                    <div className="detail">
                      <i className="fas fa-clock"></i>
                      <span>Deadline: {format(new Date(assignment.deadline), 'PPpp')}</span>
                    </div>
                    <div className="detail">
                      <i className="fas fa-star"></i>
                      <span>Max Marks: {assignment.maxMarks}</span>
                    </div>
                  </div>
                  
                  <div className="assignment-status">
                    {submission ? (
                      <div className="submission-info">
                        <div className={`status ${submission.status}`}>
                          <i className={
                            submission.status === 'graded' ? 'fas fa-check-circle' :
                            submission.status === 'submitted' ? 'fas fa-clock' : 'fas fa-times-circle'
                          }></i>
                          <span>
                            {submission.status === 'graded' ? 'Graded' :
                             submission.status === 'submitted' ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                        
                        {submission.submittedAt && (
                          <div className="submission-date">
                            Submitted: {format(new Date(submission.submittedAt), 'PPpp')}
                          </div>
                        )}
                        
                        {submission.marks !== undefined && (
                          <div className="marks">
                            Marks: {submission.marks}/{assignment.maxMarks}
                          </div>
                        )}
                        
                        {submission.feedback && (
                          <div className="feedback">
                            Feedback: {submission.feedback}
                          </div>
                        )}
                      </div>
                    ) : deadlinePassed ? (
                      <div className="status missed">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>Deadline Passed</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedAssignment(assignment)}
                        className="btn btn-primary"
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAssignment && (
        <div className="submission-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Submit Assignment: {selectedAssignment.title}</h2>
              <button onClick={() => setSelectedAssignment(null)}>×</button>
            </div>
            
            <div className="assignment-info">
              <p>{selectedAssignment.description}</p>
              <p><strong>Deadline:</strong> {format(new Date(selectedAssignment.deadline), 'PPpp')}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Upload your submission (PDF, Word, or Images)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setSelectedAssignment(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;