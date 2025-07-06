const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const {
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
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['student', 'general', 'admin', 'user'])
    .withMessage('Invalid role selected'),
  body('mobileNumber')
    .optional()
    .custom((value) => {
      if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
        throw new Error('Please provide a valid mobile number');
      }
      return true;
    }),
  body('termsAccepted')
    .optional()
    .isBoolean()
    .withMessage('Terms acceptance must be a boolean value')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Test route to verify backend connection
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend connection successful',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// Regular Auth Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getCurrentUser);
router.post('/logout', logout);

// Password Reset Routes
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  if (process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=invalid_client`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { failureRedirect: '/api/auth/failure' })(req, res, next);
}, googleAuthSuccess);

// OAuth Failure Route
router.get('/failure', oauthFailure);

// Profile management routes
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/generate-api-key', auth, generateApiKey);

module.exports = router;
