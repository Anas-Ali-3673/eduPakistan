import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import only components that exist
import TutorSearch from './components/TutorSearch';
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

const SessionManagement = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add new state variables for rescheduling
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  // Add state for cancellation
  const [cancelSessionId, setCancelSessionId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Add state for session details
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
          `http://localhost:5000/api/sessions?userId=${currentUser._id}`,
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

  // Format date and time for display
  const formatDateTime = (date, time) => {
    const sessionDate = new Date(`${date}T${time}`);
    return sessionDate.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Fetch available slots for a specific date when rescheduling
  const fetchAvailableSlots = async (tutor, date) => {
    setRescheduleLoading(true);
    setRescheduleError(null);

    // Validate inputs before making API call
    if (!tutor) {
      setRescheduleError('Invalid tutor information. Please try again.');
      setRescheduleLoading(false);
      console.error('Error: Missing tutorId parameter');
      return;
    }

    try {
      console.log(`Fetching slots for tutor: ${tutor}, date: ${date}`);

      const response = await fetch(
        `http://localhost:5000/api/users/${tutor}/available-slots?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
        }
      );

      // Handle HTTP errors with more specific messages
      if (!response.ok) {
        const errorStatus = response.status;
        let errorMessage = 'Failed to fetch available slots';

        if (errorStatus === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (errorStatus === 401 || errorStatus === 403) {
          errorMessage = 'Authentication error. Please sign in again.';
        } else if (errorStatus === 404) {
          errorMessage = 'Tutor availability information not found.';
        }

        throw new Error(`${errorMessage} (Status: ${errorStatus})`);
      }

      const data = await response.json();
      console.log('Available slots:', data.data);

      if (data.status === 'success') {
        setAvailableSlots(data.data);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      // Improved error message with more context
      const errorMessage =
        err.message || 'An error occurred while fetching available slots';
      setRescheduleError(errorMessage);
      console.error(
        'Error fetching available slots:',
        err,
        'Tutor ID:',
        tutor, // Fixed: use the tutor parameter instead of tutorId
        'Date:',
        date
      );
    } finally {
      setRescheduleLoading(false);
    }
  };

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
        const errorStatus = response.status;
        let errorMessage = 'Failed to fetch session details';

        if (errorStatus === 404) {
          errorMessage = 'Session not found';
        } else if (errorStatus === 401 || errorStatus === 403) {
          errorMessage = 'Authentication error. Please sign in again.';
        }

        throw new Error(`${errorMessage} (Status: ${errorStatus})`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setSelectedSessionDetails(data.data);
        setShowDetailsModal(true);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      const errorMessage =
        err.message || 'An error occurred while fetching session details';
      setDetailsError(errorMessage);
      console.error('Error fetching session details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle closing the details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  // Handle opening the reschedule modal
  const handleRescheduleClick = (session) => {
    setRescheduleSession(session);
    setRescheduleDate('');
    setSelectedSlot(null);
    setAvailableSlots([]);
    setRescheduleError(null);
    setRescheduleSuccess(false);
    setIsRescheduling(true);
  };

  // Handle date change for rescheduling with improved validation
  const handleRescheduleDateChange = (e) => {
    const selectedDate = e.target.value;
    setRescheduleDate(selectedDate);

    if (selectedDate && rescheduleSession) {
      // Check if tutor is a string ID or an object with _id property
      const tutorId =
        typeof rescheduleSession.tutor === 'string'
          ? rescheduleSession.tutor
          : rescheduleSession.tutor?._id;

      if (tutorId) {
        fetchAvailableSlots(tutorId, selectedDate);
      } else {
        setRescheduleError(
          'Invalid tutor information. Please try again later.'
        );
        console.error(
          'Error: Missing or invalid tutor ID in reschedule session',
          rescheduleSession
        );
      }
    }
  };

  // Handle slot selection
  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  // Submit reschedule request
  const handleRescheduleSubmit = async () => {
    if (!selectedSlot || !rescheduleDate) {
      setRescheduleError('Please select a date and time slot');
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError(null);

    try {
      // Get proper tutor ID regardless of format
      const tutorId =
        typeof rescheduleSession.tutor === 'string'
          ? rescheduleSession.tutor
          : rescheduleSession.tutor?._id;

      if (!tutorId) {
        throw new Error('Invalid tutor information');
      }

      const response = await fetch(
        `http://localhost:5000/api/sessions/${rescheduleSession._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
          body: JSON.stringify({
            sessionId: rescheduleSession._id,
            tutor: tutorId,
            date: rescheduleDate,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reschedule session');
      }

      // Update the sessions list with the rescheduled session
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session._id === rescheduleSession._id ? data.data : session
        )
      );

      setRescheduleSuccess(true);

      // Close the modal after success
      setTimeout(() => {
        setIsRescheduling(false);
        setRescheduleSuccess(false);
      }, 2000);
    } catch (err) {
      setRescheduleError(
        err.message || 'An error occurred while rescheduling the session'
      );
      console.error('Error rescheduling session:', err);
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Handle closing the reschedule modal
  const handleCloseReschedule = () => {
    setIsRescheduling(false);
  };

  // Handle opening cancel confirmation
  const handleCancelClick = (sessionId) => {
    setCancelSessionId(sessionId);
    setShowCancelConfirm(true);
  };

  // Handle session cancellation
  const handleCancelConfirm = async () => {
    setCancelLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions/${cancelSessionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
          body: JSON.stringify({
            sessionId: cancelSessionId,
          }),
        }
      );

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel session');
      }

      // Remove the cancelled session from the state
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session._id !== cancelSessionId)
      );

      // Close the confirmation dialog
      setShowCancelConfirm(false);
      setCancelSessionId(null);
    } catch (err) {
      console.error('Error cancelling session:', err);
      alert(err.message || 'An error occurred while cancelling the session');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle cancel confirmation close
  const handleCancelClose = () => {
    setShowCancelConfirm(false);
    setCancelSessionId(null);
  };

  return (
    <div className="dashboard-section">
      <h3>My Sessions</h3>

      {isLoading && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your sessions...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {!isLoading && !error && (
        <>
          <h4>Upcoming Sessions ({upcomingSessions.length})</h4>
          {upcomingSessions.length > 0 ? (
            <div className="session-list">
              {upcomingSessions.map((session) => (
                <div className="session-card" key={session._id}>
                  <div className="session-info">
                    <h5>
                      {session.subject} with{' '}
                      {currentUser.role === 'student'
                        ? session.tutor.name
                        : session.student.name}
                    </h5>
                    <p>
                      📅 {formatDateTime(session.date, session.startTime)} -{' '}
                      {session.endTime}
                    </p>
                    <p>📍 {session.location || 'Online Session'}</p>
                  </div>
                  <div className="session-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewDetails(session._id)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-outlined btn-sm"
                      onClick={() => handleRescheduleClick(session)}
                    >
                      Reschedule
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelClick(session._id)}
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
                      {currentUser.role === 'student'
                        ? session.tutor.name
                        : session.student.name}
                    </h5>
                    <p>
                      📅 {formatDateTime(session.date, session.startTime)} -{' '}
                      {session.endTime}
                    </p>
                    <p>📍 {session.location || 'Online Session'}</p>
                    {session.review ? (
                      <div className="session-review">
                        <div className="stars">
                          {'★'.repeat(session.review.rating)}
                          {'☆'.repeat(5 - session.review.rating)}
                        </div>
                        <p>{session.review.review}</p>
                      </div>
                    ) : (
                      <button className="btn btn-outlined btn-sm">
                        Leave a Review
                      </button>
                    )}
                  </div>
                  <div className="session-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewDetails(session._id)}
                    >
                      View Details
                    </button>
                    <button className="btn btn-outlined btn-sm">
                      Book Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No past sessions found.</p>
          )}

          {sessions.length === 0 && (
            <div className="empty-state">
              <p>You haven't booked any sessions yet.</p>
              <button
                className="btn btn-primary"
                onClick={() => setActiveSection(SECTIONS.TUTORS)}
              >
                Find a Tutor
              </button>
            </div>
          )}

          {/* Reschedule Modal */}
          {isRescheduling && (
            <div className="modal-overlay">
              <div className="modal-content reschedule-modal">
                <button
                  className="close-button"
                  onClick={handleCloseReschedule}
                >
                  &times;
                </button>
                <div className="modal-header">
                  <h3>Reschedule Session</h3>
                </div>

                {rescheduleSuccess ? (
                  <div className="success-message">
                    <div className="success-icon">✓</div>
                    <p>Session rescheduled successfully!</p>
                  </div>
                ) : (
                  <div className="modal-body">
                    {rescheduleError && (
                      <div className="booking-error-message">
                        <p>{rescheduleError}</p>
                        <button
                          className="btn btn-link"
                          onClick={() => {
                            if (rescheduleDate && rescheduleSession) {
                              const tutorId =
                                typeof rescheduleSession.tutor === 'string'
                                  ? rescheduleSession.tutor
                                  : rescheduleSession.tutor?._id;

                              if (tutorId) {
                                setRescheduleError(null);
                                fetchAvailableSlots(tutorId, rescheduleDate);
                              }
                            }
                          }}
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="reschedule-date">New Date:</label>
                      <input
                        type="date"
                        id="reschedule-date"
                        value={rescheduleDate}
                        onChange={handleRescheduleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {rescheduleLoading && (
                      <div className="slots-loading">
                        <div className="loader small"></div>
                        <p>Loading available time slots...</p>
                      </div>
                    )}

                    {!rescheduleLoading &&
                    rescheduleDate &&
                    availableSlots.length > 0 ? (
                      <div className="form-group">
                        <label>Available Time Slots:</label>
                        <div className="time-slots-container">
                          {availableSlots.map((availabilitySlot, index) => (
                            <div key={index} className="day-slots">
                              <h4>{availabilitySlot.day}</h4>
                              <div className="time-slots">
                                {availabilitySlot.slots.map(
                                  (slot, slotIndex) => (
                                    <button
                                      key={slotIndex}
                                      type="button"
                                      className={`time-slot-btn ${
                                        selectedSlot &&
                                        selectedSlot.startTime ===
                                          slot.startTime &&
                                        selectedSlot.endTime === slot.endTime
                                          ? 'selected'
                                          : ''
                                      }`}
                                      onClick={() => handleSlotSelection(slot)}
                                    >
                                      {slot.startTime} - {slot.endTime}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      !rescheduleLoading &&
                      rescheduleDate && (
                        <div className="no-slots-message">
                          <p>No available time slots for the selected date.</p>
                        </div>
                      )
                    )}

                    <div className="modal-footer">
                      <button
                        className={`btn btn-primary ${
                          rescheduleLoading ? 'loading' : ''
                        }`}
                        onClick={handleRescheduleSubmit}
                        disabled={
                          rescheduleLoading || !selectedSlot || !rescheduleDate
                        }
                      >
                        {rescheduleLoading
                          ? 'Processing...'
                          : 'Confirm Reschedule'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancel Confirmation Dialog */}
          {showCancelConfirm && (
            <div className="modal-overlay">
              <div className="modal-content confirm-modal">
                <div className="modal-header">
                  <h3>Cancel Session</h3>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to cancel this session? This action
                    cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelClose}
                    disabled={cancelLoading}
                  >
                    No, Keep It
                  </button>
                  <button
                    className={`btn btn-danger ${
                      cancelLoading ? 'loading' : ''
                    }`}
                    onClick={handleCancelConfirm}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Session'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Session Details Modal */}
          {showDetailsModal && (
            <div className="modal-overlay">
              <div className="modal-content session-details-modal">
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
                      <p>Loading session details...</p>
                    </div>
                  ) : detailsError ? (
                    <div className="error-message">
                      <p>{detailsError}</p>
                      <button
                        className="btn btn-link"
                        onClick={() =>
                          selectedSessionDetails &&
                          handleViewDetails(selectedSessionDetails._id)
                        }
                      >
                        Try Again
                      </button>
                    </div>
                  ) : selectedSessionDetails ? (
                    <div className="session-details">
                      <div className="detail-row">
                        <span className="detail-label">Subject:</span>
                        <span className="detail-value">
                          {selectedSessionDetails.subject}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Tutor:</span>
                        <span className="detail-value">
                          {selectedSessionDetails.tutor?.name || 'Unknown'}
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
                          {
                            formatDateTime(
                              selectedSessionDetails.date,
                              selectedSessionDetails.startTime
                            ).split('at')[0]
                          }
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

                      {selectedSessionDetails.review && (
                        <div className="detail-row review-details">
                          <span className="detail-label">Review:</span>
                          <div className="detail-value">
                            <div className="stars">
                              {'★'.repeat(selectedSessionDetails.review.rating)}
                              {'☆'.repeat(
                                5 - selectedSessionDetails.review.rating
                              )}
                            </div>
                            <p>{selectedSessionDetails.review.review}</p>
                          </div>
                        </div>
                      )}

                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span
                          className={`detail-value status-badge ${selectedSessionDetails.status}`}
                        >
                          {selectedSessionDetails.status
                            .charAt(0)
                            .toUpperCase() +
                            selectedSessionDetails.status.slice(1)}
                        </span>
                      </div>
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
        </>
      )}
    </div>
  );
};

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
  REVIEWS: 'reviews',
  WISHLIST: 'wishlist',
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
      case SECTIONS.REVIEWS:
        return <ReviewsSystem />;
      case SECTIONS.WISHLIST:
        return <WishlistComponent />;
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
                className={activeSection === SECTIONS.WISHLIST ? 'active' : ''}
                onClick={() => setActiveSection(SECTIONS.WISHLIST)}
              >
                <span className="nav-icon">❤️</span>
                <span className="nav-label">My Wishlist</span>
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
