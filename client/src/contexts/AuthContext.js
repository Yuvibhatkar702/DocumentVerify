import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    const { token, user: userData } = response;
    
    localStorage.setItem('token', token);
    setUser(userData);
    
    return response;
  };

  const register = async (name, email, password) => {
    const response = await apiRegister(name, email, password);
    const { token, user: userData } = response;
    
    localStorage.setItem('token', token);
    setUser(userData);
    
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
