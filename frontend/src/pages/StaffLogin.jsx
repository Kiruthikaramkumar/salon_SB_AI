import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const StaffLogin = () => {
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
          style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C), url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600') center/cover" }}
        >
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '40px', borderRadius: '20px' }}>
            <i className="fas fa-user-tie" style={{ fontSize: '4rem', color: '#fff', marginBottom: '20px' }}></i>
            <h2>Staff Portal</h2>
            <p>View your appointments and manage services</p>
          </div>
        </div>

        <div className="login-form-container">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <i className="fas fa-id-badge" style={{ fontSize: '3rem', color: '#D4AF37', marginBottom: '15px' }}></i>
            <h2>Staff Login</h2>
            <p className="subtitle">Access your work dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="staffName"><i className="fas fa-user"></i> Staff Name</label>
              <input 
                type="text" 
                id="staffName" 
                placeholder="Enter your name" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="staffPassword"><i className="fas fa-lock"></i> Password</label>
              <input 
                type="password" 
                id="staffPassword" 
                placeholder="Enter password"
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
                  <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i> Login as Staff
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
              <i className="fas fa-info-circle"></i> Enter your registered staff name
            </p>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link to="/login/admin" style={{ color: 'var(--gray)' }}>
              <i className="fas fa-user-shield"></i> Admin Login
            </Link>
            <Link to="/login/staff" style={{ color: 'var(--gold)', fontWeight: 600 }}>
              <i className="fas fa-user-tie"></i> Staff Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffLogin;
