import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadDocument = async (file, documentType) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDocuments = async () => {
  return api.get('/documents');
};

export const getDocumentById = async (id) => {
  return api.get(`/documents/${id}`);
};

export const verifyDocument = async (id) => {
  return api.post(`/documents/${id}/verify`);
};

export default api;
