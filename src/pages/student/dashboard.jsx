import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import only components that exist
import TutorSearch from './components/TutorSearch';
import SessionBooking from './components/SessionBooking';
import ProfileManagement from './components/ProfileManagement';
import './dashboard.css';

// Placeholder components for missing imports
const StatsOverview = () => (
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

const SessionManagement = () => (
  <div className="dashboard-section">
    <h3>My Sessions</h3>
    <div className="sessions-list">
      <p>You have no upcoming sessions scheduled.</p>
      <button className="btn btn-primary">Book a Session</button>
    </div>
  </div>
);

const ReviewsSystem = () => (
  <div className="dashboard-section">
    <h3>My Reviews</h3>
    <p>You haven't submitted any reviews yet.</p>
  </div>
);

const WishlistComponent = () => (
  <div className="dashboard-section">
    <h3>My Wishlist</h3>
    <p>You have no tutors or courses in your wishlist.</p>
  </div>
);

// Define sections for the dashboard
const SECTIONS = {
  OVERVIEW: 'overview',
  TUTORS: 'tutors',
  SESSIONS: 'sessions',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  WISHLIST: 'wishlist',
  COURSES: 'courses',
  SETTINGS: 'settings',
  PROFILE: 'profile',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isStudent, logout, loading } =
    useAuth();
  const [activeSection, setActiveSection] = useState(SECTIONS.OVERVIEW);

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case SECTIONS.OVERVIEW:
        return <StatsOverview />;
      case SECTIONS.TUTORS:
        return <TutorSearch />;
      case SECTIONS.SESSIONS:
        return <SessionManagement />;
      case SECTIONS.BOOKINGS:
        return <SessionBooking />;
      case SECTIONS.REVIEWS:
        return <ReviewsSystem />;
      case SECTIONS.WISHLIST:
        return <WishlistComponent />;
      case SECTIONS.COURSES:
        return (
          <div className="placeholder-message">
            <h3>My Courses</h3>
            <p>View and manage your enrolled courses here.</p>
            <button className="btn">Browse Courses</button>
          </div>
        );
      case SECTIONS.SETTINGS:
        return (
          <div className="placeholder-message">
            <h3>Account Settings</h3>
            <p>Update your account settings and preferences here.</p>
          </div>
        );
      case SECTIONS.PROFILE:
        return <ProfileManagement />;
      default:
        return <StatsOverview />;
    }
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
            Welcome, {currentUser?.name || currentUser?.email || 'User'}
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
              <h4>{currentUser?.name || currentUser?.email || 'User'}</h4>
              <p>{isStudent ? 'Student' : 'User'}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <ul>
              <li
                className={activeSection === SECTIONS.OVERVIEW ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.OVERVIEW)}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-label">Dashboard Overview</span>
              </li>
              <li
                className={activeSection === SECTIONS.PROFILE ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.PROFILE)}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-label">My Profile</span>
              </li>
              <li
                className={activeSection === SECTIONS.TUTORS ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.TUTORS)}
              >
                <span className="nav-icon">👨‍🏫</span>
                <span className="nav-label">Find Tutors</span>
              </li>
              <li
                className={activeSection === SECTIONS.SESSIONS ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.SESSIONS)}
              >
                <span className="nav-icon">📅</span>
                <span className="nav-label">My Sessions</span>
              </li>
              <li
                className={activeSection === SECTIONS.BOOKINGS ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.BOOKINGS)}
              >
                <span className="nav-icon">📝</span>
                <span className="nav-label">Book Sessions</span>
              </li>
              <li
                className={activeSection === SECTIONS.COURSES ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.COURSES)}
              >
                <span className="nav-icon">📚</span>
                <span className="nav-label">My Courses</span>
              </li>
              <li
                className={activeSection === SECTIONS.REVIEWS ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.REVIEWS)}
              >
                <span className="nav-icon">⭐</span>
                <span className="nav-label">My Reviews</span>
              </li>
              <li
                className={activeSection === SECTIONS.WISHLIST ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.WISHLIST)}
              >
                <span className="nav-icon">❤️</span>
                <span className="nav-label">My Wishlist</span>
              </li>
              <li
                className={activeSection === SECTIONS.SETTINGS ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.SETTINGS)}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Account Settings</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="main-content">
          <h2>
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
