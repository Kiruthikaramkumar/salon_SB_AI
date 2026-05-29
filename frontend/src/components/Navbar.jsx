import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MembershipModal from './MembershipModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return 'active';
    if (path !== '/' && location.pathname.startsWith(path)) return 'active';
    return '';
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="logo">
          Glow <span>Beauty</span>
        </Link>
        
        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className={isActive('/')}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/services" className={isActive('/services')}>
              Services
            </Link>
          </li>
          <li>
            <Link to="/membership" className={isActive('/membership')}>
              Membership
            </Link>
          </li>
          <li>
            <Link to="/team" className={isActive('/team')}>
              Our Team
            </Link>
          </li>
          {user.isLoggedIn ? (
            <>
              <li>
                <Link to="/dashboard" className={isActive('/dashboard')}>
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#logout" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login"
                  className={isActive('/login')}
                >
                  Login
                </Link>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMembershipModalOpen(true); }} 
                  className="cursor-pointer z-50 relative"
                >
                  Register
                </a>
              </li>
              <li>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMembershipModalOpen(true); }} 
                  className="btn cursor-pointer z-50 relative"
                  style={{ padding: '8px 24px', fontSize: '14px', marginLeft: '10px' }}
                >
                  Buy Membership
                </button>
              </li>
            </>
          )}
        </ul>

        <div 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <MembershipModal 
        isOpen={isMembershipModalOpen} 
        onClose={() => setIsMembershipModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
