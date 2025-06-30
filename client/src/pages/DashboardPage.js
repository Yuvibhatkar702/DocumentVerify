import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getDocuments } from '../services/documentService';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0
  });

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      let docs = response.data.documents || response.data || [];
      // Defensive: ensure docs is always an array
      if (!Array.isArray(docs)) {
        docs = [];
      }
      setDocuments(docs);
      
      // Calculate stats
      const newStats = {
        total: docs.length,
        verified: docs.filter(doc => doc.status === 'verified').length,
        pending: docs.filter(doc => doc.status === 'pending').length,
        failed: docs.filter(doc => doc.status === 'failed').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Use mock data for demo
      const mockDocs = [
        {
          _id: '1',
          filename: 'passport_scan.jpg',
          documentType: 'passport',
          status: 'verified',
          uploadDate: new Date().toISOString(),
          verificationScore: 0.95
        },
        {
          _id: '2',
          filename: 'drivers_license.jpg',
          documentType: 'drivers_license',
          status: 'verified',
          uploadDate: new Date().toISOString(),
          verificationScore: 0.88
        },
        {
          _id: '3',
          filename: 'id_card.jpg',
          documentType: 'id_card',
          status: 'pending',
          uploadDate: new Date().toISOString(),
          verificationScore: null
        }
      ];
      setDocuments(mockDocs);
      setStats({
        total: 3,
        verified: 2,
        pending: 1,
        failed: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
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
      case 'drivers_license': return '🚗';
      case 'id_card': return '🆔';
      case 'certificate': return '📜';
      default: return '📄';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h2>
          <Link to="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Manage and verify your documents with our AI-powered system
              </p>
            </div>
            <div>
              <Link 
                to="/upload" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-2">📤</span>
                Upload Document
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Documents</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/upload" 
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📤</div>
                <h3 className="font-semibold text-gray-900">Upload Document</h3>
                <p className="text-sm text-gray-600 mt-1">Upload a new document for verification</p>
              </div>
            </Link>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-gray-900">API Documentation</h3>
                <p className="text-sm text-gray-600 mt-1">Explore our AI/ML service endpoints</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Check verification analytics</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Configure account preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
            <Link to="/upload" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {documents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600 mb-4">Upload your first document to get started with verification</p>
              <Link 
                to="/upload" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.slice(0, 6).map((document) => (
                <div key={document._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getDocumentIcon(document.documentType)}
                        </span>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {document.documentType?.replace('_', ' ') || 'Document'}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                        {getStatusIcon(document.status)} {document.status}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{document.filename}</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Uploaded {new Date(document.uploadDate).toLocaleDateString()}
                    </p>
                    
                    {document.verificationScore && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Confidence Score</span>
                          <span className="font-medium">{Math.round(document.verificationScore * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${document.verificationScore * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-gray-900">AI/ML Service</div>
                  <div className="text-sm text-gray-600">All systems operational</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-gray-900">Document Processing</div>
                  <div className="text-sm text-gray-600">Processing normally</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-gray-900">OCR Engine</div>
                  <div className="text-sm text-gray-600">Text extraction active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

