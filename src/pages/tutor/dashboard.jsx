import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../student/dashboard.css';
import VerificationRequestForm from './components/VerificationRequestForm';

// Mock components for tutor dashboard
const TutorStatsOverview = () => (
  <div className="dashboard-section">
    <h3>Your Teaching Overview</h3>
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-value">12</div>
        <div className="stat-label">Active Students</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">4.8</div>
        <div className="stat-label">Average Rating</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">18</div>
        <div className="stat-label">Teaching Hours This Week</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">₨15,000</div>
        <div className="stat-label">Earnings This Month</div>
      </div>
    </div>
  </div>
);

// For session management
const TutorSessionManagement = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5000/api/sessions?userId=${currentUser._id}&role=tutor`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data = await response.json();
        setSessions(data.data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser._id) {
      fetchSessions();
    }
  }, [currentUser]);

  // Format date and time for display
  const formatDateTime = (date, time) => {
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    const formattedDate = new Date(date).toLocaleDateString('en-US', options);
    return `${formattedDate} • ${time}`;
  };

  // Separate upcoming from past sessions
  const now = new Date();
  const upcomingSessions = sessions.filter((session) => {
    const sessionDate = new Date(`${session.date}T${session.startTime}`);
    return sessionDate > now;
  });

  const pastSessions = sessions.filter((session) => {
    const sessionDate = new Date(`${session.date}T${session.startTime}`);
    return sessionDate <= now;
  });

  // Handle session details view
  const handleViewDetails = async (sessionId) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedSessionDetails(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }

      const data = await response.json();

      if (data.status === 'success') {
        setSelectedSessionDetails(data.data);
        setShowDetailsModal(true);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      setDetailsError(
        err.message || 'An error occurred while fetching session details'
      );
      console.error('Error fetching session details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle closing the details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  // Handle session cancellation
  const handleCancel = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token || ''}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to cancel session');
        }

        // Remove the cancelled session from state
        setSessions((prevSessions) =>
          prevSessions.filter((session) => session._id !== sessionId)
        );
      } catch (err) {
        alert(err.message || 'An error occurred while cancelling the session');
        console.error('Error cancelling session:', err);
      }
    }
  };

  return (
    <div className="dashboard-section">
      <h3>Manage Your Teaching Sessions</h3>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading sessions...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <h4>Upcoming Sessions ({upcomingSessions.length})</h4>
          {upcomingSessions.length > 0 ? (
            <div className="session-list">
              {upcomingSessions.map((session) => (
                <div className="session-card" key={session._id}>
                  <div className="session-info">
                    <h5>
                      {session.subject} with{' '}
                      {session.student?.name || 'Student'}
                    </h5>
                    <p>
                      {formatDateTime(session.date, session.startTime)} -{' '}
                      {session.endTime}
                    </p>
                    <p> {session.location || 'Online Session'}</p>
                  </div>
                  <div className="session-actions">
                    <button
                      className="btn btn-sm"
                      onClick={() => handleViewDetails(session._id)}
                    >
                      Start Session
                    </button>
                    <button
                      className="btn btn-outlined btn-sm"
                      onClick={() => handleViewDetails(session._id)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(session._id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You have no upcoming sessions scheduled.</p>
          )}

          <h4>Past Sessions ({pastSessions.length})</h4>
          {pastSessions.length > 0 ? (
            <div className="session-list">
              {pastSessions.map((session) => (
                <div className="session-card past" key={session._id}>
                  <div className="session-info">
                    <h5>
                      {session.subject} with{' '}
                      {session.student?.name || 'Student'}
                    </h5>
                    <p>
                      {formatDateTime(session.date, session.startTime)} -{' '}
                      {session.endTime}
                    </p>
                    <p>
                      {session.rating
                        ? '⭐'.repeat(session.rating)
                        : 'Not rated yet'}
                    </p>
                  </div>
                  <div className="session-actions">
                    <button
                      className="btn btn-outlined btn-sm"
                      onClick={() => handleViewDetails(session._id)}
                    >
                      View Details
                    </button>
                    <button className="btn btn-primary btn-sm">
                      Contact Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You have no past sessions.</p>
          )}
        </>
      )}

      {/* Session Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseDetails}>
              &times;
            </button>
            <div className="modal-header">
              <h3>Session Details</h3>
            </div>
            <div className="modal-body">
              {detailsLoading ? (
                <div className="loading-container">
                  <div className="loader small"></div>
                  <p>Loading details...</p>
                </div>
              ) : detailsError ? (
                <div className="error-message">{detailsError}</div>
              ) : selectedSessionDetails ? (
                <div className="session-details">
                  <div className="detail-row">
                    <span className="detail-label">Subject:</span>
                    <span className="detail-value">
                      {selectedSessionDetails.subject}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Student:</span>
                    <span className="detail-value">
                      {selectedSessionDetails.student?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {formatDateTime(
                        selectedSessionDetails.date,
                        selectedSessionDetails.startTime
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">
                      {selectedSessionDetails.startTime} -{' '}
                      {selectedSessionDetails.endTime}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">
                      {selectedSessionDetails.location || 'Online Session'}
                    </span>
                  </div>
                  {selectedSessionDetails.notes && (
                    <div className="detail-row">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">
                        {selectedSessionDetails.notes}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p>No session information available</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add a new component for verification
const TutorVerification = () => {
  return (
    <div className="dashboard-section">
      <h3>Verification</h3>
      <p className="section-description">
        Get verified to increase your credibility and attract more students.
      </p>
      <VerificationRequestForm />
    </div>
  );
};

const TutorProfile = () => {
  const { currentUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hourlyRate: '',
    teachingPreference: '',
    subjects: [],
    qualifications: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfile(data.data);

        // Initialize form data with profile data
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          hourlyRate: data.data.hourlyRate || '',
          teachingPreference: data.data.teachingPreference || '',
          subjects: data.data.subjects || [],
          qualifications: data.data.qualifications || [],
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.token) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling edit
      setImagePreview(null);
      setImageFile(null);
    }
    setIsEditing(!isEditing);
    setEditSuccess(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation for teaching preference
      if (
        formData.teachingPreference &&
        !['Online', 'In-person', 'Both'].includes(formData.teachingPreference)
      ) {
        throw new Error('Invalid teaching preference value');
      }

      // Use FormData to handle file uploads
      const formDataToSend = new FormData();

      // Append text fields (non-array fields)
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('hourlyRate', formData.hourlyRate);
      formDataToSend.append('teachingPreference', formData.teachingPreference);

      // Handle arrays
      if (formData.subjects && formData.subjects.length > 0) {
        formDataToSend.append('subjects', JSON.stringify(formData.subjects));
      }

      if (formData.qualifications && formData.qualifications.length > 0) {
        formDataToSend.append(
          'qualifications',
          JSON.stringify(formData.qualifications)
        );
      }

      // Append image file if selected
      if (imageFile) {
        formDataToSend.append('profileImage', imageFile);
      }

      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.data);

      // Update user in auth context
      login({
        ...currentUser,
        ...data.data,
      });

      setEditSuccess(true);

      // Exit edit mode after success
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-section">
      <h3>My Profile</h3>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your profile...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : profile ? (
        <div className="profile-container">
          {!isEditing ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt={profile.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {profile.name
                        ? profile.name.charAt(0).toUpperCase()
                        : '?'}
                    </div>
                  )}
                </div>
                <div className="profile-title">
                  <h4>{profile.name}</h4>
                  <p>{profile.email}</p>
                  <span className="user-type-badge">{profile.role}</span>
                </div>
              </div>

              <div className="profile-details">
                <div className="profile-section">
                  <h5>Personal Information</h5>
                  <div className="profile-field">
                    <label>Name:</label>
                    <p>{profile.name}</p>
                  </div>
                  <div className="profile-field">
                    <label>Email:</label>
                    <p>{profile.email}</p>
                  </div>
                  <div className="profile-field">
                    <label>Hourly Rate:</label>
                    <p>
                      {profile.hourlyRate
                        ? `PKR ${profile.hourlyRate}`
                        : 'Not set'}
                    </p>
                  </div>
                  <div className="profile-field">
                    <label>Teaching Preference:</label>
                    <p>{profile.teachingPreference || 'Not specified'}</p>
                  </div>
                  <div className="profile-field">
                    <label>Average Rating:</label>
                    <p>
                      {profile.avgRating || profile.rating ? (
                        <>
                          <span className="stars">
                            {'★'.repeat(
                              Math.round(profile.avgRating || profile.rating)
                            )}
                          </span>
                          <span className="rating-value">
                            {' '}
                            ({(profile.avgRating || profile.rating).toFixed(1)})
                          </span>
                        </>
                      ) : (
                        'Not rated yet'
                      )}
                    </p>
                  </div>
                </div>

                <div className="profile-section">
                  <h5>Subjects</h5>
                  {profile.subjects && profile.subjects.length > 0 ? (
                    <div className="tutor-subjects">
                      {profile.subjects.map((subject, index) => (
                        <span key={index} className="subject-tag">
                          {subject}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No subjects listed</p>
                  )}
                </div>

                <div className="profile-section">
                  <h5>Qualifications</h5>
                  {profile.qualifications &&
                  profile.qualifications.length > 0 ? (
                    <ul className="qualifications-list">
                      {profile.qualifications.map((qual, index) => (
                        <li key={index}>{qual}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No qualifications listed</p>
                  )}
                </div>

                <div className="profile-section">
                  <h5>Verification Status</h5>
                  <div className="verification-status">
                    <span
                      className={`status-badge ${
                        profile.isVerified ? 'verified' : 'pending'
                      }`}
                    >
                      {profile.isVerified
                        ? 'Verified'
                        : profile.verificationStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="profile-section">
                  <h5>Total Earnings</h5>
                  <div className="profile-field">
                    <p className="earnings-value">
                      {profile.earnings
                        ? `PKR ${profile.earnings.toLocaleString()}`
                        : 'No earnings recorded yet'}
                    </p>
                  </div>
                </div>

                <button className="edit-profile-btn" onClick={handleEditToggle}>
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            <div className="profile-edit-form-container">
              {editSuccess && (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <p>Profile updated successfully!</p>
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-header">
                  <h4>Edit Your Profile</h4>
                </div>

                <div className="form-section">
                  <h5>Profile Picture</h5>
                  <div className="profile-picture-upload">
                    <div className="current-picture">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="preview-image"
                        />
                      ) : profile.profileImage ? (
                        <img src={profile.profileImage} alt={profile.name} />
                      ) : (
                        <div className="avatar-placeholder large">
                          {profile.name
                            ? profile.name.charAt(0).toUpperCase()
                            : '?'}
                        </div>
                      )}
                    </div>
                    <div className="upload-controls">
                      <label
                        htmlFor="profile-image"
                        className="file-input-label"
                      >
                        Choose Image
                      </label>
                      <input
                        type="file"
                        id="profile-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                      <small className="form-text">
                        Recommended size: 300x300px, Max: 2MB
                      </small>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h5>Personal Information</h5>

                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled
                    />
                    <small className="form-text">Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="hourlyRate">Hourly Rate (PKR)</label>
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="teachingPreference">
                      Teaching Preference
                    </label>
                    <select
                      id="teachingPreference"
                      name="teachingPreference"
                      value={formData.teachingPreference}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select preference</option>
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleEditToggle}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary ${
                      isSubmitting ? 'loading' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>Could not load profile information.</p>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser, isAuthenticated, isStudent, isTutor, logout, loading } =
    useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/signin');
      } else if (!isTutor) {
        // If authenticated but not a tutor, redirect to appropriate dashboard
        navigate('/student/dashboard');
      }
    }
  }, [isAuthenticated, loading, navigate, isTutor]);

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TutorStatsOverview />;
      case 'sessions':
        return <TutorSessionManagement />;
      case 'profile':
        return <TutorProfile />;
      case 'verification':
        return <TutorVerification />;
      default:
        return <TutorStatsOverview />;
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
                Overview
              </a>
            </li>
            <li className={activeTab === 'profile' ? 'active' : ''}>
              <a href="#profile" onClick={() => setActiveTab('profile')}>
                Profile
              </a>
            </li>
            <li className={activeTab === 'sessions' ? 'active' : ''}>
              <a href="#sessions" onClick={() => setActiveTab('sessions')}>
                Teaching Sessions
              </a>
            </li>
            <li className={activeTab === 'verification' ? 'active' : ''}>
              <a
                href="#verification"
                onClick={() => setActiveTab('verification')}
              >
                Verification
              </a>
            </li>
          </ul>
        </div>

        <div className="main-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
