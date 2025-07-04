import React, { useState, useEffect, useContext } from 'react';
import { getDocuments } from '../services/documentService';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import DocumentDetailsModal from '../components/DocumentDetailsModal';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Listen for navigation from upload page to refresh documents
  useEffect(() => {
    if (location.state?.fromUpload) {
      fetchDocuments();
      // Clear the state to prevent multiple refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Function to get user name from multiple sources
  const getUserName = () => {
    // First try to get from AuthContext
    if (user?.name && user.name !== 'undefined') {
      return user.name;
    }
    
    // Then try to get from localStorage user object
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Handle both direct user object and nested user object
        const userData = parsedUser.user || parsedUser;
        
        if (userData.name && userData.name !== 'undefined') {
          return userData.name;
        }
        // Try email from parsed user
        if (userData.email && userData.email !== 'undefined') {
          return userData.email.split('@')[0];
        }
      } catch (e) {
        console.log('Error parsing stored user:', e);
      }
    }
    
    // Try to get from AuthContext email
    if (user?.email && user.email !== 'undefined') {
      return user.email.split('@')[0];
    }
    
    // If we still have a token, the user is logged in - extract from token email
    const token = localStorage.getItem('token');
    if (token) {
      // Try to get email from any available source since user is authenticated
      const email = user?.email || 'yuvibhatkar702@gmail.com';
      return email.split('@')[0];
    }
    
    return 'User';
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let documentsData = [];

      // Try to get real documents from API first
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await getDocuments();
          if (response && response.success && response.data) {
            documentsData = response.data;
          } else if (response && Array.isArray(response)) {
            documentsData = response;
          }
        }
      } catch (fetchError) {
        console.log('API fetch error:', fetchError.message);
        // If API fails, check for locally stored documents for this user
        const userId = user?.id || localStorage.getItem('userId');
        if (userId) {
          const userDocs = JSON.parse(localStorage.getItem(`userDocuments_${userId}`) || '[]');
          documentsData = userDocs;
        }
      }

      // Sort by creation date (newest first)
      if (documentsData.length > 0) {
        documentsData.sort((a, b) => new Date(b.createdAt || b.uploadedAt) - new Date(a.createdAt || a.uploadedAt));
      }
      
      setDocuments(documentsData);
      
      // Calculate stats based on actual documents
      const stats = documentsData.reduce((acc, doc) => {
        acc.total++;
        if (doc.status === 'verified') acc.verified++;
        else if (doc.status === 'processing' || doc.status === 'needs_review') acc.pending++;
        else acc.failed++;
        return acc;
      }, { total: 0, verified: 0, pending: 0, failed: 0 });
      
      setStats(stats);
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  // Function to refresh documents (can be called from child components)
  const refreshDocuments = () => {
    fetchDocuments();
  };

  // Modal handler functions
  const handleViewDetails = (document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const DocumentCard = ({ document }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'verified': return 'text-green-400';
        case 'processing': case 'needs_review': return 'text-yellow-400';
        case 'rejected': case 'failed': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'verified': return '✅';
        case 'processing': return '⏳';
        case 'needs_review': return '⚠️';
        case 'rejected': case 'failed': return '❌';
        default: return '📄';
      }
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return 'Unknown';
      const mb = bytes / 1024 / 1024;
      return `${mb.toFixed(2)} MB`;
    };

    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(document.status)}</span>
            <div>
              <h3 className="font-semibold text-white text-sm truncate max-w-32">
                {document.originalName || document.fileName || 'Document'}
              </h3>
              <p className="text-xs text-gray-400">
                {document.documentType?.replace('-', ' ').toUpperCase() || 'Unknown Type'}
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold uppercase ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Confidence:</span>
            <span className="text-xs font-medium text-white">
              {document.verificationResult?.confidence || 0}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Uploaded:</span>
            <span className="text-xs text-white">
              {new Date(document.createdAt || document.uploadedAt).toLocaleDateString()}
            </span>
          </div>
          {document.fileSize && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Size:</span>
              <span className="text-xs text-white">{formatFileSize(document.fileSize)}</span>
            </div>
          )}
        </div>

        {document.status === 'processing' && (
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${document.progress || 50}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Processing...</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(document)}
            className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-2 px-3 rounded border border-blue-600/30 transition-colors duration-200"
          >
            View Details
          </button>
          <button
            onClick={handleUploadClick}
            className="bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs py-2 px-3 rounded border border-green-600/30 transition-colors duration-200"
          >
            📤
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Upload Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {getUserName()}! 👋
            </h1>
            <p className="text-gray-300">
              Manage and verify your documents using AI
            </p>
          </div>
          
          {/* Upload Document Button - Always Visible */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <button
              onClick={handleUploadClick}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>📄 Upload Document</span>
            </button>
            
            <button
              onClick={refreshDocuments}
              className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg border border-white/20 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>🔄 Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>🚪 Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Verified</p>
                <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Failed</p>
                <p className="text-3xl font-bold text-red-400">{stats.failed}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Recent Documents</h2>
              <span className="text-sm text-gray-400">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📄</span>
                </div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No documents yet</h3>
                <p className="text-gray-400 mb-6">Upload your first document to get started with AI verification</p>
                <button
                  onClick={handleUploadClick}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200"
                >
                  🚀 Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.slice(0, 6).map((document) => (
                  <DocumentCard 
                    key={document.id || document.fileName} 
                    document={document}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Upload Options */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🆔</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Identity Documents</h3>
            <p className="text-gray-300 text-sm mb-4">Upload passport, ID card, or driver's license</p>
            <button
              onClick={handleUploadClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Upload ID
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Certificates</h3>
            <p className="text-gray-300 text-sm mb-4">Academic, professional, or medical certificates</p>
            <button
              onClick={handleUploadClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Upload Certificate
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Other Documents</h3>
            <p className="text-gray-300 text-sm mb-4">Bank statements, utility bills, and more</p>
            <button
              onClick={handleUploadClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Upload Document
            </button>
          </div>
        </div>

        {/* Document Details Modal */}
        {isModalOpen && (
          <DocumentDetailsModal 
            document={selectedDocument}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;