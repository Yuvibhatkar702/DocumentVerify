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
          // Don't set user to maintain null state
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 400) {
        message = 'Please fill in all required fields correctly.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message?.includes('Network Error')) {
        message = 'Unable to connect to server. Please check your internet connection.';
      }
      
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiRegister(name, email, password);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.status === 400) {
        if (error.response.data?.errors) {
          // Handle validation errors with user-friendly messages
          const errors = error.response.data.errors;
          if (errors.some(err => err.msg?.includes('Password must contain'))) {
            message = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
          } else if (errors.some(err => err.msg?.includes('Name'))) {
            message = 'Name must be between 2 and 50 characters.';
          } else if (errors.some(err => err.msg?.includes('email'))) {
            message = 'Please provide a valid email address.';
          } else {
            message = errors.map(err => err.msg).join(' ');
          }
        } else if (error.response.data?.message?.includes('already exists')) {
          message = 'An account with this email already exists. Please try logging in instead.';
        } else {
          message = error.response.data?.message || 'Please fill in all fields correctly.';
        }
      } else if (error.message?.includes('Network Error')) {
        message = 'Unable to connect to server. Please check your internet connection.';
      }
      
      throw new Error(message);
    }
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
