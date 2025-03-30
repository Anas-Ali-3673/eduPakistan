import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentDashboard from './pages/student/dashboard';
import TutorDashboard from './pages/tutor/dashboard';
import AdminDashboard from './pages/admin/dashboard'; // Add this import
import SignInPage from './auth/signIn';
import SignUpPage from './auth/signup';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/home';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-dashboard"
            element={
              <ProtectedRoute requiredRole="tutor">
                <TutorDashboard />
              </ProtectedRoute>
            }
          />
          {/* Add new admin route */}
          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {/* This will redirect to the appropriate dashboard based on user role */}
                <RoleBasedRedirect />
              </ProtectedRoute>
            }
          />
          {/* Add other routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Helper component to redirect based on role
const RoleBasedRedirect = () => {
  const { currentUser } = useAuth();

  if (currentUser?.userType === 'student') {
    return <Navigate to="/student-dashboard" replace />;
  } else if (currentUser?.userType === 'tutor') {
    return <Navigate to="/tutor-dashboard" replace />;
  } else if (currentUser?.userType === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else {
    // Default fallback
    return <StudentDashboard />;
  }
};

export default App;
