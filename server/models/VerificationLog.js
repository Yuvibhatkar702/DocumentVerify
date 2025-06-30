const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['upload', 'verify', 'approve', 'reject', 'reprocess']
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure', 'pending']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  errorMessage: {
    type: String
  },
  processingTime: {
    type: Number // in milliseconds
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
verificationLogSchema.index({ documentId: 1, createdAt: -1 });
verificationLogSchema.index({ userId: 1, createdAt: -1 });
verificationLogSchema.index({ action: 1 });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
