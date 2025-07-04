// Register Page – Styled to match animated LandingPage with enhancements

import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    // Check password complexity with more specific messages
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter (a-z)');
      return false;
    }
    
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter (A-Z)');
      return false;
    }
    
    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number (0-9)');
      return false;
    }
    
    // Check name length
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-0 -right-10 w-[500px] h-[500px] bg-blue-500 opacity-20 rounded-full blur-2xl animate-ping z-0" />

      {/* Floating Badge */}
      <div className="absolute top-6 right-6 bg-gradient-to-r from-pink-600 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10 animate-bounce">
        🚀 Free Forever
      </div>

      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-2"
        >
          Create Account
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-center text-gray-300 mb-6"
        >
          Join DocuVerify and start verifying securely
        </motion.p>

        {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 border border-red-400/30 rounded-lg">⚠️ {error}</div>}
        {success && <div className="text-green-400 text-sm mb-4 p-3 bg-green-400/10 border border-green-400/30 rounded-lg">✅ {success}</div>}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Create password"
                required
              />
              <div className="text-xs mt-1 space-y-1">
                <div className="text-gray-400">Password requirements:</div>
                <div className={`flex items-center gap-1 ${formData.password.length >= 6 ? 'text-green-400' : 'text-gray-400'}`}>
                  <span>{formData.password.length >= 6 ? '✅' : '⚪'}</span>
                  <span>At least 6 characters</span>
                </div>
                <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <span>{/[a-z]/.test(formData.password) ? '✅' : '⚪'}</span>
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <span>{/[A-Z]/.test(formData.password) ? '✅' : '⚪'}</span>
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1 ${/\d/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <span>{/\d/.test(formData.password) ? '✅' : '⚪'}</span>
                  <span>One number</span>
                </div>
                <div className="text-xs text-blue-300 mt-1">
                  Examples: Password123, DocVerify1, MyPass456
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Confirm password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 transition rounded-lg text-white font-semibold shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </motion.div>

        <p className="text-sm text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>

        <div className="text-center mt-2">
          <Link to="/" className="text-xs text-gray-500 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
