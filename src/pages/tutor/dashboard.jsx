import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../student/dashboard.css';

// Mock components for tutor dashboard
const TutorStatsOverview = () => (
  <div className="dashboard-section">
    <h3>Your Teaching Overview</h3>
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon">👨‍🏫</div>
        <div className="stat-value">12</div>
        <div className="stat-label">Active Students</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">⭐</div>
        <div className="stat-value">4.8</div>
        <div className="stat-label">Average Rating</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">⏱️</div>
        <div className="stat-value">18</div>
        <div className="stat-label">Teaching Hours This Week</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-value">₨15,000</div>
        <div className="stat-label">Earnings This Month</div>
      </div>
    </div>
  </div>
);

// For session management
const TutorSessionManagement = () => (
  <div className="dashboard-section">
    <h3>Manage Your Teaching Sessions</h3>

    <h4>Upcoming Sessions</h4>
    <div className="session-list">
      <div className="session-card">
        <div className="session-info">
          <h5>Mathematics with Ahmed Siddiqui</h5>
          <p>📅 Tuesday, Oct 10, 2023 • 4:00 PM - 5:00 PM</p>
          <p>📍 Online Session (Zoom)</p>
        </div>
        <div className="session-actions">
          <button className="btn btn-sm">Start Session</button>
          <button className="btn btn-outlined btn-sm">Reschedule</button>
          <button className="btn btn-danger btn-sm">Cancel</button>
        </div>
      </div>
      <div className="session-card">
        <div className="session-info">
          <h5>Physics with Fatima Zahra</h5>
          <p>📅 Thursday, Oct 12, 2023 • 5:30 PM - 7:00 PM</p>
          <p>📍 Central Library, Islamabad</p>
        </div>
        <div className="session-actions">
          <button className="btn btn-outlined btn-sm">View Details</button>
          <button className="btn btn-outlined btn-sm">Reschedule</button>
          <button className="btn btn-danger btn-sm">Cancel</button>
        </div>
      </div>
    </div>

    <h4>Past Sessions</h4>
    <div className="session-list">
      <div className="session-card past">
        <div className="session-info">
          <h5>English with Zainab Khan</h5>
          <p>📅 Monday, Oct 2, 2023 • 3:00 PM - 4:30 PM</p>
          <p>⭐⭐⭐⭐⭐ (Student rating)</p>
        </div>
        <div className="session-actions">
          <button className="btn btn-outlined btn-sm">View Notes</button>
          <button className="btn btn-primary btn-sm">Contact Student</button>
        </div>
      </div>
    </div>
  </div>
);

// Mock components for tutor dashboard
const AvailabilityManagement = () => (
  <div className="dashboard-section">
    <h3>Manage Your Availability</h3>
    <div className="availability-calendar">
      <p>Set your teaching hours and availability schedule here.</p>
      <button className="btn">Update Availability</button>
    </div>
  </div>
);

const EarningsComponent = () => (
  <div className="placeholder-message">
    <h3>Earnings & Payments</h3>
    <p>View your earnings history and manage payment methods.</p>
  </div>
);

const TutorProfile = () => (
  <div className="placeholder-message">
    <h3>Tutor Profile</h3>
    <p>Update your profile, qualifications, and teaching subjects.</p>
    <button className="btn">Edit Profile</button>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser, isAuthenticated, isStudent, isTutor, logout, loading } =
    useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/signin');
      }
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <Link to="/">EduConnect Pakistan</Link>
        </div>
        <div className="user-menu">
          <span className="welcome-message">
            Welcome, {currentUser?.name || currentUser?.email || 'Tutor'}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        <div className="sidebar">
          <div className="user-profile">
            <div className="avatar">
              {currentUser?.profileImage ? (
                <img src={currentUser.profileImage} alt={currentUser?.name} />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser?.name?.[0] || currentUser?.email?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h4>{currentUser?.name || currentUser?.email || 'Tutor'}</h4>
              <p>Tutor</p>
            </div>
          </div>

          <ul className="sidebar-menu">
            <li className={activeTab === 'overview' ? 'active' : ''}>
              <a href="#overview" onClick={() => setActiveTab('overview')}>
                <i className="icon">📊</i> Overview
              </a>
            </li>
            <li className={activeTab === 'profile' ? 'active' : ''}>
              <a href="#profile" onClick={() => setActiveTab('profile')}>
                <i className="icon">👤</i> Profile
              </a>
            </li>
            <li className={activeTab === 'sessions' ? 'active' : ''}>
              <a href="#sessions" onClick={() => setActiveTab('sessions')}>
                <i className="icon">📅</i> Teaching Sessions
              </a>
            </li>
            <li className={activeTab === 'availability' ? 'active' : ''}>
              <a
                href="#availability"
                onClick={() => setActiveTab('availability')}
              >
                <i className="icon">🕒</i> Availability
              </a>
            </li>
            <li className={activeTab === 'students' ? 'active' : ''}>
              <a href="#students" onClick={() => setActiveTab('students')}>
                <i className="icon">👨‍🎓</i> My Students
              </a>
            </li>
            <li className={activeTab === 'earnings' ? 'active' : ''}>
              <a href="#earnings" onClick={() => setActiveTab('earnings')}>
                <i className="icon">💰</i> Earnings
              </a>
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''}>
              <a href="#settings" onClick={() => setActiveTab('settings')}>
                <i className="icon">⚙️</i> Settings
              </a>
            </li>
          </ul>
        </div>

        <div className="main-content">
          {activeTab === 'overview' && (
            <>
              <h2>Tutor Dashboard</h2>
              <TutorStatsOverview />
              <div className="dashboard-card">
                <h3>Recent Activities</h3>
                <p>You have 3 new session requests!</p>
                <p>Next teaching session: Mathematics on Tuesday at 4:00 PM</p>
              </div>
            </>
          )}
          {activeTab === 'profile' && <TutorProfile />}
          {activeTab === 'sessions' && <TutorSessionManagement />}
          {activeTab === 'availability' && <AvailabilityManagement />}
          {activeTab === 'students' && (
            <div className="placeholder-message">
              <h3>My Students</h3>
              <p>View and manage your current students.</p>
            </div>
          )}
          {activeTab === 'earnings' && <EarningsComponent />}
          {activeTab === 'settings' && (
            <div className="placeholder-message">
              <h3>Account Settings</h3>
              <p>Update your account settings and preferences here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
