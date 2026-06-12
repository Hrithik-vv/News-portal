import React, { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newToken, userData) => {
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = (userData) => {
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Call this when a fetch returns 401/403 to auto-logout expired sessions
  const handleAuthError = useCallback((status) => {
    if (status === 401 || status === 403) {
      logout();
      return true; // signal that auth error was handled
    }
    return false;
  }, [logout]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateProfile, isAuthenticated, handleAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}
