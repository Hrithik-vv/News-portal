import React, { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext, AuthProvider, API_BASE_URL } from './context/AuthContext';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// Import Pages (to be created)
import Home from './pages/Home';
import CategoryFeed from './pages/CategoryFeed';
import SingleArticle from './pages/SingleArticle';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminSecurity from './pages/AdminSecurity';
import AdminSignOut from './pages/AdminSignOut';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryFeed />} />
          <Route path="/news/:id" element={<SingleArticle />} />
          
          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/profile" 
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/security" 
            element={
              <ProtectedRoute>
                <AdminSecurity />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/signout" 
            element={
              <ProtectedRoute>
                <AdminSignOut />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
