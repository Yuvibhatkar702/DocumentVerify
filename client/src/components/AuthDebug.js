import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

const AuthDebug = () => {
  const [authStatus, setAuthStatus] = useState('checking');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setAuthStatus('no-token');
      return;
    }

    // Parse token to get basic info (without verification)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        setAuthStatus('invalid-token');
        setTokenInfo({ error: 'Invalid token format' });
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      setTokenInfo({
        userId: payload.userId,
        exp: payload.exp,
        iat: payload.iat,
        expired: payload.exp * 1000 < Date.now()
      });

      // Try to verify token with server
      try {
        const response = await getCurrentUser(token);
        setUserInfo(response.data);
        setAuthStatus('authenticated');
      } catch (error) {
        console.error('Token verification failed:', error);
        setAuthStatus('token-invalid');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Token parsing failed:', error);
      setAuthStatus('invalid-token');
      setTokenInfo({ error: 'Token parsing failed' });
    }
  };

  const handleLogin = () => {
    // Navigate to login or show login modal
    window.location.href = '/login';
  };

  const getStatusColor = () => {
    switch (authStatus) {
      case 'authenticated': return '#10b981';
      case 'checking': return '#f59e0b';
      case 'no-token':
      case 'invalid-token':
      case 'token-invalid': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusMessage = () => {
    switch (authStatus) {
      case 'authenticated': return '✅ Authenticated and ready to upload';
      case 'checking': return '🔄 Checking authentication...';
      case 'no-token': return '❌ Not logged in - please log in to upload documents';
      case 'invalid-token': return '❌ Invalid token - please log in again';
      case 'token-invalid': return '❌ Token expired or invalid - please log in again';
      default: return '❓ Unknown status';
    }
  };

  return (
    <div style={{
      margin: '20px 0',
      padding: '15px',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }}>
      <h3 style={{ color: getStatusColor(), margin: '0 0 10px 0' }}>
        Authentication Status
      </h3>
      
      <p style={{ color: '#e5e7eb', margin: '0 0 15px 0' }}>
        {getStatusMessage()}
      </p>

      {tokenInfo && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px 0' }}>
            Token Information:
          </h4>
          <div style={{ 
            fontSize: '12px', 
            color: '#d1d5db',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '10px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            {tokenInfo.error ? (
              <p style={{ color: '#ef4444', margin: 0 }}>{tokenInfo.error}</p>
            ) : (
              <>
                <p style={{ margin: '0 0 5px 0' }}>User ID: {tokenInfo.userId}</p>
                <p style={{ margin: '0 0 5px 0' }}>
                  Issued: {new Date(tokenInfo.iat * 1000).toLocaleString()}
                </p>
                <p style={{ margin: '0 0 5px 0' }}>
                  Expires: {new Date(tokenInfo.exp * 1000).toLocaleString()}
                </p>
                <p style={{ 
                  margin: 0, 
                  color: tokenInfo.expired ? '#ef4444' : '#10b981' 
                }}>
                  Status: {tokenInfo.expired ? 'EXPIRED' : 'VALID'}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {userInfo && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px 0' }}>
            User Information:
          </h4>
          <div style={{ 
            fontSize: '12px', 
            color: '#d1d5db',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '10px',
            borderRadius: '4px'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>Name: {userInfo.name}</p>
            <p style={{ margin: '0 0 5px 0' }}>Email: {userInfo.email}</p>
            <p style={{ margin: 0 }}>Role: {userInfo.role}</p>
          </div>
        </div>
      )}

      {authStatus !== 'authenticated' && authStatus !== 'checking' && (
        <button
          onClick={handleLogin}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Log In
        </button>
      )}

      <button
        onClick={checkAuthStatus}
        style={{
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#e5e7eb',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          marginLeft: '10px'
        }}
      >
        Refresh Status
      </button>
    </div>
  );
};

export default AuthDebug;
