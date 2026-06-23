import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects admin-only routes.
 * Redirects non-admin users to the dashboard.
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, initialCheckDone } = useAuth();

  if (!initialCheckDone) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
