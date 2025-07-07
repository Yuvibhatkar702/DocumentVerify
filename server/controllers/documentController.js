// controllers/documentController.js (Final Fully Working Version)

const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AIMlService = require('../services/aiMlService');



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
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    if (!(await AIMlService.checkServiceHealth())) {
      await Document.findByIdAndUpdate(documentId, { status: 'failed', error: 'AI/ML unavailable' });
      return;
    }

    const analysis = await AIMlService.analyzeDocument(filePath, aiDocType);
    const format = await AIMlService.validateDocumentFormat(filePath, aiDocType);
    const ocr = await AIMlService.performOCR(filePath);
    const signature = await AIMlService.detectSignature(filePath);

    const score = calculateAuthenticityScore(analysis, format, ocr, signature);

    let status = 'rejected';
    let authenticity = 'fake';
    if (score >= 0.8) {
      status = 'verified';
      authenticity = 'authentic';
    } else if (score >= 0.6) {
      status = 'pending_review';
      authenticity = 'suspicious';
    }

    await Document.findByIdAndUpdate(documentId, {
      status,
      processedAt: new Date(),
      verifiedAt: status === 'verified' ? new Date() : null,
      verificationResult: {
        confidence: Math.round(score * 100),
        authenticity,
        analysisDetails: {
          aiAnalysis: analysis,
          formatValidation: format,
          ocrResult: { text: ocr.text || '', confidence: ocr.confidence || 0 },
          signatureDetection: { detected: signature.signature_detected || false, confidence: signature.confidence || 0 },
          qualityScore: analysis.quality_score || 0,
          anomalies: analysis.anomalies || []
        }
      }
    });
  } catch (err) {
    await Document.findByIdAndUpdate(documentId, { status: 'failed', error: err.message });
  }
};

const calculateAuthenticityScore = (analysis, format, ocr, signature) => {
  const ai = analysis.confidenceScore || 0;
  const fmt = format.format_score || 0;
  const ocrScore = ocr.confidence || 0;
  const sig = signature.signature_detected ? (signature.confidence || 0.7) : 0.5;
  const quality = analysis.quality_score || 0;
  const penalty = (analysis.anomalies?.length || 0) * 0.1;

  return Math.max(0, Math.min(1, ai * 0.35 + fmt * 0.25 + ocrScore * 0.2 + sig * 0.1 + quality * 0.1 - penalty));
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
  verifyDocument,
  deleteDocument
};
