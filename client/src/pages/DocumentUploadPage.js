// DocumentUploadPage – Styled to match animated LandingPage with glassmorphism and drag/drop visibility fix

import React from 'react';
import UploadForm from '../components/UploadForm';
import { uploadDocument } from '../services/documentService';
import { useCategory } from '../contexts/CategoryContext';
import { motion } from 'framer-motion';

const DocumentUploadPage = () => {
  const { selectedCategory, getCategoryInfo } = useCategory();
  const categoryInfo = selectedCategory ? getCategoryInfo(selectedCategory) : null;
  
  const handleUpload = async (formData) => {
    try {
      const response = await uploadDocument(formData);
      console.log('Document uploaded:', response.data);
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4 py-10 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-500 opacity-20 rounded-full blur-2xl animate-ping z-0" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-2xl p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-10 text-white"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">
            🔒 {categoryInfo ? `Upload ${categoryInfo.name}` : 'Secure Document Upload'}
          </h1>
          <p className="text-gray-300 text-sm">
            {categoryInfo 
              ? `Upload your ${categoryInfo.description.toLowerCase()} for AI-powered verification`
              : 'Upload your documents for AI-powered verification and analysis'
            }
          </p>
          {categoryInfo && (
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20">
              <span className="text-lg mr-2">{categoryInfo.icon}</span>
              <span className="text-sm text-gray-300">Category: {categoryInfo.name}</span>
            </div>
          )}
        </div>

        {/* Security Features */}
        <div className="mb-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-2xl mb-1">🔐</div>
            <p className="text-xs text-gray-300">End-to-End Encrypted</p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-xs text-gray-300">AI-Powered Analysis</p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-gray-300">Real-time Processing</p>
          </div>
        </div>

        {/* Ensure drag-drop areas and lists inherit text color */}
        <div className="text-white">
          <UploadForm onUploadSuccess={handleUpload} />
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentUploadPage;
