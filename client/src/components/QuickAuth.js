import React, { useState } from 'react';
import { login, register } from '../services/authService';

const QuickAuth = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: 'test@example.com',
    password: 'password123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (mode === 'register') {
        response = await register(formData.name, formData.email, formData.password);
      } else {
        response = await login(formData.email, formData.password);
      }

      // Store token
      localStorage.setItem('token', response.token);
      
      console.log('Authentication successful:', response);
      
      if (onAuthSuccess) {
        onAuthSuccess(response);
      }
      
      // Refresh page to update auth state
      window.location.reload();
      
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.response?.data?.message || error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = () => {
    // Set the test token directly
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzVkMTIzNDU2Nzg5MGFiY2RlZjEyMzQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzUxNTUyNjM0LCJleHAiOjE3NTE2MzkwMzR9.pCbMnLYiET6YpsBz8WgXbbl7f8-B244k2jPyDxhYpo8";
    localStorage.setItem('token', testToken);
    console.log('Test token set successfully');
    window.location.reload();
  };

  return (
    <div style={{
      margin: '20px 0',
      padding: '20px',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    }}>
      <h3 style={{ color: '#3b82f6', margin: '0 0 15px 0' }}>
        🔐 Quick Authentication
      </h3>

      {/* Quick Test Button */}
      <button
        onClick={handleQuickTest}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '15px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        🚀 Use Test Token (Quick Fix)
      </button>

      <div style={{ 
        textAlign: 'center', 
        margin: '15px 0',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        OR
      </div>

      {/* Mode Toggle */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '15px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setMode('login')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: mode === 'login' ? '#3b82f6' : 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: mode === 'register' ? '#3b82f6' : 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#fecaca',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
        </button>
      </form>

      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        Pre-filled with test credentials for easy testing
      </div>
    </div>
  );
};

export default QuickAuth;
