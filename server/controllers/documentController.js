const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AIMlService = require('../services/aiMlService');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept images and PDFs
const fileFilter = (req, file, cb) => {
  console.log('File filter - MIME type:', file.mimetype);
  console.log('File filter - Original name:', file.originalname);
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'image/tiff',
    'image/bmp'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.tiff', '.bmp'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    console.log('File rejected - Invalid type:', file.mimetype, fileExt);
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')} and extensions: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload document
const uploadDocument = async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User from auth middleware:', req.user);
    console.log('=== END UPLOAD DEBUG INFO ===');

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('Authentication failed - no user in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a file to upload.'
      });
    }

    const { documentType } = req.body;
    
    if (!documentType) {
      console.log('No document type provided');
      return res.status(400).json({
        success: false,
        message: 'Document type is required. Please select a document type.'
      });
    }

    // Document type validation is now primarily handled by express-validator in the routes
    // However, we still need to ensure documentType is provided.
    // The check for whether it's a *valid* type according to the enum will be
    // handled by Mongoose during the .save() operation if not caught by express-validator.

    console.log('Creating document record...');

    // Create document record
    const document = new Document({
      userId: req.user.id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      documentType: documentType,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'uploaded'
    });

    console.log('Document object before save:', document);

    const savedDocument = await document.save();
    console.log('Document saved successfully:', savedDocument);

    // Process document with AI/ML service
    processDocumentWithAI(savedDocument._id, savedDocument.filePath, documentType);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: savedDocument._id,
        originalName: savedDocument.originalName,
        documentType: savedDocument.documentType,
        fileSize: savedDocument.fileSize,
        status: savedDocument.status,
        uploadedAt: savedDocument.uploadedAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Delete uploaded file if document creation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Process document with AI/ML service
