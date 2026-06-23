import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-text">BlogWeb</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/editor" className="nav-link nav-link-cta">
                <span>+</span> Write
              </Link>
              {user?.role === 'admin' && (
                <div className="nav-dropdown">
                  <span className="nav-link">Admin ▾</span>
                  <div className="dropdown-menu">
                    <Link to="/admin/blogs" className="dropdown-item">All Posts</Link>
                    <Link to="/admin/users" className="dropdown-item">Users</Link>
                  </div>
                </div>
              )}
              <div className="nav-user">
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="nav-dropdown">
                  <span className="user-name">{user?.name}</span>
                  <div className="dropdown-menu dropdown-right">
                    <span className="dropdown-label">{user?.email}</span>
                    <span className="dropdown-label role-badge">{user?.role}</span>
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-link-cta">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
