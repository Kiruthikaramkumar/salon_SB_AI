import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '50px 20px',
      width: '100%',
      minHeight: '200px'
    }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--gold)', marginBottom: '15px' }}></i>
      <p style={{ color: 'var(--gray)', fontWeight: '500' }}>{message}</p>
    </div>
  );
};

export default Loader;
