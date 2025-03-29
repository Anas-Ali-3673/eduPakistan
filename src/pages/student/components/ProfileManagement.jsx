import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './ProfileManagement.css';

const ProfileManagement = () => {
  const { currentUser, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditProfile = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
    });
    setIsEditing(true);
    setError(null);
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update the user in context with the new data
      login({
        ...currentUser,
        ...data.data,
      });

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setIsLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-management">
      <h2>My Profile</h2>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : ''}
          </div>
          <div className="profile-title">
            <h3>{currentUser?.name || ''}</h3>
            <span className="role-badge">Student</span>
          </div>
        </div>

        {!isEditing ? (
          <div className="profile-details">
            <div className="profile-item">
              <div className="profile-label">Name</div>
              <div className="profile-value">
                {currentUser?.name || 'Not provided'}
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-label">Email Address</div>
              <div className="profile-value">
                {currentUser?.email || 'Not provided'}
              </div>
            </div>

            <div className="profile-item">
              <div className="profile-label">Role</div>
              <div className="profile-value">Student</div>
            </div>

            <div className="profile-actions">
              <button className="btn btn-primary" onClick={handleEditProfile}>
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-details">
            <form onSubmit={handleSubmit} className="profile-edit-form">
              {error && <div className="error-message">{error}</div>}

              <div className="profile-form-group">
                <label htmlFor="name" className="profile-form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Enter your name"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="email" className="profile-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Enter your email"
                  readOnly
                />
                <small className="form-text">Email cannot be changed</small>
              </div>

              <div className="profile-actions profile-edit-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManagement;
