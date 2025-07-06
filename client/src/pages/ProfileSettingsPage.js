import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaLock, 
  FaBell, 
  FaMoon, 
  FaSun, 
  FaKey,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaGlobe,
  FaUserTag,
  FaCheck,
  FaCog
} from 'react-icons/fa';

const ProfileSettingsPage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    collegeName: '',
    country: '',
    role: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    documentAlerts: true,
    securityAlerts: true,
    marketingEmails: false
  });

  // API Access state
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        collegeName: user.collegeName || '',
        country: user.country || '',
        role: user.role || ''
      });
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [user]);

  // Auto-clear messages after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Test server connection
  const testConnection = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:50011'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setSuccess('Server connection successful!');
      } else {
        setError('Server responded but authentication failed. Please try logging in again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please ensure the backend server is running on port 50011.');
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle notification changes
  const handleNotificationChange = (name) => {
    setNotifications(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    // Validate required fields
    if (!profileData.name || !profileData.email) {
      setError('Name and email are required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:50011'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Profile updated successfully!');
        setIsEditingProfile(false);
        // Update user in localStorage
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!passwordData.currentPassword) {
      setError('Current password is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:50011'}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      if (err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError(err.message || 'Failed to change password. Please check your current password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newDarkMode);
    
    // Apply theme to body for immediate visual feedback
    document.body.classList.toggle('dark', newDarkMode);
    
    // Show success message
    setSuccess(`Switched to ${newDarkMode ? 'dark' : 'light'} mode`);
  };

  // Helper function for input styling
  const getInputStyles = (disabled = false) => {
    const baseStyles = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
    const themeStyles = darkMode 
      ? "bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-purple-500" 
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-indigo-500";
    const disabledStyles = disabled ? "opacity-50" : "";
    return `${baseStyles} ${themeStyles} ${disabledStyles}`;
  };

  // Generate API key
  const generateApiKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:50011'}/api/auth/generate-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApiKey(data.apiKey);
        setSuccess('API key generated successfully!');
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        throw new Error(data.message || 'Failed to generate API key');
      }
    } catch (err) {
      console.error('API key generation error:', err);
      if (err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError(err.message || 'Failed to generate API key. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: FaUser },
    { id: 'password', label: 'Change Password', icon: FaLock },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'theme', label: 'Theme', icon: darkMode ? FaMoon : FaSun },
    { id: 'api', label: 'API Access', icon: FaKey }
  ];

  return (
    <div className={`min-h-screen p-4 transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-lg rounded-2xl p-6 mb-6 border transition-all duration-300 ${
            darkMode 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-white/80 border-gray-200 text-gray-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <FaCog className={`text-2xl ${darkMode ? 'text-white' : 'text-indigo-600'}`} />
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Profile & Settings
            </h1>
          </div>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your account preferences and settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`backdrop-blur-lg rounded-2xl p-6 border h-fit transition-all duration-300 ${
              darkMode 
                ? 'bg-white/10 border-white/20' 
                : 'bg-white/80 border-gray-200'
            }`}
          >
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? darkMode 
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-indigo-600 text-white shadow-lg'
                      : darkMode
                        ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="text-lg" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-3 backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${
              darkMode 
                ? 'bg-white/10 border-white/20' 
                : 'bg-white/80 border-gray-200'
            }`}
          >
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 flex items-center justify-between">
                <span>{success}</span>
                <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-300">
                  <FaTimes />
                </button>
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300">
                <div className="flex items-center justify-between mb-2">
                  <span>{error}</span>
                  <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                    <FaTimes />
                  </button>
                </div>
                {error.includes('connect to server') && (
                  <div className="mt-2 pt-2 border-t border-red-500/30">
                    <button
                      onClick={testConnection}
                      disabled={loading}
                      className="text-xs bg-red-500/30 hover:bg-red-500/40 px-2 py-1 rounded"
                    >
                      Test Connection
                    </button>
                    <p className="text-xs mt-1 text-red-200">
                      Make sure the backend server is running on port 50011
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Edit Profile
                </h2>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isEditingProfile ? <FaTimes /> : <FaEdit />}
                    {isEditingProfile ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={getInputStyles(!isEditingProfile)}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaEnvelope className="inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={getInputStyles(!isEditingProfile)}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaPhone className="inline mr-2" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={profileData.mobileNumber}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={getInputStyles(!isEditingProfile)}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaUniversity className="inline mr-2" />
                      College/Institution
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={profileData.collegeName}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={getInputStyles(!isEditingProfile)}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaGlobe className="inline mr-2" />
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={profileData.country}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={getInputStyles(!isEditingProfile)}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaUserTag className="inline mr-2" />
                      Role
                    </label>
                    <input
                      type="text"
                      value={profileData.role}
                      disabled
                      className={getInputStyles(true)}
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <FaSave />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaLock />
                  )}
                  Change Password
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                          {key === 'documentAlerts' && 'Get notified about document verification status'}
                          {key === 'securityAlerts' && 'Receive alerts for security-related activities'}
                          {key === 'marketingEmails' && 'Receive promotional emails and newsletters'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Theme Settings</h2>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Dark Mode</h3>
                      <p className="text-gray-400 text-sm">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center ${
                          darkMode ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      >
                        {darkMode ? <FaMoon className="text-purple-600 text-xs" /> : <FaSun className="text-yellow-500 text-xs" />}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Theme Preview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <div className="text-gray-800 font-medium">Light Theme</div>
                      <div className="text-gray-600 text-sm">Clean and bright interface</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-white font-medium">Dark Theme</div>
                      <div className="text-gray-300 text-sm">Easy on the eyes</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Access Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">API Access</h2>
                
                {(user?.role === 'admin' || user?.role === 'general') ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h3 className="text-white font-medium mb-2">API Key</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Use this API key to authenticate your requests to the Document Verification API
                      </p>
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey || 'No API key generated'}
                            readOnly
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                          />
                        </div>
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          {showApiKey ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={generateApiKey}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <FaKey />
                        )}
                        Generate New API Key
                      </button>
                    </div>

                    <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                      <h4 className="text-blue-300 font-medium mb-2">API Documentation</h4>
                      <p className="text-blue-200 text-sm">
                        Include your API key in the Authorization header: <code className="bg-blue-900/50 px-2 py-1 rounded">Bearer YOUR_API_KEY</code>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <h3 className="text-yellow-300 font-medium mb-2">API Access Not Available</h3>
                    <p className="text-yellow-200 text-sm">
                      API access is only available for General and Admin users. Please contact your administrator for access.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
