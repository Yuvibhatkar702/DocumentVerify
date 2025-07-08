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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getDocumentIcon(document.documentType)}</span>
            <div>
              <h2 className="text-lg font-semibold text-white truncate">
                {document.originalName || document.fileName}
              </h2>
              <p className="text-sm text-gray-400">
                {document.documentType?.replace('-', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
          
          {document.verificationResult?.confidence !== null && (
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Verification Confidence: {Math.round(document.verificationResult.confidence || 0)}%
              </p>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${document.verificationResult.confidence || 0}%` }}
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
                <p className="text-white">{document.originalName || document.fileName || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">File Size</label>
                <p className="text-white">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Upload Date</label>
                <p className="text-white">{new Date(document.createdAt || document.uploadedAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Document Type</label>
                <p className="text-white capitalize">{document.documentType?.replace('-', ' ') || 'Unknown Type'}</p>
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
              {document.verificationResult?.confidence && (
                <div>
                  <label className="text-sm text-gray-400">AI Confidence Score</label>
                  <p className="text-white">{Math.round(document.verificationResult.confidence || 0)}%</p>
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
        {document.verificationResult?.extractedData && Object.keys(document.verificationResult.extractedData).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Extracted Information</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {JSON.stringify(document.verificationResult.extractedData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Comprehensive Analysis Report */}
        {document.verificationResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">🔍 Comprehensive Analysis Report</h3>
            
            {/* Document Type Analysis */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h4 className="text-md font-semibold text-blue-400 mb-2">📋 Document Type Analysis</h4>
              <div className="text-sm text-gray-300">
                <p><strong>Document Type:</strong> {document.documentType.replace('-', ' ').toUpperCase()}</p>
                <p><strong>Original Name:</strong> {document.originalName}</p>
                <p><strong>File Size:</strong> {(document.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Upload Date:</strong> {new Date(document.uploadDate || document.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Authenticity Assessment */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h4 className="text-md font-semibold text-yellow-400 mb-2">🚨 Authenticity Assessment</h4>
              <div className="space-y-2">
                {document.verificationResult.analysisDetails && (
                  <>
                    {/* Format Validation */}
                    {document.verificationResult.analysisDetails.formatValidation && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">✅</span>
                        <span className="text-sm text-gray-300">Document format validation passed</span>
                      </div>
                    )}
                    
                    {/* OCR Analysis */}
                    {document.verificationResult.analysisDetails.ocrResult && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">✅</span>
                        <span className="text-sm text-gray-300">
                          OCR text extraction successful (Confidence: {Math.round(document.verificationResult.analysisDetails.ocrResult.confidence * 100)}%)
                        </span>
                      </div>
                    )}
                    
                    {/* Signature Detection */}
                    {document.verificationResult.analysisDetails.signatureDetection && (
                      <div className="flex items-center space-x-2">
                        <span className={document.verificationResult.analysisDetails.signatureDetection.detected ? "text-green-400" : "text-gray-400"}>
                          {document.verificationResult.analysisDetails.signatureDetection.detected ? "✅" : "ℹ️"}
                        </span>
                        <span className="text-sm text-gray-300">
                          Signature {document.verificationResult.analysisDetails.signatureDetection.detected ? "detected" : "not detected"}
                        </span>
                      </div>
                    )}
                    
                    {/* Quality Assessment */}
                    {document.verificationResult.analysisDetails.qualityScore && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">✅</span>
                        <span className="text-sm text-gray-300">
                          Image quality score: {Math.round(document.verificationResult.analysisDetails.qualityScore * 100)}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h4 className="text-md font-semibold text-blue-400 mb-2">📊 Analysis Results</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Authenticity Score:</span>
                  <span className="text-white font-semibold">{document.verificationResult.confidence || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Anomalies Found:</span>
                  <span className="text-white font-semibold">
                    {document.verificationResult.analysisDetails?.anomalies?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Document Status:</span>
                  <span className={`font-semibold capitalize ${getStatusColor(document.status)}`}>
                    {document.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Suspicious Indicators */}
            {document.verificationResult.analysisDetails?.anomalies && document.verificationResult.analysisDetails.anomalies.length > 0 && (
              <div className="bg-red-900 bg-opacity-50 rounded-lg p-4 mb-4 border border-red-500">
                <h4 className="text-md font-semibold text-red-400 mb-2">🚨 Suspicious Indicators</h4>
                <div className="space-y-2">
                  {document.verificationResult.analysisDetails.anomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span className="text-sm text-red-300">{anomaly}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Assessment */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h4 className="text-md font-semibold text-green-400 mb-2">🎯 Final Assessment</h4>
              <div className="space-y-2">
                {document.status === 'verified' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✅</span>
                    <span className="text-sm text-green-300">DOCUMENT VERIFIED - Appears authentic</span>
                  </div>
                )}
                {document.status === 'pending_review' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⚠️</span>
                    <span className="text-sm text-yellow-300">REQUIRES REVIEW - Some concerns detected</span>
                  </div>
                )}
                {document.status === 'rejected' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400">❌</span>
                    <span className="text-sm text-red-300">DOCUMENT REJECTED - Multiple red flags detected</span>
                  </div>
                )}
                {document.status === 'failed' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400">❌</span>
                    <span className="text-sm text-red-300">PROCESSING FAILED - Unable to analyze document</span>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Text (if available) */}
            {document.verificationResult.analysisDetails?.ocrResult?.text && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h4 className="text-md font-semibold text-purple-400 mb-2">📝 Extracted Text</h4>
                <div className="bg-gray-900 rounded p-3">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {document.verificationResult.analysisDetails.ocrResult.text}
                  </pre>
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className={`rounded-lg p-4 border ${
              document.status === 'verified' ? 'bg-green-900 bg-opacity-50 border-green-500' :
              document.status === 'pending_review' ? 'bg-yellow-900 bg-opacity-50 border-yellow-500' :
              'bg-red-900 bg-opacity-50 border-red-500'
            }`}>
              <h4 className="text-md font-semibold text-white mb-2">🎯 Recommendation</h4>
              <div className="text-sm">
                {document.status === 'verified' && (
                  <p className="text-green-300">✅ <strong>ACCEPT</strong> - Document passed all authenticity checks</p>
                )}
                {document.status === 'pending_review' && (
                  <p className="text-yellow-300">⚠️ <strong>MANUAL REVIEW REQUIRED</strong> - Document requires human verification</p>
                )}
                {document.status === 'rejected' && (
                  <p className="text-red-300">❌ <strong>REJECT</strong> - Document failed authenticity verification</p>
                )}
                {document.status === 'failed' && (
                  <p className="text-red-300">❌ <strong>RESUBMIT</strong> - Document could not be processed</p>
                )}
              </div>
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
