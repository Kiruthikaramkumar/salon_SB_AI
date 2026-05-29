import React from 'react';
import { Link } from 'react-router-dom';

const LoginChoice = () => {
  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-image">
          <h2>Welcome!</h2>
          <p>Select your role to access the dashboard</p>
          <i className="fas fa-spa" style={{ fontSize: '4rem', marginBottom: '20px' }}></i>
        </div>
        <div 
          className="login-form-container" 
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <i className="fas fa-users-cog" style={{ fontSize: '3rem', color: '#D4AF37', marginBottom: '15px' }}></i>
            <h2>Select Login Type</h2>
            <p className="subtitle">Choose your role to continue</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Link to="/login/admin" className="btn" style={{ textAlign: 'center', padding: '25px', display: 'block' }}>
              <i className="fas fa-user-shield" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
              <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>Admin Login</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '5px' }}>Manage bookings & customers</div>
            </Link>
            
            <Link 
              to="/login/staff" 
              className="btn btn-outline" 
              style={{ textAlign: 'center', padding: '25px', borderColor: '#D4AF37', color: '#D4AF37', display: 'block' }}
            >
              <i className="fas fa-user-tie" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
              <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>Staff Login</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '5px' }}>View assigned services</div>
            </Link>
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--gold)' }}>
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginChoice;
