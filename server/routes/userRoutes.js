const express = require('express');
const { body } = require('express-validator');
const {
  getUserProfile,
  updateUserProfile,
  getUserActivityLogs,
  getAllUsers,
  toggleUserStatus
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
];

// User routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateProfileValidation, updateUserProfile);
router.get('/activity-logs', auth, getUserActivityLogs);

// Admin routes
router.get('/', auth, admin, getAllUsers);
router.patch('/:id/toggle-status', auth, admin, toggleUserStatus);

module.exports = router;
