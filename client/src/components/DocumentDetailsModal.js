import React from 'react';
import { motion } from 'framer-motion';

const DocumentDetailsModal = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getDocumentIcon = (type) => {
    const iconMap = {
      'passport': '🛂', 'driver-license': '🚗', 'id-card': '🆔',
      'birth-certificate': '👶', 'marriage-certificate': '💒',
      'academic-certificate': '🎓', 'professional-certificate': '🏆',
      'visa': '✈️', 'work-permit': '💼', 'residence-permit': '🏠',
      'social-security-card': '🛡️', 'voter-id': '🗳️', 'utility-bill': '⚡',
      'bank-statement': '🏦', 'insurance-card': '📋', 'medical-certificate': '🏥',
      'tax-document': '💰', 'property-deed': '🏡', 'other': '📄'
    };
    return iconMap[type] || '📄';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{getDocumentIcon(document.documentType)}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">{document.filename}</h2>
              <p className="text-gray-400 capitalize">{document.documentType.replace('-', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl p-2 hover:bg-gray-700 rounded-lg transition"
          >
            ×
          </button>
        </div>

        {/* Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className={`text-lg ${getStatusColor(document.status)}`}>
              {getStatusIcon(document.status)}
            </span>
            <span className={`font-semibold ${getStatusColor(document.status)} capitalize`}>
              {document.status}
            </span>
          </div>
          
          {document.verificationScore !== null && (
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Verification Confidence: {Math.round(document.verificationScore * 100)}%
              </p>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${document.verificationScore * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Document Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">Document Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Original Name</label>
                <p className="text-white">{document.originalName || document.filename}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">File Size</label>
                <p className="text-white">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Upload Date</label>
                <p className="text-white">{new Date(document.uploadDate || document.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Document Type</label>
                <p className="text-white capitalize">{document.documentType.replace('-', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">Verification Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <p className={`font-medium capitalize ${getStatusColor(document.status)}`}>
                  {document.status}
                </p>
              </div>
              {document.verificationScore && (
                <div>
                  <label className="text-sm text-gray-400">AI Confidence Score</label>
                  <p className="text-white">{Math.round(document.verificationScore * 100)}%</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400">Processing Time</label>
                <p className="text-white">
                  {document.status === 'pending' ? 'In Progress...' : '< 2 seconds'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Security Level</label>
                <p className="text-green-400">🔒 High Security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Information (if available) */}
        {document.extractedData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Extracted Information</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {JSON.stringify(document.extractedData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
            📥 Download
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
            📤 Share Report
          </button>
          {document.status === 'pending' && (
            <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition">
              🔍 Re-verify
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentDetailsModal;
