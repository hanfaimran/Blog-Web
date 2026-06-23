import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects routes that require authentication.
 * Redirects to /login if not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialCheckDone } = useAuth();
  const location = useLocation();

  if (!initialCheckDone) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
