import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
    name: null,
  });
  const [loading, setLoading] = useState(true);

  // Sync state with localStorage on startup
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (isLoggedIn && role && name) {
      setUser({
        isLoggedIn: true,
        role,
        name,
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      
      if (data.success) {
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('isLoggedIn', 'true');
        
        setUser({
          isLoggedIn: true,
          role: data.role,
          name: data.name,
        });
        
        return { success: true, role: data.role };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login service error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Cannot connect to server. Make sure backend is running.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    
    setUser({
      isLoggedIn: false,
      role: null,
      name: null,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
