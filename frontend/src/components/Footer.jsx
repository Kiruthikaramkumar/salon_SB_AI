import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>Glow Beauty</h3>
            <p>Your premium destination for beauty and grooming services. Where style meets elegance.</p>
            <div className="social-links">
              <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#instagram" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#twitter" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#youtube" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/membership">Membership</Link>
            <Link to="/team">Our Team</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-col">
            <h3>Contact Us</h3>
            <p><i className="fas fa-map-marker-alt"></i> 123 Beauty Lane, Fashion Street, Mumbai 400001</p>
            <p><i className="fas fa-phone"></i> +91 9876543210</p>
            <p><i className="fas fa-envelope"></i> info@glowbeauty.com</p>
            <p><i className="fas fa-clock"></i> Mon-Sun: 9:00 AM - 9:00 PM</p>
          </div>
          <div className="footer-col">
            <h3>Services</h3>
            <Link to="/services">Haircut & Styling</Link>
            <Link to="/services">Bridal Makeup</Link>
            <Link to="/services">Hair Coloring</Link>
            <Link to="/services">Facial & Spa</Link>
            <Link to="/services">Beard Styling</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Glow Beauty Unisex Salon. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
