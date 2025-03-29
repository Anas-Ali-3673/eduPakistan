import React from 'react';

const SessionBooking = () => {
  return (
    <div className="dashboard-section">
      <h3>Book a Session</h3>
      <div className="booking-form">
        <div className="form-group">
          <label>Select Subject</label>
          <select>
            <option value="">Choose a subject</option>
            <option value="math">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="english">English</option>
          </select>
        </div>

        <div className="form-group">
          <label>Select Tutor</label>
          <select>
            <option value="">Choose a tutor</option>
            <option value="1">Dr. Ahmed Khan - Mathematics</option>
            <option value="2">Prof. Ali Raza - Physics</option>
            <option value="3">Ms. Fatima Shah - English</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input type="date" />
        </div>

        <div className="form-group">
          <label>Time</label>
          <input type="time" />
        </div>

        <div className="form-group">
          <label>Session Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="sessionType"
                value="online"
                defaultChecked
              />{' '}
              Online
            </label>
            <label>
              <input type="radio" name="sessionType" value="in-person" />{' '}
              In-person
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Notes for the tutor</label>
          <textarea placeholder="Describe what you need help with..."></textarea>
        </div>

        <button className="btn btn-primary">Book Session</button>
      </div>
    </div>
  );
};

export default SessionBooking;
