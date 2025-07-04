const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const AIMlService = require('../services/aiMlService');

// Upload document
const uploadDocument = async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    } : 'NO FILE RECEIVED');
    console.log('User from auth middleware:', req.user ? {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    } : 'NO USER DATA');
    console.log('Raw request URL:', req.url);
    console.log('Raw request method:', req.method);
    console.log('Content-Type header:', req.headers['content-type']);
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

    // Validate document type
    const validDocumentTypes = [
      'passport', 'id-card', 'driver-license', 'birth-certificate', 
      'marriage-certificate', 'academic-certificate', 'professional-certificate',
      'visa', 'work-permit', 'residence-permit', 'social-security-card',
      'voter-id', 'utility-bill', 'bank-statement', 'insurance-card',
      'medical-certificate', 'tax-document', 'property-deed', 'aadhar-card', 'other'
    ];

    if (!validDocumentTypes.includes(documentType)) {
      console.log('Invalid document type:', documentType);
      return res.status(400).json({
        success: false,
        message: `Invalid document type "${documentType}". Allowed types: ${validDocumentTypes.join(', ')}`
      });
    }

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
      const typeMapping = {
        'voter-id': 'id-card',
        'id-card': 'id-card',
        'passport': 'passport',
        'driver-license': 'driver-license',
        'birth-certificate': 'certificate',
        'marriage-certificate': 'certificate',
        'academic-certificate': 'certificate',
        'professional-certificate': 'certificate',
        'medical-certificate': 'certificate'
      };
      return typeMapping[frontendType] || 'other';
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
      console.error('AI/ML service is not available, marking as failed');
      await Document.findByIdAndUpdate(documentId, {
        status: 'failed',
        error: 'AI/ML service unavailable'
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
    let documentStatus = 'rejected';
    let authenticity = 'fake';
    
    if (authenticityScore >= 0.8) {
      documentStatus = 'verified';
      authenticity = 'authentic';
    } else if (authenticityScore >= 0.6) {
      documentStatus = 'pending_review';
      authenticity = 'suspicious';
    }
    
    // Update document with verification results
    await Document.findByIdAndUpdate(documentId, {
      status: documentStatus,
      verificationResult: {
        confidence: Math.round(authenticityScore * 100),
        authenticity: authenticity,
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
        }
      },
      verifiedAt: new Date()
    });
    
    console.log(`Document ${documentId} processed - Status: ${documentStatus}, Authenticity: ${authenticity}, Score: ${authenticityScore}`);
    
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
  uploadDocument,
  getDocuments,
  getDocument: getDocumentById,
  verifyDocument,
  deleteDocument
};