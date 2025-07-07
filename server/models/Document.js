const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  documentCategory: {
    type: String,
    required: false, // Will be made required after client sends it
    enum: [
      'identity', 'educational', 'government-certificates', 'financial',
      'address-proof', 'employment', 'medical', 'other', '' // Allow empty initially
    ]
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    enum: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'image/tiff',
      'image/bmp'
    ]
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'verified', 'failed', 'rejected', 'pending_review'],
    default: 'uploaded'
  },
  verificationResult: {
    confidence: { type: Number, min: 0, max: 100 },
    extractedData: mongoose.Schema.Types.Mixed,
    authenticity: { type: String, enum: ['authentic', 'suspicious', 'fake', 'unknown'] },
    issues: [String],
    analysisDetails: {
      aiAnalysis: mongoose.Schema.Types.Mixed,
      formatValidation: mongoose.Schema.Types.Mixed,
      ocrResult: {
        text: String,
        confidence: Number
      },
      signatureDetection: {
        detected: Boolean,
        confidence: Number
      },
      qualityScore: Number,
      anomalies: [String],
      processingTime: Number
    }
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  verifiedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);