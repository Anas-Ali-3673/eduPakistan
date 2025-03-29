import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './TutorSearch.css';

const TutorSearch = () => {
  const { currentUser } = useAuth();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState('');

  // Modal state
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch tutors on component mount
  useEffect(() => {
    fetchTutors();
  }, []);

  // Function to fetch tutors with applied filters
  const fetchTutors = async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let queryParams = new URLSearchParams();
      queryParams.append('role', 'tutor');

      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.location) queryParams.append('location', filters.location);
      if (
        filters.priceRange &&
        filters.priceRange.min &&
        filters.priceRange.max
      ) {
        queryParams.append(
          'priceRange',
          `${filters.priceRange.min}-${filters.priceRange.max}`
        );
      }
      if (filters.rating) queryParams.append('rating', filters.rating);

      const response = await fetch(
        `http://localhost:5000/api/users?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }

      const data = await response.json();

      if (data.status === 'success') {
        setTutors(data.data);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching tutors');
      console.error('Error fetching tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();

    const filters = {
      subject: selectedSubject,
      location: selectedLocation,
      priceRange: priceRange.min && priceRange.max ? priceRange : null,
      rating: selectedRating,
    };

    // First fetch from API with filters
    await fetchTutors(filters);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedLocation('');
    setPriceRange({ min: '', max: '' });
    setSelectedRating('');
    fetchTutors();
  };

  // Handle view tutor profile
  const handleViewProfile = (tutor) => {
    setSelectedTutor(tutor);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle booking session
  const handleBookSession = (tutorId) => {
    console.log(`Booking session with tutor ID: ${tutorId}`);
  };

  // Add sort change handler
  const handleSortChange = (e) => {
    // Force a re-render with new sort
    setTutors([...tutors]);
  };

  // Filter tutors by search term and other filters locally
  const filteredTutors = tutors
    .filter((tutor) => {
      // Search term filter
      const matchesSearch =
        !searchTerm ||
        tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects?.some((subject) =>
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Subject filter
      const matchesSubject =
        !selectedSubject ||
        tutor.subjects?.some(
          (subject) => subject.toLowerCase() === selectedSubject.toLowerCase()
        );

      // Location filter
      const matchesLocation =
        !selectedLocation ||
        tutor.location?.toLowerCase() === selectedLocation.toLowerCase();

      // Price range filter
      const matchesPriceRange =
        (!priceRange.min && !priceRange.max) ||
        (tutor.hourlyRate &&
          (!priceRange.min || tutor.hourlyRate >= parseFloat(priceRange.min)) &&
          (!priceRange.max || tutor.hourlyRate <= parseFloat(priceRange.max)));

      // Rating filter
      const matchesRating =
        !selectedRating ||
        (tutor.rating && tutor.rating >= parseFloat(selectedRating));

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLocation &&
        matchesPriceRange &&
        matchesRating
      );
    })
    .sort((a, b) => {
      // Sort results based on selected sorting option
      const sortSelect = document.querySelector('.results-sort select');
      const sortValue = sortSelect?.value || 'rating';

      switch (sortValue) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'priceAsc':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case 'priceDesc':
          return (b.hourlyRate || 0) - (a.hourlyRate || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="dashboard-section tutor-search-container">
      <div className="search-header">
        <h2>Find Your Perfect Tutor</h2>
        <p className="search-subtitle">
          Connect with qualified tutors across Pakistan to achieve your
          educational goals
        </p>
      </div>

      <div className="search-panel">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search tutors by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <form onSubmit={handleSearch} className="filters-container">
          <h4 className="filter-heading">Filter Tutors</h4>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="english">English</option>
                <option value="computer_science">Computer Science</option>
                <option value="urdu">Urdu</option>
                <option value="islamiat">Islamic Studies</option>
                <option value="social_studies">Social Studies</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="karachi">Karachi</option>
                <option value="lahore">Lahore</option>
                <option value="islamabad">Islamabad</option>
                <option value="rawalpindi">Rawalpindi</option>
                <option value="peshawar">Peshawar</option>
                <option value="quetta">Quetta</option>
                <option value="multan">Multan</option>
                <option value="faisalabad">Faisalabad</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range (PKR/hr)</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  min={priceRange.min || '0'}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Minimum Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              <span className="btn-icon">🔍</span> Apply Filters
            </button>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={handleResetFilters}
            >
              <span className="btn-icon">↺</span> Reset Filters
            </button>
          </div>
        </form>
      </div>

      <div className="tutor-results-container">
        <div className="results-header">
          <h3 className="results-title">
            {loading
              ? 'Finding tutors...'
              : `Found ${filteredTutors.length} tutors${
                  selectedSubject ? ` in ${selectedSubject}` : ''
                }`}
          </h3>
          {!loading && filteredTutors.length > 0 && (
            <div className="results-sort">
              <label>Sort by:</label>
              <select onChange={handleSortChange}>
                <option value="rating">Rating (High to Low)</option>
                <option value="priceAsc">Price (Low to High)</option>
                <option value="priceDesc">Price (High to Low)</option>
              </select>
            </div>
          )}
        </div>

        <div className="tutor-results">
          {loading ? (
            <div className="loading-indicator">
              <div className="loader"></div>
              <p>Discovering the perfect tutors for you...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredTutors.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No tutors found matching your criteria.</h3>
              <p>
                Try adjusting your filters or search term to find more tutors.
              </p>
              <button className="btn-reset-all" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="tutor-cards">
              {filteredTutors.map((tutor) => (
                <div key={tutor._id} className="tutor-card">
                  <div className="tutor-card-header">
                    <div className="tutor-image">
                      {tutor.profileImage ? (
                        <img
                          src={tutor.profileImage}
                          alt={tutor.name || 'Tutor'}
                          loading="lazy"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {tutor.name
                            ? tutor.name.charAt(0).toUpperCase()
                            : 'T'}
                        </div>
                      )}
                    </div>
                    {tutor.rating && (
                      <div className="tutor-rating-badge">
                        <span className="rating-star">★</span>
                        <span>{tutor.rating.toFixed(1) || 'N/A'}</span>
                      </div>
                    )}
                  </div>

                  <div className="tutor-info">
                    <h4 className="tutor-name">{tutor.name || 'Tutor'}</h4>

                    <div className="tutor-meta">
                      {tutor.qualification && (
                        <div className="tutor-qualification">
                          <span className="meta-icon">🎓</span>
                          <span>{tutor.qualification}</span>
                        </div>
                      )}

                      {tutor.location && (
                        <div className="tutor-location">
                          <span className="meta-icon">📍</span>
                          <span>{tutor.location}</span>
                        </div>
                      )}
                    </div>

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
                          <span className="no-subjects">
                            No subjects listed
                          </span>
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
                      className="btn-view-profile"
                      onClick={() => handleViewProfile(tutor)}
                    >
                      View Profile
                    </button>
                    <button
                      className="btn-book-session"
                      onClick={() => handleBookSession(tutor._id)}
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tutor Details Modal */}
      {showModal && selectedTutor && (
        <div className="tutor-details-modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              &times;
            </button>

            <div className="modal-header">
              <div className="modal-tutor-image">
                {selectedTutor.profileImage ? (
                  <img
                    src={selectedTutor.profileImage}
                    alt={selectedTutor.name}
                  />
                ) : (
                  <div className="avatar-placeholder large">
                    {selectedTutor.name
                      ? selectedTutor.name.charAt(0).toUpperCase()
                      : 'T'}
                  </div>
                )}
              </div>

              <div className="modal-tutor-primary-info">
                <h3>{selectedTutor.name || 'Tutor'}</h3>
                <div className="modal-tutor-meta">
                  {selectedTutor.qualification && (
                    <div className="modal-qualification">
                      <span className="meta-icon">🎓</span>
                      <span>{selectedTutor.qualification}</span>
                    </div>
                  )}
                  {selectedTutor.location && (
                    <div className="modal-location">
                      <span className="meta-icon">📍</span>
                      <span>{selectedTutor.location}</span>
                    </div>
                  )}
                </div>
                <div className="modal-tutor-rating">
                  <div className="stars modal-stars">
                    {'★'.repeat(Math.floor(selectedTutor.rating || 0))}
                    {'☆'.repeat(5 - Math.floor(selectedTutor.rating || 0))}
                  </div>
                  <span className="rating-value">
                    {selectedTutor.rating || 'No ratings yet'}
                  </span>
                  <span className="reviews-count">
                    ({selectedTutor.reviewsCount || '0'} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h4>About</h4>
                <p>
                  {selectedTutor.bio ||
                    'No biography information available for this tutor.'}
                </p>
              </div>

              <div className="info-section">
                <h4>Subjects</h4>
                <div className="modal-subjects">
                  {selectedTutor.subjects &&
                  selectedTutor.subjects.length > 0 ? (
                    selectedTutor.subjects.map((subject, index) => (
                      <span key={index} className="subject-tag">
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p>No subjects listed</p>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h4>Teaching Experience</h4>
                <p>
                  {selectedTutor.experience ||
                    'Experience information not provided.'}
                </p>
              </div>

              <div className="info-section">
                <h4>Price</h4>
                <p className="modal-price">
                  {selectedTutor.hourlyRate
                    ? `PKR ${selectedTutor.hourlyRate} per hour`
                    : 'Hourly rate not specified'}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-save-tutor">
                <span className="btn-icon">❤️</span> Save to Wishlist
              </button>
              <button
                className="btn btn-primary btn-book-now"
                onClick={() => handleBookSession(selectedTutor._id)}
              >
                <span className="btn-icon">📝</span> Book a Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorSearch;
