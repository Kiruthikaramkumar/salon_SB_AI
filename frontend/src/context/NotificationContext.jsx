import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const showNotification = useCallback((msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setActive(true);

    const timer = setTimeout(() => {
      setActive(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className={`notification-popup ${active ? 'active' : ''} ${isError ? 'error' : ''}`} style={{ transition: 'all 0.3s ease' }}>
        <div className="notification-icon">
          <i className={`fas fa-${isError ? 'times' : 'check'}`}></i>
        </div>
        <div className="notification-content">
          <h4>{isError ? 'Error!' : 'Success!'}</h4>
          <p>{message}</p>
        </div>
      </div>
    </NotificationContext.Provider>
  );
};
