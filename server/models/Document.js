const mongoose = require('mongoose');
const { expandedDocumentTypes } = require('../data/documentTypes');


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
  enum: expandedDocumentTypes  // ✅ use the full list here
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