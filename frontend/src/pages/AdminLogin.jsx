import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorText('');

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      showNotification('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setErrorText(res.message || 'Login failed');
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div 
          className="login-image" 
          style={{ background: "linear-gradient(135deg, #1a1a1a, #2d2d2d), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600') center/cover" }}
        >
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '40px', borderRadius: '20px' }}>
            <i className="fas fa-user-shield" style={{ fontSize: '4rem', color: '#D4AF37', marginBottom: '20px' }}></i>
            <h2>Admin Portal</h2>
            <p>Manage bookings, customers, and salon operations</p>
          </div>
        </div>

        <div className="login-form-container">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#D4AF37', marginBottom: '15px' }}></i>
            <h2>Admin Login</h2>
            <p className="subtitle">Access the admin dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="adminName"><i className="fas fa-user"></i> Admin Name</label>
              <input 
                type="text" 
                id="adminName" 
                placeholder="Enter admin name" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword"><i className="fas fa-lock"></i> Password</label>
              <input 
                type="password" 
                id="adminPassword" 
                placeholder="Enter password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn login-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i> Login as Admin
                </>
              )}
            </button>
          </form>

          {errorText && (
            <div style={{ color: '#f44336', textAlign: 'center', marginTop: '15px' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }}></i> {errorText}
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
              <i className="fas fa-info-circle"></i> Enter your admin credentials
            </p>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link to="/login/admin" style={{ color: 'var(--gold)', fontWeight: 600 }}>
              <i className="fas fa-user-shield"></i> Admin Login
            </Link>
            <Link to="/login/staff" style={{ color: 'var(--gray)' }}>
              <i className="fas fa-user-tie"></i> Staff Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
