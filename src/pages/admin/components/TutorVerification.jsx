import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import VerificationDetails from './VerificationDetails';

const TutorVerification = () => {
  const { currentUser } = useAuth();
  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchTutors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5000/api/users?status=${filter}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tutors');
        }

        const data = await response.json();
        setTutors(data.data || []);

        // Fetch verification stats
        const statsResponse = await fetch(
          'http://localhost:5000/api/admin/verification-stats',
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }
      } catch (err) {
        console.error('Error fetching tutors:', err);
        setError('Failed to load tutor data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.token) {
      fetchTutors();
    }
  }, [currentUser, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedTutor(null);
  };

  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
  };

  const handleVerificationAction = async (tutorId, action, comment = '') => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/tutors/${tutorId}/verify`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({
            action, // 'approve' or 'reject'
            comment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} tutor`);
      }

      // Update local state
      setTutors((prevTutors) =>
        prevTutors.filter((tutor) => tutor._id !== tutorId)
      );
      setSelectedTutor(null);

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        [filter]: prevStats[filter] - 1,
        [action === 'approve' ? 'approved' : 'rejected']:
          prevStats[action === 'approve' ? 'approved' : 'rejected'] + 1,
      }));
    } catch (err) {
      console.error(`Error ${action}ing tutor:`, err);
      alert(`Failed to ${action} tutor. Please try again.`);
    }
  };

  return (
    <div className="admin-section verification-section">
      <div className="verification-stats">
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tutors</div>
        </div>
      </div>

      <div className="verification-container">
        <div className="verification-list-container">
          <div className="verification-filters">
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => handleFilterChange('approved')}
            >
              Approved
            </button>
            <button
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => handleFilterChange('rejected')}
            >
              Rejected
            </button>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading tutors...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : tutors.length > 0 ? (
            <div className="tutors-list">
              {tutors.map((tutor) => (
                <div
                  key={tutor._id}
                  className={`tutor-item ${
                    selectedTutor && selectedTutor._id === tutor._id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => handleTutorSelect(tutor)}
                >
                  <div className="tutor-avatar">
                    {tutor.profileImage ? (
                      <img src={tutor.profileImage} alt={tutor.name} />
                    ) : (
                      <div className="avatar-placeholder">{tutor.name[0]}</div>
                    )}
                  </div>
                  <div className="tutor-info">
                    <h4>{tutor.name}</h4>
                    <p>{tutor.email}</p>
                    <div className="tutor-subjects">
                      {tutor.subjects &&
                        tutor.subjects.slice(0, 3).map((subject, i) => (
                          <span key={i} className="subject-tag">
                            {subject}
                          </span>
                        ))}
                      {tutor.subjects && tutor.subjects.length > 3 && (
                        <span className="more-subjects">
                          +{tutor.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="verification-status">
                      <span
                        className={`status-badge ${tutor.verificationStatus}`}
                      >
                        {tutor.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No tutors found with the selected filter.</p>
            </div>
          )}
        </div>

        {selectedTutor && (
          <VerificationDetails
            tutor={selectedTutor}
            onApprove={(comment) =>
              handleVerificationAction(selectedTutor._id, 'approve', comment)
            }
            onReject={(comment) =>
              handleVerificationAction(selectedTutor._id, 'reject', comment)
            }
            readOnly={filter !== 'pending'}
          />
        )}
      </div>
    </div>
  );
};

export default TutorVerification;
