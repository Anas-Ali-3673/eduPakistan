import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './VerificationRequestForm.css';

const VerificationRequestForm = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    idProof: '',
    qualificationDocuments: [''],
    additionalInformation: '',
  });
  const [requestStatus, setRequestStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check if user already has a verification request
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/verification/status`,
          {
            headers: {
              Authorization: `Bearer ${currentUser?.token || ''}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRequestStatus(data.data);
        }
      } catch (err) {
        console.error('Error checking verification status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.token) {
      checkVerificationStatus();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDocumentChange = (index, value) => {
    const updatedDocs = [...formData.qualificationDocuments];
    updatedDocs[index] = value;
    setFormData({ ...formData, qualificationDocuments: updatedDocs });
  };

  const addDocumentField = () => {
    setFormData({
      ...formData,
      qualificationDocuments: [...formData.qualificationDocuments, ''],
    });
  };

  const removeDocumentField = (index) => {
    const updatedDocs = formData.qualificationDocuments.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, qualificationDocuments: updatedDocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token || ''}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to submit verification request'
        );
      }

      setSuccess(true);
      setRequestStatus(data.data);

      if (onComplete) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (err) {
      setError(
        err.message || 'An error occurred while submitting your request'
      );
      console.error('Error submitting verification:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If already verified or pending, show status
  if (requestStatus) {
    return (
      <div className="verification-status-container">
        <div className={`status-badge ${requestStatus.status}`}>
          {requestStatus.status.charAt(0).toUpperCase() +
            requestStatus.status.slice(1)}
        </div>

        <div className="status-details">
          <p>
            Your verification request was submitted on{' '}
            {new Date(requestStatus.submittedAt).toLocaleDateString()}
          </p>

          {requestStatus.status === 'approved' && (
            <div className="success-message">
              <p>Congratulations! Your profile has been verified.</p>
            </div>
          )}

          {requestStatus.status === 'rejected' && (
            <div className="rejection-details">
              <p>Your verification was rejected.</p>
              {requestStatus.adminComments && (
                <div className="admin-comments">
                  <h4>Admin Comments:</h4>
                  <p>{requestStatus.adminComments}</p>
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={() => setRequestStatus(null)}
              >
                Submit New Request
              </button>
            </div>
          )}

          {requestStatus.status === 'pending' && (
            <div className="pending-message">
              <p>
                Your verification is currently under review. We'll notify you
                once it's processed.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="verification-form-container">
      <h3>Tutor Verification</h3>
      <p>Complete this form to verify your identity and qualifications</p>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Verification request submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="verification-form">
        <div className="form-group">
          <label htmlFor="idProof">ID Proof (URL or document ID)*</label>
          <input
            type="text"
            id="idProof"
            name="idProof"
            value={formData.idProof}
            onChange={handleChange}
            placeholder="Link to your government ID proof"
            required
          />
          <small>
            Please provide a link to your uploaded ID proof document
          </small>
        </div>

        <div className="form-group">
          <label>Qualification Documents*</label>
          {formData.qualificationDocuments.map((doc, index) => (
            <div key={index} className="document-input">
              <input
                type="text"
                value={doc}
                onChange={(e) => handleDocumentChange(index, e.target.value)}
                placeholder="Link to qualification document"
                required
              />
              {formData.qualificationDocuments.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeDocumentField(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addDocumentField}>
            + Add Document
          </button>
          <small>
            Include links to degrees, certifications, or relevant qualifications
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="additionalInformation">Additional Information</label>
          <textarea
            id="additionalInformation"
            name="additionalInformation"
            value={formData.additionalInformation}
            onChange={handleChange}
            placeholder="Any additional information you want to share with the admin"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Verification Request'}
        </button>
      </form>
    </div>
  );
};

export default VerificationRequestForm;
