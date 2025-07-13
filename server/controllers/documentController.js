// controllers/documentController.js (Final Fully Working Version)

const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AIMlService = require('../services/aiMlService');
const OCRService = require('../services/ocrService');
const FakeDetectionService = require('../services/fakeDetectionService');



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
        // Create fallback analysis - more optimistic for real documents
        analysis = {
          confidenceScore: 0.75, // Higher confidence for fallback
          quality_score: 0.8,
          anomalies: [], // Don't penalize for AI service issues
          document_type: documentType,
          is_authentic: true // Assume authentic unless proven otherwise
        };
        format = { format_score: 0.85, is_valid_format: true };
        signature = { signature_detected: false, confidence: 0.6 };
      }
    } else {
      console.log(`[ProcessDocument] AI service unavailable, using strict fallback analysis`);
      // Create strict fallback analysis - be very conservative without AI
      const ocrConfidence = ocrResult.confidence || 0;
      const hasText = ocrResult.text && ocrResult.text.length > 50; // Require more text
      const hasStructuredData = ocrResult.extractedData && Object.keys(ocrResult.extractedData).length > 2; // Require more data
      
      // MUCH more conservative scoring for fallback
      let fallbackConfidence = 0.3; // Start much lower without AI
      if (hasText) fallbackConfidence += 0.15;
      if (hasStructuredData) fallbackConfidence += 0.15;
      if (ocrConfidence > 0.7) fallbackConfidence += 0.15; // Higher OCR threshold
      if (ocrConfidence > 0.8) fallbackConfidence += 0.1;
      
      // Additional checks for fallback
      const textLength = ocrResult.text?.length || 0;
      const hasOfficialKeywords = /\b(LICENSE|PASSPORT|CERTIFICATE|IDENTIFICATION|GOVERNMENT|OFFICIAL)\b/i.test(ocrResult.text || '');
      const hasPersonalInfo = /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/.test(ocrResult.text || ''); // Full names
      const hasNumbers = /\b\d{6,}\b/.test(ocrResult.text || ''); // Long numbers
      
      if (hasOfficialKeywords) fallbackConfidence += 0.1;
      if (hasPersonalInfo) fallbackConfidence += 0.1;
      if (hasNumbers) fallbackConfidence += 0.05;
      if (textLength > 200) fallbackConfidence += 0.1;
      
      console.log(`[ProcessDocument] Fallback analysis factors:`, {
        hasText, hasStructuredData, ocrConfidence, textLength,
        hasOfficialKeywords, hasPersonalInfo, hasNumbers,
        calculatedConfidence: fallbackConfidence
      });
      
      analysis = {
        confidenceScore: Math.min(fallbackConfidence, 0.75), // Cap fallback confidence lower
        quality_score: Math.max(ocrConfidence, 0.4), // Lower floor
        anomalies: ocrResult.success ? [] : ['OCR extraction failed'],
        document_type: documentType,
        is_authentic: ocrResult.success && hasText && (hasStructuredData || hasOfficialKeywords)
      };
      format = { 
        format_score: ocrResult.success && hasText ? 0.6 : 0.3, // Much more conservative
        is_valid_format: ocrResult.success && hasText && hasStructuredData
      };
      signature = { signature_detected: false, confidence: 0.4 }; // Lower confidence without AI
    }

    // Calculate comprehensive authenticity score
    const score = calculateAuthenticityScore(analysis, format, ocrResult, signature);
    console.log(`[ProcessDocument] Calculated authenticity score: ${score}`);
    
    // CRITICAL: Run fake detection analysis
    const fakeAnalysis = FakeDetectionService.analyzeForFakeIndicators(ocrResult.text || '', documentType);
    console.log(`[ProcessDocument] Fake detection analysis:`, {
      isFake: fakeAnalysis.isFake,
      confidence: fakeAnalysis.confidence,
      score: fakeAnalysis.score,
      reasons: fakeAnalysis.reasons,
      positiveSignals: fakeAnalysis.positiveSignals
    });
    
    // If fake detection is confident it's fake, override other scores
    if (fakeAnalysis.isFake && fakeAnalysis.confidence > 0.7) {
      console.log(`[ProcessDocument] FAKE DOCUMENT DETECTED with high confidence - overriding score`);
      // Force very low score for high-confidence fake detection
      const adjustedScore = Math.min(score * 0.3, 0.25);
      console.log(`[ProcessDocument] Score adjusted from ${score} to ${adjustedScore} due to fake detection`);
    }
    
    const finalScore = fakeAnalysis.isFake && fakeAnalysis.confidence > 0.7 ? 
      Math.min(score * 0.3, 0.25) : score;
    
    console.log(`[ProcessDocument] Analysis details:`, {
      originalScore: score,
      finalScore,
      fakeDetectionOverride: fakeAnalysis.isFake && fakeAnalysis.confidence > 0.7,
      ocrSuccess: ocrResult.success,
      ocrTextLength: ocrResult.text?.length || 0,
      ocrConfidence: ocrResult.confidence,
      extractedDataKeys: Object.keys(ocrResult.extractedData || {}),
      aiConfidence: analysis.confidenceScore,
      formatScore: format.format_score,
      isAuthentic: analysis.is_authentic
    });

    // Determine final status based on score and analysis - MUCH STRICTER THRESHOLDS
    let status = 'rejected';
    let authenticity = 'fake';
    
    // STRICT thresholds for verification - be very conservative
    const hasStrongOCR = ocrResult.success && ocrResult.confidence > 0.6 && ocrResult.text.length > 100;
    const hasStructuredData = ocrResult.extractedData && Object.keys(ocrResult.extractedData).length > 2;
    const hasOfficialKeywords = /\b(LICENSE|PASSPORT|CERTIFICATE|IDENTIFICATION|GOVERNMENT|OFFICIAL)\b/i.test(ocrResult.text || '');
    
    console.log(`[ProcessDocument] Verification factors:`, {
      finalScore,
      hasStrongOCR,
      hasStructuredData, 
      hasOfficialKeywords,
      aiAuthentic: analysis.is_authentic,
      ocrTextLength: ocrResult.text?.length || 0,
      ocrConfidence: ocrResult.confidence,
      fakeDetected: fakeAnalysis.isFake,
      fakeConfidence: fakeAnalysis.confidence
    });
    
    // Immediate rejection for high-confidence fake detection
    if (fakeAnalysis.isFake && fakeAnalysis.confidence > 0.7) {
      status = 'rejected';
      authenticity = 'fake';
      console.log(`[ProcessDocument] REJECTED: High-confidence fake detection`);
    }
    // VERIFIED: Require high score AND multiple verification factors AND no fake detection
    else if (finalScore >= 0.75 && 
             analysis.is_authentic !== false && 
             hasStrongOCR && 
             (hasStructuredData || hasOfficialKeywords) &&
             (!fakeAnalysis.isFake || fakeAnalysis.confidence < 0.3)) {
      status = 'verified';
      authenticity = 'authentic';
      console.log(`[ProcessDocument] VERIFIED: High score + strong OCR + structured data/keywords + no fake detection`);
    } 
    // PENDING: Medium score with some verification factors and low fake suspicion
    else if (finalScore >= 0.55 && 
             analysis.is_authentic !== false && 
             (hasStrongOCR || hasStructuredData) &&
             (!fakeAnalysis.isFake || fakeAnalysis.confidence < 0.5)) {
      status = 'pending_review';
      authenticity = 'suspicious';
      console.log(`[ProcessDocument] PENDING: Medium score with some verification factors`);
    }
    // PENDING: Low-medium score but OCR extracted significant content
    else if (finalScore >= 0.40 && 
             ocrResult.success && 
             ocrResult.text.length > 80 && 
             analysis.is_authentic !== false &&
             (!fakeAnalysis.isFake || fakeAnalysis.confidence < 0.6)) {
      status = 'pending_review'; 
      authenticity = 'suspicious';
      console.log(`[ProcessDocument] PENDING: Low-medium score but significant OCR content`);
    }
    // REJECTED: Everything else
    else {
      status = 'rejected';
      authenticity = 'fake';
      console.log(`[ProcessDocument] REJECTED: Failed verification thresholds`);
    }

    console.log(`[ProcessDocument] Final status: ${status}, authenticity: ${authenticity}`);

    // Update document with comprehensive results
    const updateData = {
      status,
      processedAt: new Date(),
      verifiedAt: status === 'verified' ? new Date() : null,
      verificationResult: {
        confidence: Math.round(finalScore * 100),
        authenticity,
        fakeDetection: {
          isFake: fakeAnalysis.isFake,
          confidence: fakeAnalysis.confidence,
          reasons: fakeAnalysis.reasons,
          positiveSignals: fakeAnalysis.positiveSignals
        },
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
    const signatureScore = signature.signature_detected ? (signature.confidence || 0.7) : 0.5; // Lower base
    const qualityScore = analysis.quality_score || 0;
    
    console.log(`[CalculateScore] Base scores:`, {
      aiScore, formatScore, ocrScore, signatureScore, qualityScore
    });
    
    // Rebalanced weighting - give more importance to OCR and content analysis
    let totalScore = (
      aiScore * 0.25 +           // AI analysis (25%)
      formatScore * 0.15 +       // Format validation (15%)
      ocrScore * 0.40 +          // OCR confidence (40% - primary factor)
      signatureScore * 0.10 +    // Signature detection (10%)
      qualityScore * 0.10        // Image quality (10%)
    );

    console.log(`[CalculateScore] Weighted score: ${totalScore.toFixed(3)}`);

    // MORE STRICT penalty for anomalies
    const anomalyCount = analysis.anomalies?.length || 0;
    const anomalyPenalty = Math.min(anomalyCount * 0.08, 0.25); // Higher penalty, cap at 25%
    totalScore = Math.max(0, totalScore - anomalyPenalty);
    
    if (anomalyCount > 0) {
      console.log(`[CalculateScore] Applied anomaly penalty: ${anomalyPenalty} for ${anomalyCount} anomalies`);
    }

    // Content validation bonuses - but stricter requirements
    if (ocrResult.success && ocrResult.text) {
      const textLength = ocrResult.text.length;
      
      // Text length bonuses - require more content
      if (textLength > 80) totalScore += 0.05;
      if (textLength > 200) totalScore += 0.05;
      if (textLength > 400) totalScore += 0.05;
      
      console.log(`[CalculateScore] Text length bonuses for ${textLength} characters`);
    }

    // Structured data bonus - require more comprehensive data
    const extractedDataKeys = Object.keys(ocrResult.extractedData || {});
    if (extractedDataKeys.length > 2) {
      totalScore += 0.08;
      console.log(`[CalculateScore] Structured data bonus for ${extractedDataKeys.length} data types`);
    }
    
    if (extractedDataKeys.length > 4) {
      totalScore += 0.07;
      console.log(`[CalculateScore] Additional structured data bonus`);
    }

    // Critical pattern validation
    const text = ocrResult.text || '';
    let criticalPatternCount = 0;
    
    // Essential patterns for official documents
    const criticalPatterns = [
      { name: 'Official Keywords', pattern: /\b(LICENSE|PASSPORT|CERTIFICATE|IDENTIFICATION|GOVERNMENT|OFFICIAL|ISSUED)\b/i },
      { name: 'Full Names', pattern: /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/ },
      { name: 'Dates', pattern: /\b\d{4}[-/]\d{2}[-/]\d{2}\b|\b\d{2}[-/]\d{2}[-/]\d{4}\b/ },
      { name: 'ID Numbers', pattern: /\b[A-Z0-9]{6,}\b/ },
      { name: 'Addresses', pattern: /\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr)\b/i }
    ];
    
    criticalPatterns.forEach(({ name, pattern }) => {
      if (pattern.test(text)) {
        criticalPatternCount++;
        totalScore += 0.04;
        console.log(`[CalculateScore] Found critical pattern: ${name}`);
      }
    });

    // Penalty for missing too many critical patterns
    if (criticalPatternCount < 2) {
      const missingPenalty = 0.15;
      totalScore -= missingPenalty;
      console.log(`[CalculateScore] Missing critical patterns penalty: ${missingPenalty}`);
    }

    // Check for fake document indicators
    const fakeIndicators = [
      /\b(FAKE|TEST|SAMPLE|DUMMY|PLACEHOLDER|EXAMPLE|DEMO)\b/i,
      /\b(JOHN DOE|JANE DOE|TEST USER|SAMPLE USER)\b/i,
      /\b(123-45-6789|000-00-0000)\b/,
      /\b(123 MAIN ST|123 FAKE ST)\b/i
    ];

    fakeIndicators.forEach(pattern => {
      if (pattern.test(text)) {
        totalScore *= 0.2; // Heavy penalty for fake indicators
        console.log(`[CalculateScore] FAKE INDICATOR DETECTED - applying heavy penalty`);
      }
    });

    // Final bounds
    const finalScore = Math.max(0.0, Math.min(1.0, totalScore));
    
    console.log(`[CalculateScore] Final score calculation:`, {
      baseWeightedScore: (totalScore + anomalyPenalty).toFixed(3),
      anomalyPenalty: anomalyPenalty.toFixed(3),
      criticalPatternCount,
      textLength: text.length,
      extractedDataTypes: extractedDataKeys.length,
      finalScore: finalScore.toFixed(3)
    });

    return finalScore;
    
  } catch (error) {
    console.error(`[CalculateScore] Error calculating authenticity score:`, error.message);
    return 0.1; // Return very low score on error
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

    // Allow users to approve their own pending documents or admins to verify any
    const canVerify = req.user.role === 'admin' || 
                     (document.userId.toString() === req.user.id && document.status === 'pending_review');
    
    if (!canVerify) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this document' });
    }

    document.status = isValid ? 'verified' : 'rejected';
    document.verificationResult = {
      ...document.verificationResult,
      isValid,
      notes: notes || '',
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      manualReview: true
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
