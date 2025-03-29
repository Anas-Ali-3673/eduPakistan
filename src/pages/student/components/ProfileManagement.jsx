import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import './ProfileManagement.css';

const ProfileManagement = () => {
  const { currentUser } = useAuth();

  return (
    <div className="profile-management">
      <h2>My Profile</h2>

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
            <button className="btn btn-primary">Edit Profile</button>
            <button className="btn btn-outlined">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
