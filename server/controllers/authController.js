const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register user
const register = async (req, res) => {
  try {
    console.log('Registration attempt:', { name: req.body.name, email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Please check your input and fix the following issues:',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      password, 
      role, 
      mobileNumber, 
      collegeName, 
      country, 
      referralCode, 
      termsAccepted 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please try logging in or use a different email.'
      });
    }

    // Create new user
    console.log('Creating new user:', { name, email, role });
    const user = new User({ 
      name, 
      email, 
      password, 
      role: role || 'general',
      mobileNumber,
      collegeName,
      country,
      referralCode,
      termsAccepted: termsAccepted || true
    });
    await user.save();
    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while creating your account. Please try again in a moment.'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Please check your input and try again.',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Looking for user with email:', email);

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'The email or password you entered is incorrect. Please try again.'
      });
    }

    console.log('User found, checking password...');
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'The email or password you entered is incorrect. Please try again.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful for user:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while logging you in. Please try again in a moment.'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Logout (client-side token removal)
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// Google OAuth Success
const googleAuthSuccess = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
  } catch (error) {
    console.error('Google auth success error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
  }
};

// OAuth Failure
const oauthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // In production, send email with reset link
    // For now, just return success
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email.',
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, mobileNumber, collegeName, country } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        mobileNumber,
        collegeName,
        country
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        mobileNumber: updatedUser.mobileNumber,
        collegeName: updatedUser.collegeName,
        country: updatedUser.country
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user and include password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for OAuth accounts'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

// Generate API key
const generateApiKey = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has permission for API access
    if (!['admin', 'general'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'API access not available for your role'
      });
    }

    // Generate API key (you might want to use a more sophisticated method)
    const apiKey = `dvs_${Buffer.from(`${userId}_${Date.now()}`).toString('base64')}`;

    // Update user with API key
    user.apiKey = apiKey;
    await user.save();

    res.json({
      success: true,
      message: 'API key generated successfully',
      apiKey
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating API key'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  googleAuthSuccess,
  oauthFailure,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  generateApiKey
};
