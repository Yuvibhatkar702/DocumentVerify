const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['passport', 'id-card', 'driver-license', 'certificate', 'other']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationResult: {
    isValid: {
      type: Boolean,
      default: null
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    },
    detectedText: {
      type: String,
      default: null
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    anomalies: [{
      type: String
    }],
    verifiedAt: {
      type: Date
    },
    verificationMethod: {
      type: String,
      enum: ['ai-ml', 'manual', 'hybrid'],
      default: 'ai-ml'
    }
  },
  notes: {
    type: String,
    default: ''
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ documentType: 1 });

module.exports = mongoose.model('Document', documentSchema);
