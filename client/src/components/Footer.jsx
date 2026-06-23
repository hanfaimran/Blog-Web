import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="brand-icon">✦</span> BlogWeb
            </Link>
            <p className="footer-description">
              A modern blogging platform built for creators. Share your stories with the world.
            </p>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Platform</h4>
            <Link to="/" className="footer-link">Browse Posts</Link>
            <Link to="/register" className="footer-link">Create Account</Link>
            <Link to="/login" className="footer-link">Sign In</Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Resources</h4>
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">API Reference</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BlogWeb. Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
