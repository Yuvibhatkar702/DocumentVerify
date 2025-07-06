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
          // First try to get user from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser && storedUser !== 'undefined') {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser && parsedUser.id) {
                setUser(parsedUser);
              }
            } catch (e) {
              console.log('Error parsing stored user:', e);
            }
          }
          
          // Then try to get current user from API
          const userData = await getCurrentUser(token);
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          // Don't set user to maintain null state
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (...args) => {
    try {
      // Handle both object format {email, password} and separate parameters
      let email, password;
      
      if (args.length === 1 && typeof args[0] === 'object') {
        // Object format: login({email, password})
        email = args[0].email;
        password = args[0].password;
      } else {
        // Separate parameters: login(email, password)
        email = args[0];
        password = args[1];
      }
      
      console.log('AuthContext: Login attempt for:', email);
      
      const response = await apiLogin(email, password);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('AuthContext: Login successful');
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

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      const { token, user: userInfo } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userInfo.id);
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      
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
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
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
