import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InchargeDashboard from './pages/InchargeDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SearchTrack from './pages/SearchTrack';
import { Shield } from 'lucide-react';

// Protected Route wrapper for Role-Based Access Control (RBAC)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white">
        <Shield className="h-12 w-12 text-amber-500 animate-pulse mb-3" />
        <span className="text-sm font-semibold tracking-wider text-slate-300">डेटा लोड हो रहा है...</span>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect unauthorized user to their respective dashboard
    switch (profile.role) {
      case 'admin': return <Navigate to="/admin" replace />;
      case 'in_charge': return <Navigate to="/incharge" replace />;
      case 'employee': return <Navigate to="/employee" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// Root redirect handler based on authenticated user's role
const RootRedirect = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white">
        <Shield className="h-12 w-12 text-amber-500 animate-pulse mb-3" />
        <span className="text-sm font-semibold tracking-wider text-slate-300">डेटा लोड हो रहा है...</span>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  switch (profile.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'in_charge': return <Navigate to="/incharge" replace />;
    case 'employee': return <Navigate to="/employee" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/incharge" 
            element={
              <ProtectedRoute allowedRoles={['in_charge']}>
                <InchargeDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/employee" 
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/track" 
            element={
              <ProtectedRoute>
                <SearchTrack />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
