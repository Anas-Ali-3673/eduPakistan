import React from 'react';

const SessionManagement = () => {
  return (
    <div className="dashboard-section">
      <h3>My Sessions</h3>
      <div className="sessions-list">
        <p>You have no upcoming sessions scheduled.</p>
        <button className="btn btn-primary">Book a Session</button>
      </div>
    </div>
  );
};

export default SessionManagement;
