import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaGoogle, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaUniversity, FaGlobe, FaGift, FaCheck } from 'react-icons/fa';

const EnhancedRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'general',
    mobileNumber: '',
    collegeName: '',
    country: '',
    referralCode: '',
    termsAccepted: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle OAuth errors from URL params
  React.useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        case 'oauth_failed':
          setError('OAuth registration failed. Please try again.');
          break;
        case 'oauth_not_configured':
          setError('Google OAuth is not configured. Please use email/password registration or contact support.');
          break;
        case 'invalid_client':
          setError('Google OAuth is not properly configured. Please use email/password registration for now.');
          break;
        case 'invalid_token':
          setError('Invalid authentication token. Please try again.');
          break;
        case 'no_token':
          setError('No authentication token received. Please try again.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    }
  }, [searchParams]);

  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'France', 'Singapore', 'UAE', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Form submission started with data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, sending to API...');
    setLoading(true);
    try {
      const result = await register(formData);
      console.log('Registration successful:', result);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Show helpful message instead of redirecting to broken OAuth
    setError('Google OAuth setup is in progress. Please use email/password registration for now.');
    
    // Uncomment the line below once you've configured Google OAuth properly
    // const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    // window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300 text-sm">Join DocuVerify for secure document verification</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-3 text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <FaGoogle className="text-red-400" />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name *"
              required
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address *"
              required
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password *"
              required
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password *"
              required
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Role Selection */}
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="general">General User</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Mobile Number */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number (Optional)"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* College Name (shown when role is student) */}
          {formData.role === 'student' && (
            <div className="relative">
              <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="College/University Name"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Country */}
          <div className="relative">
            <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Country (Optional)</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Referral Code */}
          <div className="relative">
            <FaGift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Referral Code (Optional)"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
            />
            <label className="text-sm text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="text-purple-400 hover:text-purple-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              <>
                <FaCheck />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedRegisterPage;
