import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './TutorSearch.css';
import './Wishlist.css';

const WishlistComponent = () => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/wishlists', {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();

      if (data.status === 'success') {
        setWishlist(data.data.tutors || []);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching your wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeTutorFromWishlist = async (tutorId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/wishlists/${tutorId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove tutor from wishlist');
      }

      const data = await response.json();

      if (data.status === 'success') {
        // Update the local state
        setWishlist(data.data.tutors || []);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      alert(
        err.message || 'An error occurred while removing tutor from wishlist'
      );
      console.error('Error removing tutor from wishlist:', err);
    }
  };

  const handleBookSession = (tutorId) => {
    // Redirect to tutor search with preselected tutor
    window.location.href = `/student/dashboard?tab=tutors&tutorId=${tutorId}`;
  };

  return (
    <div className="dashboard-section wishlist-container">
      <h3>My Saved Tutors</h3>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your wishlist...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="empty-state">
          <h3>Your wishlist is empty</h3>
          <p>You haven't saved any tutors to your wishlist yet.</p>
          <p>Browse our tutors and add your favorites here for quick access.</p>
        </div>
      ) : (
        <div className="tutor-cards">
          {wishlist.map((tutor) => (
            <div key={tutor._id} className="tutor-card">
              <div className="tutor-card-header">
                <div className="tutor-image">
                  {tutor.profilePicture ? (
                    <img
                      src={tutor.profilePicture}
                      alt={tutor.name || 'Tutor'}
                      loading="lazy"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                </div>
                {tutor.avgRating && (
                  <div className="tutor-rating-badge">
                    <span className="rating-star">★</span>
                    <span>{tutor.avgRating.toFixed(1) || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="tutor-info">
                <h4 className="tutor-name">{tutor.name || 'Tutor'}</h4>

                <div className="tutor-subjects-container">
                  <span className="subjects-label">Teaches:</span>
                  <div className="tutor-subjects">
                    {tutor.subjects && tutor.subjects.length > 0 ? (
                      tutor.subjects.slice(0, 3).map((subject, index) => (
                        <span key={index} className="subject-tag">
                          {subject}
                        </span>
                      ))
                    ) : (
                      <span className="no-subjects">No subjects listed</span>
                    )}
                    {tutor.subjects && tutor.subjects.length > 3 && (
                      <span className="subject-tag">
                        +{tutor.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="tutor-pricing">
                  <span className="price-label">Hourly Rate:</span>
                  <span className="price-value">
                    {tutor.hourlyRate
                      ? `PKR ${tutor.hourlyRate}`
                      : 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="tutor-actions">
                <button
                  className="btn-book-session"
                  onClick={() => handleBookSession(tutor._id)}
                >
                  Book Session
                </button>
                <button
                  className="btn-remove-wishlist"
                  onClick={() => removeTutorFromWishlist(tutor._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistComponent;