const processDocumentWithAI = async (documentId, filePath, documentType) => {
  try {
    console.log(`Starting AI/ML processing for document ${documentId}`);
    
    // Map document types for AI/ML service
    const mapDocumentTypeForAI = (frontendType) => {
      // AI Service understands: 'id-card', 'passport', 'driver-license', 'certificate', 'other'
      const typeMapping = {
        // ID Documents
        'aadhar-card': 'id-card',
        'pan-card': 'id-card',
        'voter-id': 'id-card',
        'passport': 'passport',
        'driving-license': 'driver-license',
        'ration-card': 'id-card', // Often card-like or booklet
        'npr-id': 'id-card',
        'social-security-id': 'id-card',
        'employee-id-card': 'id-card',
        'student-id-card': 'id-card',
        'senior-citizen-card': 'id-card',
        'visa': 'other', // Visas can be stickers in passports or separate docs
        'oci-pio-card': 'id-card',
        'other-id-document': 'id-card',

        // Educational Certificates
        'ssc-10th-marksheet': 'certificate',
        'hsc-12th-marksheet': 'certificate',
        'diploma-certificate': 'certificate',
        'bachelors-degree': 'certificate',
        'masters-degree': 'certificate',
        'provisional-certificate': 'certificate',
        'migration-certificate': 'certificate',
        'character-certificate': 'certificate',
        'transfer-certificate': 'certificate',
        'bonafide-certificate': 'certificate',
        'admit-card': 'other', // More of a temporary pass
        'hall-ticket': 'other', // More of a temporary pass
        'entrance-exam-result': 'certificate', // Or 'other', result sheets can vary
        'internship-completion-certificate': 'certificate',
        'mooc-online-course-certificate': 'certificate',
        'other-educational-document': 'certificate',

        // Government Issued Certificates
        'caste-certificate': 'certificate',
        'income-certificate': 'certificate',
        'domicile-certificate': 'certificate',
        'birth-certificate': 'certificate',
        'death-certificate': 'certificate',
        'disability-certificate': 'certificate',
        'ews-certificate': 'certificate',
        'marriage-certificate': 'certificate',
        'police-character-certificate': 'certificate',
        'gazette-name-change-certificate': 'certificate',
        'adoption-certificate': 'certificate',
        'legal-heir-certificate': 'certificate',
        'obc-sc-st-certificate': 'certificate',
        'other-govt-issued-certificate': 'certificate',

        // Financial Documents
        'bank-passbook': 'other', // Multi-page booklet
        'bank-statement': 'other', // Typically multi-page
        'salary-slip': 'other',
        'form-16': 'other', // Standardized form
        'income-tax-return': 'other',
        'pf-account-details': 'other',
        'loan-approval-letter': 'certificate', // Can be seen as a formal letter/cert
        'emi-schedule': 'other',
        'credit-card-statement': 'other',
        'investment-proof': 'other', // Varies widely
        'uan-epfo-slip': 'other',
        'digital-payment-receipt': 'other',
        'other-financial-document': 'other',

        // Address Proof (many overlap with IDs or are utility bills)
        'aadhar-card-address': 'id-card', // Aadhar is an ID
        'voter-id-address': 'id-card',   // Voter ID is an ID
        'passport-address': 'passport',  // Passport is a passport
        'electricity-bill': 'other', // Utility bill
        'water-bill': 'other',       // Utility bill
        'gas-bill': 'other',         // Utility bill
        'property-tax-receipt': 'other',
        'rent-agreement': 'other',   // Legal document
        'telephone-landline-bill': 'other',
        'registered-sale-deed': 'other', // Legal document
        'bank-passbook-address': 'other',
        'ration-card-address': 'id-card', // Ration card can be ID like
        'other-address-proof': 'other',

        // Employment Documents
        'offer-letter': 'certificate', // Formal letter
        'appointment-letter': 'certificate', // Formal letter
        'experience-letter': 'certificate',
        'relieving-letter': 'certificate',
        'salary-certificate': 'certificate',
        'employment-agreement': 'other', // Contract document
        'joining-report': 'other',
        'noc-certificate': 'certificate',
        'promotion-letter': 'certificate',
        'appraisal-letter': 'certificate',
        'internship-letter': 'certificate',
        'employment-id': 'id-card', // Usually a card
        'other-work-document': 'other',

        // Medical Documents
        'medical-report': 'other', // Can be multi-page
        'covid-vaccination-certificate': 'certificate',
        'covid-test-report': 'certificate', // Or 'other'
        'health-card': 'id-card', // Often card-like
        'insurance-policy': 'other', // Multi-page document
        'insurance-claim-report': 'other',
        'doctor-prescription': 'other',
        'discharge-summary': 'other',
        'opd-slip': 'other',
        'disability-certificate-medical': 'certificate', // This is a specific certificate
        'blood-group-card': 'id-card', // Small card
        'other-medical-document': 'other',

        // Other Documents
        'affidavit': 'other', // Legal document
        'notarized-documents': 'other',
        'self-declaration': 'other',
        'non-employment-agreements': 'other',
        'court-orders': 'other',
        'legal-notices': 'other',
        'school-leaving-certificate': 'certificate',
        'hostel-form': 'other',
        'club-ngo-membership-card': 'id-card',
        'vehicle-registration-rc': 'id-card', // RC book/card
        'driving-school-certificate': 'certificate',
        'personal-notes': 'other',
        'other-miscellaneous-document': 'other',

        // Legacy support
        'other': 'other'
      };
      return typeMapping[frontendType] || 'other'; // Default to 'other' if not found
    };
    
    const aiDocumentType = mapDocumentTypeForAI(documentType);
    console.log(`Mapping document type: ${documentType} -> ${aiDocumentType}`);
    
    // Update status to processing
    await Document.findByIdAndUpdate(documentId, {
      status: 'processing'
    });
    
    // Check if AI/ML service is available
    const serviceHealthy = await AIMlService.checkServiceHealth();
    if (!serviceHealthy) {
      console.error('AI/ML service is not available, marking for pending review');
      await Document.findByIdAndUpdate(documentId, {
        status: 'pending_review', // Changed from 'failed'
        verificationResult: {
          confidence: 0,
          authenticity: 'unknown',
          issues: ['AI/ML service was unavailable during processing.'],
          analysisDetails: {
            serviceStatus: 'unavailable',
            recommendation: 'Document requires manual review or reprocessing when AI service is back online.'
          },
          error: 'AI/ML service unavailable' // Keep original error field if used elsewhere
        },
        processedAt: new Date() // Mark as processed, even if AI failed
      });
      return;
    }
    
    // Perform comprehensive document analysis
    const analysisResult = await AIMlService.analyzeDocument(filePath, aiDocumentType);
    
    // Perform format validation
    const formatValidation = await AIMlService.validateDocumentFormat(filePath, aiDocumentType);
    
    // Perform OCR
    const ocrResult = await AIMlService.performOCR(filePath);
    
    // Perform signature detection
    const signatureResult = await AIMlService.detectSignature(filePath);
    
    // Calculate comprehensive authenticity score
    const authenticityScore = calculateAuthenticityScore(
      analysisResult, 
      formatValidation, 
      ocrResult, 
      signatureResult
    );
    
    // Determine document status based on comprehensive analysis
    let documentStatus = 'rejected'; // Default status
    let authenticity = 'fake';       // Default authenticity
    
    // Determine status based on adjusted thresholds
    if (authenticityScore >= 0.7) { // Lowered threshold for 'verified' from 0.8
      documentStatus = 'verified';
      authenticity = 'authentic';
    } else if (authenticityScore >= 0.5) { // Lowered threshold for 'pending_review' from 0.6
      documentStatus = 'pending_review';
      authenticity = 'suspicious';
    }
    // If authenticityScore < 0.5, it remains 'rejected' and 'fake'

    // Initialize issues array starting with anomalies from AI
    const issues = analysisResult.anomalies ? [...analysisResult.anomalies] : [];
    const aiExtractedData = analysisResult.extractedData || {};
    const aiDetectedType = aiExtractedData.detected_document_type_by_content;

    // Content-Type Mismatch Detection Logic
    if (aiDetectedType && aiDetectedType !== 'unknown' && aiDetectedType !== 'other') {
      // Define specific types where a mismatch is critical
      const criticalMismatchPairs = {
        'aadhar-card': ['pan-card', 'passport', 'driving-license', 'caste-certificate', 'academic-certificate'],
        'pan-card': ['aadhar-card', 'passport', 'driving-license', 'caste-certificate', 'academic-certificate'],
        'passport': ['aadhar-card', 'pan-card', 'driving-license', 'caste-certificate', 'academic-certificate'],
        'driving-license': ['aadhar-card', 'pan-card', 'passport', 'caste-certificate', 'academic-certificate'],
        'caste-certificate': ['aadhar-card', 'pan-card', 'passport', 'driving-license', 'academic-certificate'],
        'ssc-10th-marksheet': ['aadhar-card', 'pan-card', 'passport', 'driving-license', 'caste-certificate'],
        'hsc-12th-marksheet': ['aadhar-card', 'pan-card', 'passport', 'driving-license', 'caste-certificate'],
        'bachelors-degree': ['aadhar-card', 'pan-card', 'passport', 'driving-license', 'caste-certificate']
        // Add more userSelectedType keys and their critical mismatch detected types
      };

      if (userSelectedType !== aiDetectedType) {
        const mismatchMessage = `Type Mismatch: User selected '${documentType}', but AI detected content more consistent with '${aiDetectedType}'.`;
        issues.push(mismatchMessage);
        console.log(`Potential type mismatch for document ${documentId}: ${mismatchMessage}`);

        // Check if this is a critical mismatch
        if (criticalMismatchPairs[documentType]?.includes(aiDetectedType)) {
          console.log(`Critical type mismatch detected for document ${documentId}. Overriding status to rejected.`);
          documentStatus = 'rejected';
          authenticity = 'fake'; // Or 'mismatch_error' if a new authenticity status is desired
        } else if (documentStatus === 'verified') {
          // If not critical but still a mismatch, and score was high, push to review
          documentStatus = 'pending_review';
          authenticity = 'suspicious';
        }
      }
    }

    // Update document with verification results
    await Document.findByIdAndUpdate(documentId, {
      status: documentStatus, // Use the potentially overridden status
      verificationResult: {
        confidence: Math.round(authenticityScore * 100),
        authenticity: authenticity, // Use the potentially overridden authenticity
        extractedData: aiExtractedData,
        analysisDetails: {
          aiAnalysis: analysisResult,
          formatValidation: formatValidation,
          ocrResult: {
            text: ocrResult.text || ocrResult.detected_text || '',
            confidence: ocrResult.confidence || 0
          },
          signatureDetection: {
            detected: signatureResult.signature_detected || signatureResult.found || false,
            confidence: signatureResult.confidence || 0
          },
          qualityScore: analysisResult.verificationDetails?.qualityScore || analysisResult.quality_score || 0,
          anomalies: analysisResult.anomalies || []
        },
        issues: issues // Now includes any mismatch issues
      },
      verifiedAt: new Date(),
      processedAt: new Date()
    });
    
    console.log(`Document ${documentId} processed - Final Status: ${documentStatus}, Authenticity: ${authenticity}, Score: ${authenticityScore}, Issues: ${issues.join('; ')}`);
    
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    
    // Mark document as failed
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      error: error.message
    });
  }
};

