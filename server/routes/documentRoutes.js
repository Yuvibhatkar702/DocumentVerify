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
const { uploadErrorHandler, preUploadLogger, postUploadLogger } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validation rules

// Comprehensive list of allowed document types for validation
const allDocumentTypes = [
  // ID Documents
  'aadhar-card', 'pan-card', 'voter-id', 'passport', 'driving-license',
  'ration-card', 'npr-id', 'social-security-id', 'employee-id-card',
  'student-id-card', 'senior-citizen-card', 'visa', 'oci-pio-card',
  'other-id-document',
  // Educational Certificates
  'ssc-10th-marksheet', 'hsc-12th-marksheet', 'diploma-certificate',
  'bachelors-degree', 'masters-degree', 'provisional-certificate',
  'migration-certificate', 'character-certificate', 'transfer-certificate',
  'bonafide-certificate', 'admit-card', 'hall-ticket', 'entrance-exam-result',
  'internship-completion-certificate', 'mooc-online-course-certificate',
  'other-educational-document',
  // Government Issued Certificates
  'caste-certificate', 'income-certificate', 'domicile-certificate',
  'birth-certificate', 'death-certificate', 'disability-certificate',
  'ews-certificate', 'marriage-certificate', 'police-character-certificate',
  'gazette-name-change-certificate', 'adoption-certificate',
  'legal-heir-certificate', 'obc-sc-st-certificate',
  'other-govt-issued-certificate',
  // Financial Documents
  'bank-passbook', 'bank-statement', 'salary-slip', 'form-16',
  'income-tax-return', 'pf-account-details', 'loan-approval-letter',
  'emi-schedule', 'credit-card-statement', 'investment-proof',
  'uan-epfo-slip', 'digital-payment-receipt', 'other-financial-document',
  // Address Proof
  'aadhar-card-address', 'voter-id-address', 'passport-address',
  'electricity-bill', 'water-bill', 'gas-bill', 'property-tax-receipt',
  'rent-agreement', 'telephone-landline-bill', 'registered-sale-deed',
  'bank-passbook-address', 'ration-card-address', 'other-address-proof',
  // Employment Documents
  'offer-letter', 'appointment-letter', 'experience-letter',
  'relieving-letter', 'salary-certificate', 'employment-agreement',
  'joining-report', 'noc-certificate', 'promotion-letter',
  'appraisal-letter', 'internship-letter', 'employment-id',
  'other-work-document',
  // Medical Documents
  'medical-report', 'covid-vaccination-certificate', 'covid-test-report',
  'health-card', 'insurance-policy', 'insurance-claim-report',
  'doctor-prescription', 'discharge-summary', 'opd-slip',
  'disability-certificate-medical', 'blood-group-card', 'other-medical-document',
  // Other Documents
  'affidavit', 'notarized-documents', 'self-declaration',
  'non-employment-agreements', 'court-orders', 'legal-notices',
  'school-leaving-certificate', 'hostel-form', 'club-ngo-membership-card',
  'vehicle-registration-rc', 'driving-school-certificate', 'personal-notes',
  'other-miscellaneous-document',
  // Legacy support
  'other'
];

const uploadValidation = [
  body('documentType')
    .notEmpty().withMessage('Document type is required.')
    .isIn(allDocumentTypes)
    .withMessage('Invalid document type provided.'),
  body('documentCategory') // Added validation for documentCategory
    .optional() // Making it optional for now, will be required later
    .isIn(['identity', 'educational', 'government-certificates', 'financial', 'address-proof', 'employment', 'medical', 'other', ''])
    .withMessage('Invalid document category provided.')
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
router.post('/:id/verify', auth, admin, verifyValidation, verifyDocument);
router.delete('/:id', auth, deleteDocument);

module.exports = router;
