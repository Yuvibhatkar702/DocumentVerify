const express = require('express');
const { body } = require('express-validator');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  verifyDocument,
  deleteDocument
} = require('../controllers/documentController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validation rules
const uploadValidation = [
  body('documentType')
    .isIn(['passport', 'id-card', 'driver-license', 'certificate', 'other'])
    .withMessage('Invalid document type')
];

const verifyValidation = [
  body('isValid')
    .isBoolean()
    .withMessage('isValid must be a boolean'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Routes
router.post('/upload', auth, upload.single('document'), uploadValidation, uploadDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocument);
router.post('/:id/verify', auth, admin, verifyValidation, verifyDocument);
router.delete('/:id', auth, deleteDocument);

module.exports = router;
