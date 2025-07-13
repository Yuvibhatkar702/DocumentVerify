const express = require('express');
const { body } = require('express-validator');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  verifyDocument,
  deleteDocument,
  getDocumentOCR
} = require('../controllers/documentController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadErrorHandler, preUploadLogger, postUploadLogger } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validation rules
const uploadValidation = [
  body('documentType')
    .isIn([
      'passport', 'id-card', 'driver-license', 'birth-certificate', 
      'marriage-certificate', 'academic-certificate', 'professional-certificate',
      'visa', 'work-permit', 'residence-permit', 'social-security-card',
      'voter-id', 'utility-bill', 'bank-statement', 'insurance-card',
      'medical-certificate', 'tax-document', 'property-deed', 'aadhar-card', 'other'
    ])
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
router.post('/upload', preUploadLogger, auth, upload.single('document'), postUploadLogger, uploadErrorHandler, uploadDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocument);
router.get('/:id/ocr', auth, getDocumentOCR);
router.post('/:id/verify', auth, admin, verifyValidation, verifyDocument);
router.delete('/:id', auth, deleteDocument);

module.exports = router;
