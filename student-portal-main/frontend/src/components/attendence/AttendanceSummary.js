// components/AttendanceSummary.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AttendanceSummary = ({ data, detailed = false }) => {
  const { summary, recentRecords } = data;
  
  // Determine color based on attendance percentage
  let attendanceColor = '#007bff'; // Blue for >= 80%
  if (summary.attendancePercentage < 80) {
    attendanceColor = '#ffc107'; // Yellow for 75-80%
  }
  if (summary.attendancePercentage < 75) {
    attendanceColor = '#dc3545'; // Red for < 75%
  }

  const chartData = {
    labels: ['Present', 'Absent', 'Leave'],
    datasets: [
      {
        data: [summary.presentDays, summary.absentDays, summary.leaveDays],
        backgroundColor: [
          '#28a745',
          '#dc3545',
          '#ffc107'
        ],
        borderColor: [
          '#28a745',
          '#dc3545',
          '#ffc107'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '70%',
  };

  return (
    <div className="attendance-summary">
      <h2>Attendance Summary (Last 30 Days)</h2>
      
      <div className="attendance-container">
        <div className="attendance-chart">
          <Doughnut data={chartData} options={options} />
          <div className="attendance-percentage">
            <span style={{ color: attendanceColor }}>
              {summary.attendancePercentage}%
            </span>
          </div>
        </div>
        
        <div className="attendance-stats">
          <div className="stat-item">
            <span className="stat-label">Total Days:</span>
            <span className="stat-value">{summary.totalDays}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label present">Present:</span>
            <span className="stat-value">{summary.presentDays}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label absent">Absent:</span>
            <span className="stat-value">{summary.absentDays}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label leave">Leave:</span>
            <span className="stat-value">{summary.leaveDays}</span>
          </div>
        </div>
      </div>

      {detailed && recentRecords && recentRecords.length > 0 && (
        <div className="attendance-details">
          <h3>Recent Attendance Records</h3>
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map(record => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;