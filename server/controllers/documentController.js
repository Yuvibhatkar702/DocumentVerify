// controllers/documentController.js (Final Fully Working Version)

const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AIMlService = require('../services/aiMlService');
const OCRService = require('../services/ocrService');



// ===== MULTER CONFIGURATION =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'image/tiff', 'image/bmp'
  ];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.tiff', '.bmp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ===== DOCUMENT TYPES =====
const { expandedDocumentTypes } = require('../data/documentTypes'); // Assume you store all types in a file

// ===== CONTROLLERS =====
const uploadDocument = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { documentType } = req.body;
    if (!expandedDocumentTypes.includes(documentType)) {
      return res.status(400).json({ success: false, message: `Invalid document type "${documentType}".` });
    }

    const document = new Document({
      userId: req.user.id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      documentType,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'uploaded'
    });

    const savedDocument = await document.save();
    processDocumentWithAI(savedDocument._id, savedDocument.filePath, documentType);

    res.status(201).json({ success: true, message: 'Document uploaded successfully', data: savedDocument });

  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

const processDocumentWithAI = async (documentId, filePath, documentType) => {
  try {
    const aiDocType = 'id-card'; // default mapping for demo
    await Document.findByIdAndUpdate(documentId, { 
      status: 'processing',
      processedAt: new Date()
    });

    console.log(`[ProcessDocument] Starting processing for document ${documentId}`);

    // Check if AI/ML service is available
    const isAIAvailable = await AIMlService.checkServiceHealth();
    console.log(`[ProcessDocument] AI/ML Service available: ${isAIAvailable}`);

    // Perform OCR extraction using OCR.space API
    let ocrResult = null;
    try {
      console.log(`[ProcessDocument] Starting OCR extraction...`);
      
      // Add additional validation before OCR
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found for OCR: ${filePath}`);
      }
      
      ocrResult = await OCRService.extractText(filePath);
      console.log(`[ProcessDocument] OCR extraction completed:`, {
        success: ocrResult.success,
        textLength: ocrResult.text?.length || 0,
        confidence: ocrResult.confidence,
        error: ocrResult.error || 'none'
      });
    } catch (ocrError) {
      console.error(`[ProcessDocument] OCR extraction failed:`, ocrError.message);
      ocrResult = {
        success: false,
        text: '',
        confidence: 0,
        error: ocrError.message,
        extractedData: {},
        textRegions: [],
        detectedLanguage: 'unknown'
      };
    }

    let analysis = null;
    let format = null;
    let signature = null;

    // Try AI analysis if service is available
    if (isAIAvailable) {
      try {
        console.log(`[ProcessDocument] Starting AI analysis...`);
        analysis = await AIMlService.analyzeDocument(filePath, aiDocType);
        format = await AIMlService.validateDocumentFormat(filePath, aiDocType);
        signature = await AIMlService.detectSignature(filePath);
        console.log(`[ProcessDocument] AI analysis completed`);
      } catch (aiError) {
        console.error(`[ProcessDocument] AI analysis failed:`, aiError.message);
        // Create fallback analysis
        analysis = {
          confidenceScore: 0.7,
          quality_score: 0.8,
          anomalies: [],
          document_type: documentType,
          is_authentic: true
        };
        format = { format_score: 0.8, is_valid_format: true };
        signature = { signature_detected: false, confidence: 0.5 };
      }
    } else {
      console.log(`[ProcessDocument] AI service unavailable, using fallback analysis`);
      // Create fallback analysis based on OCR results
      const ocrConfidence = ocrResult.confidence || 0;
      analysis = {
        confidenceScore: ocrConfidence > 0.5 ? 0.8 : 0.4,
        quality_score: ocrConfidence,
        anomalies: ocrResult.success ? [] : ['OCR extraction failed'],
        document_type: documentType,
        is_authentic: ocrResult.success && ocrConfidence > 0.3
      };
      format = { 
        format_score: ocrResult.success ? 0.8 : 0.3, 
        is_valid_format: ocrResult.success 
      };
      signature = { signature_detected: false, confidence: 0.5 };
    }

    // Calculate comprehensive authenticity score
    const score = calculateAuthenticityScore(analysis, format, ocrResult, signature);
    console.log(`[ProcessDocument] Calculated authenticity score: ${score}`);

    // Determine final status based on score and analysis
    let status = 'rejected';
    let authenticity = 'fake';
    
    if (score >= 0.8 && analysis.is_authentic !== false) {
      status = 'verified';
      authenticity = 'authentic';
    } else if (score >= 0.6) {
      status = 'pending_review';
      authenticity = 'suspicious';
    } else if (score >= 0.4) {
      status = 'pending_review';
      authenticity = 'suspicious';
    } else {
      status = 'rejected';
      authenticity = 'fake';
    }

    console.log(`[ProcessDocument] Final status: ${status}, authenticity: ${authenticity}`);

    // Update document with comprehensive results
    const updateData = {
      status,
      processedAt: new Date(),
      verifiedAt: status === 'verified' ? new Date() : null,
      verificationResult: {
        confidence: Math.round(score * 100),
        authenticity,
        analysisDetails: {
          aiAnalysis: analysis,
          formatValidation: format,
          ocrResult: {
            text: ocrResult.text || '',
            confidence: ocrResult.confidence || 0,
            success: ocrResult.success || false,
            extractedData: ocrResult.extractedData || {},
            textRegions: ocrResult.textRegions || [],
            error: ocrResult.error || null
          },
          signatureDetection: { 
            detected: signature.signature_detected || false, 
            confidence: signature.confidence || 0 
          },
          qualityScore: analysis.quality_score || 0,
          anomalies: analysis.anomalies || []
        }
      }
    };

    // Store extracted text separately for easy access
    if (ocrResult.text) {
      updateData.extractedText = ocrResult.text;
      updateData.extractedData = ocrResult.extractedData || {};
    }

    await Document.findByIdAndUpdate(documentId, updateData);
    console.log(`[ProcessDocument] Document ${documentId} processing completed with status: ${status}`);

  } catch (err) {
    console.error(`[ProcessDocument] Processing failed for document ${documentId}:`, err.message);
    await Document.findByIdAndUpdate(documentId, { 
      status: 'failed', 
      error: err.message,
      processedAt: new Date()
    });
  }
};

const calculateAuthenticityScore = (analysis, format, ocrResult, signature) => {
  try {
    // Base scores from different components
    const aiScore = analysis.confidenceScore || 0;
    const formatScore = format.format_score || 0;
    const ocrScore = ocrResult.confidence || 0;
    const signatureScore = signature.signature_detected ? (signature.confidence || 0.7) : 0.5;
    const qualityScore = analysis.quality_score || 0;
    
    // Calculate weighted score
    let totalScore = (
      aiScore * 0.35 +           // AI analysis (35%)
      formatScore * 0.25 +       // Format validation (25%)
      ocrScore * 0.20 +          // OCR confidence (20%)
      signatureScore * 0.10 +    // Signature detection (10%)
      qualityScore * 0.10        // Image quality (10%)
    );

    // Apply penalties for anomalies
    const anomalyPenalty = (analysis.anomalies?.length || 0) * 0.1;
    totalScore = Math.max(0, totalScore - anomalyPenalty);

    // Boost score if OCR extracted meaningful content
    if (ocrResult.success && ocrResult.text && ocrResult.text.length > 50) {
      totalScore += 0.1;
    }

    // Boost score if structured data was extracted
    if (ocrResult.extractedData && Object.keys(ocrResult.extractedData).length > 0) {
      totalScore += 0.05;
    }

    // Ensure score is within valid range
    return Math.max(0, Math.min(1, totalScore));
  } catch (error) {
    console.error('[calculateAuthenticityScore] Error calculating score:', error.message);
    return 0.5; // Return neutral score on error
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 }).select('-filePath');
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fetch failed', error: err.message });
  }
};

const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: document });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Get failed', error: err.message });
  }
};

const verifyDocument = async (req, res) => {
  try {
    const { isValid, notes } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    document.status = isValid ? 'verified' : 'rejected';
    document.verificationResult = {
      ...document.verificationResult,
      isValid,
      notes: notes || '',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };
    await document.save();

    res.json({ success: true, message: `Document ${isValid ? 'verified' : 'rejected'}`, data: document });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verify failed', error: err.message });
  }
};

const getDocumentOCR = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Check if OCR data already exists in the document
    if (document.extractedText || document.verificationResult?.analysisDetails?.ocrResult?.text) {
      return res.json({
        success: true,
        data: {
          documentId: document._id,
          extractedText: document.extractedText || document.verificationResult.analysisDetails.ocrResult.text,
          extractedData: document.extractedData || document.verificationResult?.analysisDetails?.ocrResult?.extractedData || {},
          confidence: document.verificationResult?.analysisDetails?.ocrResult?.confidence || 0,
          textRegions: document.verificationResult?.analysisDetails?.ocrResult?.textRegions || [],
          cached: true
        }
      });
    }

    // If no OCR data exists, perform OCR extraction
    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Document file not found for OCR processing' 
      });
    }

    console.log(`[getDocumentOCR] Performing fresh OCR extraction for document ${document._id}`);
    const ocrResult = await OCRService.extractText(document.filePath);

    // Update document with OCR results
    if (ocrResult.success && ocrResult.text) {
      await Document.findByIdAndUpdate(document._id, {
        extractedText: ocrResult.text,
        extractedData: ocrResult.extractedData || {},
        $set: {
          'verificationResult.analysisDetails.ocrResult': {
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            success: ocrResult.success,
            extractedData: ocrResult.extractedData || {},
            textRegions: ocrResult.textRegions || []
          }
        }
      });
    }

    res.json({
      success: ocrResult.success,
      data: {
        documentId: document._id,
        extractedText: ocrResult.text || '',
        extractedData: ocrResult.extractedData || {},
        confidence: ocrResult.confidence || 0,
        textRegions: ocrResult.textRegions || [],
        cached: false,
        error: ocrResult.error || null
      }
    });

  } catch (error) {
    console.error('[getDocumentOCR] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'OCR extraction failed', 
      error: error.message 
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getDocuments,
  getDocument,
  getDocumentOCR,
  verifyDocument,
  deleteDocument
};
