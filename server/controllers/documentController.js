const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

    // Validate document type
    const validDocumentTypes = [
      'passport', 'id-card', 'driver-license', 'birth-certificate', 
      'marriage-certificate', 'academic-certificate', 'professional-certificate',
      'visa', 'work-permit', 'residence-permit', 'social-security-card',
      'voter-id', 'utility-bill', 'bank-statement', 'insurance-card',
      'medical-certificate', 'tax-document', 'property-deed', 'other'
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

    // Simulate processing
    setTimeout(async () => {
      try {
        await Document.findByIdAndUpdate(savedDocument._id, {
          status: 'processing'
        });
        console.log('Document status updated to processing');
        
        // Simulate verification after processing
        setTimeout(async () => {
          try {
            await Document.findByIdAndUpdate(savedDocument._id, {
              status: 'verified',
              'verificationResult.confidence': Math.floor(Math.random() * 20) + 80,
              'verificationResult.authenticity': 'authentic',
              verifiedAt: new Date()
            });
            console.log('Document verification completed');
          } catch (verifyError) {
            console.error('Error updating verification:', verifyError);
          }
        }, 3000);
        
      } catch (processError) {
        console.error('Error updating processing status:', processError);
      }
    }, 1000);

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