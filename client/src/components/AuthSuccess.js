import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUser } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token) {
      // Store token and redirect to dashboard
      localStorage.setItem('token', token);
      setToken(token);
      
      // Decode token to get user info (you might want to make an API call instead)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // You should make an API call to get full user details
        // For now, we'll just redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error processing token:', error);
        navigate('/login?error=invalid_token');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, setToken, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication</h2>
        <p className="text-gray-300">Please wait while we log you in...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
