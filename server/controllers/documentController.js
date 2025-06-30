const Document = require('../models/Document');
const VerificationLog = require('../models/VerificationLog');
const aiMlService = require('../services/aiMlService');
const fileService = require('../services/fileService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

// Upload document
const uploadDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType } = req.body;
    const file = req.file;

    // Create document record
    const document = new Document({
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentType,
      uploadedBy: req.user.id,
      status: 'pending'
    });

    await document.save();

    // Log the upload action
    await new VerificationLog({
      documentId: document._id,
      userId: req.user.id,
      action: 'upload',
      status: 'success',
      details: {
        filename: file.originalname,
        fileSize: file.size,
        documentType
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }).save();

    // Trigger AI/ML processing asynchronously
    processDocumentAsync(document._id);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        filename: document.originalName,
        documentType: document.documentType,
        status: document.status,
        uploadDate: document.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

// Get all documents for user
const getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, documentType } = req.query;
    const query = { uploadedBy: req.user.id };

    // Add filters if provided
    if (status) query.status = status;
    if (documentType) query.documentType = documentType;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath'); // Don't expose file paths

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDocuments: total
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving documents'
    });
  }
};

// Get single document
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findOne({
      _id: id,
      uploadedBy: req.user.id
    }).select('-filePath');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving document'
    });
  }
};

// Manually verify document (admin only)
const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { isValid, notes } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document status
    document.status = isValid ? 'verified' : 'rejected';
    document.verificationResult.isValid = isValid;
    document.verificationResult.verifiedAt = new Date();
    document.verificationResult.verificationMethod = 'manual';
    document.notes = notes || '';
    document.processedAt = new Date();

    await document.save();

    // Log the verification action
    await new VerificationLog({
      documentId: document._id,
      userId: req.user.id,
      action: isValid ? 'approve' : 'reject',
      status: 'success',
      details: {
        notes,
        verificationMethod: 'manual'
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }).save();

    res.json({
      success: true,
      message: `Document ${isValid ? 'verified' : 'rejected'} successfully`,
      document
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      uploadedBy: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete physical file
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Delete document record
    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion'
    });
  }
};

// Async function to process document with AI/ML service
const processDocumentAsync = async (documentId) => {
  try {
    const document = await Document.findById(documentId);
    if (!document) return;

    document.status = 'processing';
    await document.save();

    // Call AI/ML service
    const verificationResult = await aiMlService.analyzeDocument(document.filePath, document.documentType);

    // Update document with results
    document.status = verificationResult.isValid ? 'verified' : 'rejected';
    document.verificationResult = {
      ...verificationResult,
      verifiedAt: new Date(),
      verificationMethod: 'ai-ml'
    };
    document.processedAt = new Date();

    await document.save();

    // Log the verification
    await new VerificationLog({
      documentId: document._id,
      userId: document.uploadedBy,
      action: 'verify',
      status: 'success',
      details: verificationResult,
      processingTime: Date.now() - document.createdAt.getTime()
    }).save();

  } catch (error) {
    console.error('Document processing error:', error);
    
    // Update document status to indicate processing failure
    await Document.findByIdAndUpdate(documentId, {
      status: 'rejected',
      'verificationResult.isValid': false,
      processedAt: new Date()
    });

    // Log the error
    await new VerificationLog({
      documentId,
      userId: null,
      action: 'verify',
      status: 'failure',
      errorMessage: error.message
    }).save();
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  verifyDocument,
  deleteDocument
};
