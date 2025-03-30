import React, { useState } from 'react';

const VerificationDetails = ({ tutor, onApprove, onReject, readOnly }) => {
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async () => {
    setActionLoading(true);
    await onApprove(comment);
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    await onReject(comment);
    setActionLoading(false);
  };

  return (
    <div className="verification-details">
      <h3>Tutor Details</h3>

      <div className="tutor-profile-header">
        <div className="tutor-profile-image">
          {tutor.profileImage ? (
            <img src={tutor.profileImage} alt={tutor.name} />
          ) : (
            <div className="large-avatar-placeholder">{tutor.name[0]}</div>
          )}
        </div>
        <div className="tutor-profile-info">
          <h4>{tutor.name}</h4>
          <p>{tutor.email}</p>
          <div className="verification-status">
            <span className={`status-badge ${tutor.verificationStatus}`}>
              {tutor.verificationStatus}
            </span>
            {tutor.verificationDate && (
              <span className="verification-date">
                {new Date(tutor.verificationDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="details-group">
        <h5>Personal Information</h5>
        <div className="detail-row">
          <span className="detail-label">Hourly Rate:</span>
          <span className="detail-value">
            {tutor.hourlyRate ? `PKR ${tutor.hourlyRate}` : 'Not specified'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Teaching Preference:</span>
          <span className="detail-value">
            {tutor.teachingPreference || 'Not specified'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Member Since:</span>
          <span className="detail-value">
            {new Date(tutor.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="details-group">
        <h5>Subjects</h5>
        {tutor.subjects && tutor.subjects.length > 0 ? (
          <div className="subjects-container">
            {tutor.subjects.map((subject, index) => (
              <span key={index} className="subject-tag">
                {subject}
              </span>
            ))}
          </div>
        ) : (
          <p>No subjects specified</p>
        )}
      </div>

      <div className="details-group">
        <h5>Qualifications</h5>
        {tutor.qualifications && tutor.qualifications.length > 0 ? (
          <ul className="qualifications-list">
            {tutor.qualifications.map((qualification, index) => (
              <li key={index}>{qualification}</li>
            ))}
          </ul>
        ) : (
          <p>No qualifications listed</p>
        )}
      </div>

      {tutor.verificationNotes && (
        <div className="details-group">
          <h5>Previous Verification Notes</h5>
          <div className="verification-notes">{tutor.verificationNotes}</div>
        </div>
      )}

      {!readOnly && (
        <div className="verification-actions">
          <div className="comment-section">
            <h5>Admin Comment</h5>
            <textarea
              className="comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              rows={3}
            ></textarea>
          </div>

          <div className="action-buttons">
            <button
              className={`btn btn-reject ${actionLoading ? 'loading' : ''}`}
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Reject Profile'}
            </button>
            <button
              className={`btn btn-approve ${actionLoading ? 'loading' : ''}`}
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Approve Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDetails;
