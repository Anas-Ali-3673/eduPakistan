import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import VerificationRequests from './components/VerificationRequests';
import TutorVerification from './components/TutorVerification';
import ReportsManagement from './components/ReportsManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState('verification');

  // Redirect if not logged in or not an admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'verification':
        return <VerificationRequests />;
      case 'tutorVerification':
        return <TutorVerification />;
      case 'reports':
        return <ReportsManagement />;
      default:
        return <VerificationRequests />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h3 className="admin-welcome">Welcome, {currentUser.name}</h3>
        <nav className="admin-nav">
          <button
            className={`nav-item ${
              activeSection === 'verification' ? 'active' : ''
            }`}
            onClick={() => setActiveSection('verification')}
          >
            Verification Requests
          </button>
          <button
            className={`nav-item ${
              activeSection === 'tutorVerification' ? 'active' : ''
            }`}
            onClick={() => setActiveSection('tutorVerification')}
          >
            Tutor Verification
          </button>
          <button
            className={`nav-item ${
              activeSection === 'reports' ? 'active' : ''
            }`}
            onClick={() => setActiveSection('reports')}
          >
            User Reports
          </button>
          {/* Add more navigation items as needed */}
        </nav>
      </div>
      <div className="admin-content">{renderActiveSection()}</div>
    </div>
  );
};

export default AdminDashboard;
