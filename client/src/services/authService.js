import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const login = async (email, password) => {
  console.log('AuthService: Sending login request to:', API_BASE_URL + '/auth/login');
  console.log('AuthService: Login data:', { email, password: '***' });
  
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('AuthService: Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('AuthService: Login error:', error);
    console.error('AuthService: Error response:', error.response?.data);
    throw error;
  }
};

export const register = async (userData) => {
  console.log('AuthService: Sending registration request to:', API_BASE_URL + '/auth/register');
  console.log('AuthService: User data:', userData);
  
  try {
    const response = await api.post('/auth/register', userData);
    console.log('AuthService: Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('AuthService: Registration error:', error);
    console.error('AuthService: Error response:', error.response?.data);
    throw error;
  }
};

export const getCurrentUser = async (token) => {
  try {
    console.log('AuthService: Getting current user');
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('AuthService: Get current user response:', response.data);
    return response.data;
  } catch (error) {
    console.error('AuthService: Get current user error:', error);
    if (error.response) {
      console.error('AuthService: Error response data:', error.response.data);
    }
    throw error;
  }
};

export const forgotPassword = async (email) => {
  console.log('AuthService: Sending forgot password request to:', API_BASE_URL + '/auth/forgot-password');
  console.log('AuthService: Email:', email);
  
  try {
    const response = await api.post('/auth/forgot-password', { email });
    console.log('AuthService: Forgot password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('AuthService: Forgot password error:', error);
    console.error('AuthService: Error response:', error.response?.data);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  console.log('AuthService: Sending reset password request to:', API_BASE_URL + '/auth/reset-password');
  
  try {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    console.log('AuthService: Reset password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('AuthService: Reset password error:', error);
    console.error('AuthService: Error response:', error.response?.data);
    throw error;
  }
};

export const authService = {
  login,
  register,
  getCurrentUser,
  forgotPassword,
  resetPassword
};

export default api;
