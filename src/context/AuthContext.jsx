import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [isStudent, setIsStudent] = useState(true);
  const [isTutor, setIsTutor] = useState(false);
  const [loading, setLoading] = useState(false); 

  const login = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (user.userType === 'student') {
      setIsStudent(true);
      setIsTutor(false);
    } else if (user.userType === 'tutor') {
      setIsTutor(true);
      setIsStudent(false);
    }
  };

  const logout = () => {
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
