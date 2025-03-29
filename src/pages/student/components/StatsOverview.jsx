import React from 'react';

const StatsOverview = () => {
  return (
    <div className="dashboard-section">
      <h3>Your Learning Overview</h3>
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">3</div>
          <div className="stat-label">Ongoing Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">5</div>
          <div className="stat-label">Completed Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">4.7</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
