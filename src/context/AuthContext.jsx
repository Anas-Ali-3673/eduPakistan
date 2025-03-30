import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStudent, setIsStudent] = useState(false); // Changed default to false
  const [isTutor, setIsTutor] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Set user data
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);

          // Check role - handle both role and userType fields for compatibility
          const userRole = parsedUser.role || parsedUser.userType;

          if (userRole === 'student') {
            setIsStudent(true);
            setIsTutor(false);
          } else if (userRole === 'tutor') {
            setIsTutor(true);
            setIsStudent(false);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = (user) => {
    // Ensure we handle both possible field names for the role
    const userRole = user.role || user.userType;

    // Create a normalized user object with consistent field names
    const normalizedUser = {
      ...user,
      role: userRole,
      userType: userRole,
    };

    // Update state
    setCurrentUser(normalizedUser);
    setIsAuthenticated(true);

    if (userRole === 'student') {
      setIsStudent(true);
      setIsTutor(false);
    } else if (userRole === 'tutor') {
      setIsTutor(true);
      setIsStudent(false);
    }

    // Store in localStorage with normalized fields
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsStudent(false);
    setIsTutor(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    isStudent,
    isTutor,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
