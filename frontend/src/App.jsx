import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Login from './components/login/Login.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { useAuthContext } from './hooks/useAuthContext.js';

function AppRoutes() {
  const { loading, isAuthenticated } = useAuthContext();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes key={isAuthenticated ? 'authenticated' : 'guest'}>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <StrictMode>
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </StrictMode>
  );
}

export default App;
