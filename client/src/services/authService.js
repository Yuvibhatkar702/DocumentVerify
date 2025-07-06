import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:50011/api';

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
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default api;
