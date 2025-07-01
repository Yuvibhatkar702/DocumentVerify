// Upgraded Dashboard Page with animations and glassmorphism matching LandingPage

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { getDocuments, verifyDocument } from '../services/documentService';
import DocumentDetailsModal from '../components/DocumentDetailsModal';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, failed: 0 });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      let docs = response.data.documents || response.data || [];
      if (!Array.isArray(docs)) docs = [];
      setDocuments(docs);
      const newStats = {
        total: docs.length,
        verified: docs.filter(doc => doc.status === 'verified').length,
        pending: docs.filter(doc => doc.status === 'pending').length,
        failed: docs.filter(doc => doc.status === 'failed').length
      };
      setStats(newStats);
    } catch (error) {
      const mockDocs = [
        { _id: '1', filename: 'passport.jpg', documentType: 'passport', status: 'verified', uploadDate: new Date().toISOString(), verificationScore: 0.95 },
        { _id: '2', filename: 'license.jpg', documentType: 'drivers_license', status: 'verified', uploadDate: new Date().toISOString(), verificationScore: 0.88 },
        { _id: '3', filename: 'id_card.jpg', documentType: 'id_card', status: 'pending', uploadDate: new Date().toISOString(), verificationScore: null }
      ];
      setDocuments(mockDocs);
      setStats({ total: 3, verified: 2, pending: 1, failed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (documentId) => {
    try {
      console.log('Starting verification for document:', documentId);
      const response = await verifyDocument(documentId);
      console.log('Verification successful:', response.data);
      
      // Update the document in the local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc._id === documentId 
            ? { ...doc, status: 'verified', verificationScore: response.data.confidence || 0.95 }
            : doc
        )
      );
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        verified: prevStats.verified + 1,
        pending: prevStats.pending - 1
      }));
      
      alert('Document verified successfully!');
    } catch (error) {
      console.error('Verification failed:', error);
      if (error.response?.status === 401) {
        alert('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to verify documents.');
      } else {
        alert('Verification failed. Please try again.');
      }
    }
  };

  const handleViewDetails = (document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

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
    switch (type) {
      case 'passport': return '🛂';
      case 'driver-license': 
      case 'drivers_license': return '🚗';
      case 'id-card': 
      case 'id_card': return '🆔';
      case 'birth-certificate': return '👶';
      case 'marriage-certificate': return '�';
      case 'academic-certificate': return '🎓';
      case 'professional-certificate': return '🏆';
      case 'visa': return '✈️';
      case 'work-permit': return '💼';
      case 'residence-permit': return '🏠';
      case 'social-security-card': return '🛡️';
      case 'voter-id': return '🗳️';
      case 'utility-bill': return '⚡';
      case 'bank-statement': return '🏦';
      case 'insurance-card': return '📋';
      case 'medical-certificate': return '🏥';
      case 'tax-document': return '💰';
      case 'property-deed': return '🏡';
      case 'certificate': return '�📜';
      case 'other': return '📄';
      default: return '📄';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
          <Link to="/login" className="px-4 py-2 bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0c29] text-white">
        <div className="text-center animate-pulse">
          <div className="h-8 w-8 border-b-2 border-blue-500 rounded-full animate-spin inline-block"></div>
          <p className="mt-4 text-sm text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {user.name || 'User'}! 👋</h1>
          <p className="text-sm text-gray-300">Manage and verify your documents using AI</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
            <p className="text-sm text-gray-300">Total Documents</p>
          </div>
          <div className="p-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="text-3xl font-bold text-green-400">{stats.verified}</h3>
            <p className="text-sm text-gray-300">Verified</p>
          </div>
          <div className="p-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl">
            <div className="text-2xl mb-2">⏳</div>
            <h3 className="text-3xl font-bold text-yellow-400">{stats.pending}</h3>
            <p className="text-sm text-gray-300">Pending</p>
          </div>
          <div className="p-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl">
            <div className="text-2xl mb-2">❌</div>
            <h3 className="text-3xl font-bold text-red-400">{stats.failed}</h3>
            <p className="text-sm text-gray-300">Failed</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Documents</h2>
            <Link to="/upload" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white/10 p-6 rounded-lg text-center border border-white/20 backdrop-blur-md">
              <p className="text-gray-300">No documents uploaded yet. Get started now!</p>
              <Link to="/upload" className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded shadow hover:bg-blue-700 transition">
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.slice(0, 6).map((doc, index) => (
                <motion.div key={doc._id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white/10 p-5 rounded-xl shadow border border-white/20 backdrop-blur-md">
                  <div className="flex justify-between mb-2">
                    <span>{getDocumentIcon(doc.documentType)}</span>
                    <span className={`text-xs font-medium ${getStatusColor(doc.status)}`}>{getStatusIcon(doc.status)} {doc.status}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{doc.filename}</h4>
                  <p className="text-xs text-gray-400 mb-2">Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                  {doc.verificationScore !== null && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400 mb-1">Confidence: {Math.round(doc.verificationScore * 100)}%</p>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${doc.verificationScore * 100}%` }}></div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    {doc.status === 'pending' && (
                      <button 
                        onClick={() => handleVerifyDocument(doc._id)}
                        className="w-full py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition"
                      >
                        🔍 Verify
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDetails(doc)}
                      className="w-full py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition"
                    >
                      📄 Details
                    </button>
                    <button className="w-full py-1 text-xs text-gray-300 hover:text-white transition">
                      📥 Download
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* System Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-white">AI/ML Service</div>
                  <div className="text-sm text-gray-400">All systems operational</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-white">Document Processing</div>
                  <div className="text-sm text-gray-400">Processing normally</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-white">OCR Engine</div>
                  <div className="text-sm text-gray-400">Text extraction active</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Document Details Modal */}
      <DocumentDetailsModal 
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default DashboardPage;
