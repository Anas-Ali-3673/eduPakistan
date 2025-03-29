import React from 'react';

const TutorSearch = () => {
  return (
    <div className="dashboard-section">
      <h3>Find a Tutor</h3>
      <div className="search-container">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search by name or subject"
            className="search-input"
          />
          <select className="filter-dropdown">
            <option value="">All Subjects</option>
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="computer">Computer Science</option>
          </select>
          <button className="btn btn-primary">Search</button>
        </div>

        <div className="tutors-list">
          {[1, 2, 3].map((tutor) => (
            <div key={tutor} className="tutor-card">
              <div className="tutor-photo">👩‍🏫</div>
              <div className="tutor-info">
                <h4>Dr. Ahmed Khan {tutor}</h4>
                <p className="tutor-subject">Mathematics</p>
                <p className="tutor-rating">⭐⭐⭐⭐⭐ (4.9)</p>
                <p className="tutor-price">2000 PKR/hr</p>
              </div>
              <div className="tutor-actions">
                <button className="btn btn-sm">View Profile</button>
                <button className="btn btn-primary btn-sm">Book Session</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorSearch;
