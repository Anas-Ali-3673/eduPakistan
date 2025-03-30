import React, { useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TutorVerification from './components/TutorVerification';
import ReportingDashboard from './components/ReportingDashboard';
import './dashboard.css';

const SECTIONS = {
  VERIFICATION: 'verification',
  REPORTS: 'reports',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState(SECTIONS.VERIFICATION);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case SECTIONS.VERIFICATION:
        return <TutorVerification />;
      case SECTIONS.REPORTS:
        return <ReportingDashboard />;
      default:
        return <TutorVerification />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <div className="logo">
          <Link to="/">EduConnect Pakistan</Link>
        </div>
        <div className="user-menu">
          <span className="admin-badge">Administrator</span>
          <span className="welcome-message">
            Welcome, {currentUser?.name || currentUser?.email || 'Admin'}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="admin-dashboard-main">
        <div className="admin-sidebar">
          <div className="user-profile">
            <div className="avatar">
              {currentUser?.profileImage ? (
                <img src={currentUser.profileImage} alt={currentUser?.name} />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser?.name?.[0] || currentUser?.email?.[0] || 'A'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h4>{currentUser?.name || currentUser?.email || 'Admin'}</h4>
              <p>Platform Administrator</p>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            <ul>
              <li
                className={
                  activeSection === SECTIONS.VERIFICATION ? 'active' : ''
                }
                onClick={() => setActiveSection(SECTIONS.VERIFICATION)}
              >
                <span className="nav-icon">✓</span>
                <span className="nav-label">Tutor Verification</span>
              </li>
              <li
                className={activeSection === SECTIONS.REPORTS ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.REPORTS)}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-label">Reporting Dashboard</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="admin-main-content">
          <h2>
            {activeSection === SECTIONS.VERIFICATION
              ? 'Tutor Verification System'
              : 'Reporting Dashboard'}
          </h2>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
