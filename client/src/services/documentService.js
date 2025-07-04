import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:50011/api';

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
  try {
    console.log('=== FRONTEND UPLOAD START ===');
    console.log('DocumentService: Starting upload');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      instanceof: file instanceof File,
      instanceof_Blob: file instanceof Blob
    });
    console.log('Document type:', documentType);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    
    // Log form data contents
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`FormData ${key}:`, value);
      if (value instanceof File) {
        console.log(`  File details: name=${value.name}, size=${value.size}, type=${value.type}`);
      }
    }
    
    const token = localStorage.getItem('token');
    console.log('Auth token present:', !!token);
    console.log('Making request to:', `${API_BASE_URL}/documents/upload`);
    console.log('=== END FRONTEND UPLOAD DEBUG ===');
    
    const response = await api.post('/documents/upload', formData, {
      // Don't set Content-Type header - let browser set it automatically for FormData
      // This ensures proper boundary is set for multipart/form-data
      timeout: 30000, // 30 second timeout
    });
    
    console.log('Upload response:', response);
    return response;
  } catch (error) {
    console.error('DocumentService upload error:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const getDocumentById = async (id) => {
  return api.get(`/documents/${id}`);
};

export const verifyDocument = async (id) => {
  return api.post(`/documents/${id}/verify`);
};

export default api;
