import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import student_tutorImage from '../../assets/student-tutor.jpg';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Header/Navigation */}
      <header className="header">
        <div className="logo">
          <h1>EduConnect Pakistan</h1>
        </div>
        <nav className="nav">
          <ul>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#how-it-works">How it Works</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <Link to="/signin" className="btn btn-outlined">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Connect with Qualified Tutors in Pakistan</h1>
          <p>
            Find the perfect tutor to help you achieve your educational goals.
            EduConnect Pakistan makes it easy to search, book, and manage
            tutoring sessions.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <a href="#features" className="btn btn-secondary btn-large">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img src={student_tutorImage} alt="Students and tutors connected" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find the Perfect Tutor</h3>
            <p>
              Search and filter tutors based on subject, location, price, and
              availability.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Session Booking</h3>
            <p>
              Book sessions with your preferred tutors at times that work for
              you.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Session Management</h3>
            <p>Manage all your upcoming and past sessions in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Review and Rate</h3>
            <p>Share your feedback and help others find great tutors.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">❤️</div>
            <h3>Save Favorites</h3>
            <p>Keep a wishlist of your favorite tutors for future sessions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Become a Tutor</h3>
            <p>Share your knowledge and earn by becoming a verified tutor.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <h2>How EduConnect Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up as a student or tutor and complete your profile.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Find or Become a Tutor</h3>
            <p>
              Search for tutors or create your tutor profile to be discovered.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Book Sessions</h3>
            <p>Schedule sessions at convenient times for both parties.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Learn and Grow</h3>
            <p>Attend sessions, gain knowledge, and track your progress.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <h2>About EduConnect Pakistan</h2>
        <p>
          EduConnect Pakistan is a platform dedicated to improving education
          access across Pakistan by connecting students with qualified tutors.
          Our mission is to make quality education accessible to everyone,
          regardless of location.
        </p>
        <div className="about-stats">
          <div className="stat">
            <h3>1000+</h3>
            <p>Verified Tutors</p>
          </div>
          <div className="stat">
            <h3>5000+</h3>
            <p>Happy Students</p>
          </div>
          <div className="stat">
            <h3>20+</h3>
            <p>Subjects Covered</p>
          </div>
          <div className="stat">
            <h3>50+</h3>
            <p>Cities</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>EduConnect Pakistan</h2>
            <p>Connecting students with qualified tutors</p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#how-it-works">How it Works</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <Link to="/signin">Sign In</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </ul>
          </div>
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p>Email: info@educonnect.pk</p>
            <p>Phone: +92-123-4567890</p>
            <div className="social-icons">
              <a href="#" className="social-icon">
                Facebook
              </a>
              <a href="#" className="social-icon">
                Twitter
              </a>
              <a href="#" className="social-icon">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 EduConnect Pakistan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
