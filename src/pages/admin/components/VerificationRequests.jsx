import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './VerificationRequests.css';

const VerificationRequests = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  // Review form state
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    const fetchVerificationRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch verification requests with the selected filter
        const response = await fetch(
          `http://localhost:5000/api/verification${
            filter !== 'all' ? `?status=${filter}` : ''
          }`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch verification requests');
        }

        const data = await response.json();
        setRequests(data.data || []);

        // Calculate statistics from the data
        const pendingCount = (data.data || []).filter(
          (req) => req.status === 'pending'
        ).length;
        const approvedCount = (data.data || []).filter(
          (req) => req.status === 'approved'
        ).length;
        const rejectedCount = (data.data || []).filter(
          (req) => req.status === 'rejected'
        ).length;

        setStats({
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: (data.data || []).length,
        });
      } catch (err) {
        console.error('Error fetching verification requests:', err);
        setError(
          'Failed to load verification requests. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.token) {
      fetchVerificationRequests();
    }
  }, [currentUser, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedRequest(null);
    setAdminComment('');
    setActionSuccess(null);
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setActionSuccess(null);
  };

  const handleReviewAction = async (action) => {
    if (!selectedRequest) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/verification/${selectedRequest._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({
            status: action,
            adminComments: adminComment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} verification request`);
      }

      // Update requests list after successful action
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req._id !== selectedRequest._id)
      );

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        [filter]: Math.max(0, prevStats[filter] - 1),
        [action]: prevStats[action] + 1,
      }));

      setActionSuccess(
        `Request has been ${
          action === 'approved' ? 'approved' : 'rejected'
        } successfully`
      );

      // Reset selected request after a short delay
      setTimeout(() => {
        setSelectedRequest(null);
        setActionSuccess(null);
      }, 2000);
    } catch (err) {
      console.error(`Error ${action}ing verification request:`, err);
      setError(err.message || `Failed to ${action} request. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderRequestDetails = () => {
    if (!selectedRequest) {
      return (
        <div className="details-placeholder">
          <p>Select a verification request to view details</p>
        </div>
      );
    }

    return (
      <div className="verification-request-details">
        {actionSuccess && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{actionSuccess}</p>
          </div>
        )}

        <h3>Verification Request Details</h3>

        <div className="tutor-info-section">
          <div className="tutor-profile-header">
            <div className="tutor-avatar">
              {selectedRequest.tutor.profileImage ? (
                <img
                  src={selectedRequest.tutor.profileImage}
                  alt={selectedRequest.tutor.name}
                />
              ) : (
                <div className="avatar-placeholder large">
                  {selectedRequest.tutor.name
                    ? selectedRequest.tutor.name.charAt(0).toUpperCase()
                    : '?'}
                </div>
              )}
            </div>
            <div className="tutor-basic-info">
              <h4>{selectedRequest.tutor.name}</h4>
              <p>{selectedRequest.tutor.email}</p>
              <span className="request-status-badge">
                {selectedRequest.status}
              </span>
            </div>
          </div>
        </div>

        <div className="request-section">
          <h4>ID Proof</h4>
          <div className="document-link">
            <a
              href={selectedRequest.idProof}
              target="_blank"
              rel="noopener noreferrer"
            >
              View ID Document
            </a>
          </div>
        </div>

        <div className="request-section">
          <h4>Qualification Documents</h4>
          {selectedRequest.qualificationDocuments &&
          selectedRequest.qualificationDocuments.length > 0 ? (
            <ul className="documents-list">
              {selectedRequest.qualificationDocuments.map((doc, index) => (
                <li key={index}>
                  <a href={doc} target="_blank" rel="noopener noreferrer">
                    Document {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No qualification documents provided</p>
          )}
        </div>

        {selectedRequest.additionalInformation && (
          <div className="request-section">
            <h4>Additional Information</h4>
            <p className="additional-info">
              {selectedRequest.additionalInformation}
            </p>
          </div>
        )}

        <div className="request-section">
          <h4>Submission Date</h4>
          <p>{new Date(selectedRequest.submittedAt).toLocaleString()}</p>
        </div>

        {selectedRequest.status === 'pending' && (
          <div className="admin-actions">
            <div className="comment-section">
              <h4>Admin Comments</h4>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add comments (optional)"
                rows={3}
              />
            </div>

            <div className="action-buttons">
              <button
                className="btn-reject"
                onClick={() => handleReviewAction('rejected')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Reject Request'}
              </button>
              <button
                className="btn-approve"
                onClick={() => handleReviewAction('approved')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Approve Request'}
              </button>
            </div>
          </div>
        )}

        {selectedRequest.status !== 'pending' &&
          selectedRequest.adminComments && (
            <div className="request-section">
              <h4>Admin Comments</h4>
              <p className="admin-comments">{selectedRequest.adminComments}</p>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="verification-requests-container">
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
          <div className="stat-label">Total</div>
        </div>
      </div>

      <div className="verification-content">
        <div className="requests-list-container">
          <div className="filters-header">
            <h3>Verification Requests</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => handleFilterChange('pending')}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${
                  filter === 'approved' ? 'active' : ''
                }`}
                onClick={() => handleFilterChange('approved')}
              >
                Approved
              </button>
              <button
                className={`filter-btn ${
                  filter === 'rejected' ? 'active' : ''
                }`}
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
          </div>

          <div className="requests-list">
            {isLoading ? (
              <div className="loading-indicator">
                <div className="loader"></div>
                <p>Loading verification requests...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : requests.length === 0 ? (
              <div className="empty-state">
                <p>
                  No {filter !== 'all' ? filter : ''} verification requests
                  found.
                </p>
              </div>
            ) : (
              <ul className="requests-items">
                {requests.map((request) => (
                  <li
                    key={request._id}
                    className={`request-item ${
                      selectedRequest && selectedRequest._id === request._id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleRequestSelect(request)}
                  >
                    <div className="request-item-avatar">
                      {request.tutor.profileImage ? (
                        <img
                          src={request.tutor.profileImage}
                          alt={request.tutor.name}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {request.tutor.name
                            ? request.tutor.name.charAt(0).toUpperCase()
                            : '?'}
                        </div>
                      )}
                    </div>
                    <div className="request-item-info">
                      <h4>{request.tutor.name}</h4>
                      <p className="request-date">
                        Submitted:{' '}
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="request-details-container">
          {renderRequestDetails()}
        </div>
      </div>
    </div>
  );
};

export default VerificationRequests;