// Calculate comprehensive authenticity score
const calculateAuthenticityScore = (analysisResult, formatValidation, ocrResult, signatureResult) => {
  try {
    // Base score from AI analysis
    const aiScore = analysisResult.confidenceScore || 0;
    
    // Format validation score
    const formatScore = formatValidation.format_score || 0;
    
    // OCR confidence score
    const ocrScore = ocrResult.confidence || 0;
    
    // Signature detection score (if applicable)
    const signatureScore = signatureResult.signature_detected ? 
      (signatureResult.confidence || 0.7) : 0.5;
    
    // Quality score
    const qualityScore = analysisResult.verificationDetails?.qualityScore || 0;
    
    // Check for anomalies (reduces score)
    const anomalies = analysisResult.anomalies || [];
    const anomalyPenalty = anomalies.length * 0.1;
    
    // Weighted calculation
    const weightedScore = (
      aiScore * 0.35 +           // AI analysis weight
      formatScore * 0.25 +       // Format validation weight
      ocrScore * 0.20 +          // OCR confidence weight
      signatureScore * 0.10 +    // Signature detection weight
      qualityScore * 0.10        // Image quality weight
    );
    
    // Apply anomaly penalty
    const finalScore = Math.max(0, weightedScore - anomalyPenalty);
    
    return Math.min(1.0, finalScore);
    
  } catch (error) {
    console.error('Error calculating authenticity score:', error);
    return 0.1; // Very low score for errors
  }
};

// Get user documents
const getDocuments = async (req, res) => {
  try {
    console.log('Get documents request for user:', req.user?.id);
    
    const documents = await Document.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-filePath'); // Don't send file path to client

    console.log(`Found ${documents.length} documents for user`);

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

// Verify document (admin only)
const verifyDocument = async (req, res) => {
  try {
    const { isValid, notes } = req.body;
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document verification status
    document.status = isValid ? 'verified' : 'rejected';
    document.verificationResult = {
      isValid,
      notes: notes || '',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };

    await document.save();

    res.json({
      success: true,
      message: `Document ${isValid ? 'verified' : 'rejected'} successfully`,
      data: document
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
      error: error.message
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getDocuments,
  getDocument: getDocumentById,
  verifyDocument,
  deleteDocument
};