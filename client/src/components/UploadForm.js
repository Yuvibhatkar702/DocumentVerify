import React, { useState } from 'react';
import { uploadDocument } from '../services/documentService';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const simulateVerificationProgress = () => {
    setCurrentStep('Uploading document...');
    setVerificationProgress(20);
    
    setTimeout(() => {
      setCurrentStep('Analyzing document structure...');
      setVerificationProgress(40);
    }, 800);
    
    setTimeout(() => {
      setCurrentStep('Extracting text with AI OCR...');
      setVerificationProgress(60);
    }, 1600);
    
    setTimeout(() => {
      setCurrentStep('Validating authenticity...');
      setVerificationProgress(80);
    }, 2400);
    
    setTimeout(() => {
      setCurrentStep('Generating verification report...');
      setVerificationProgress(95);
    }, 3200);
    
    setTimeout(() => {
      setCurrentStep('Verification complete!');
      setVerificationProgress(100);
    }, 4000);
    
    setTimeout(() => {
      setCurrentStep('Redirecting to dashboard...');
    }, 4500);
  };

  const resetForm = () => {
    setFile(null);
    setDocumentType('');
    setUploadSuccess(false);
    setVerificationProgress(0);
    setCurrentStep('');
    document.getElementById('file').value = '';
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !documentType) {
      alert('Please select a file and document type');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting upload...');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Document Type:', documentType);
      console.log('Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await uploadDocument(file, documentType);
      console.log('Upload successful:', response.data);
      
      // Show success state and start verification animation
      setUploadSuccess(true);
      simulateVerificationProgress();
      
      onUploadSuccess(response.data);
      // Reset file input
      document.getElementById('file').value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Server error occurred';
        const statusCode = error.response.status;
        alert(`Upload failed (${statusCode}): ${errorMessage}`);
        console.error('Server error:', error.response.data);
        console.error('Response status:', statusCode);
      } else if (error.request) {
        // Request was made but no response received
        alert('Upload failed: Cannot connect to server. Please check if the backend server is running on http://localhost:5000');
        console.error('Network error - no response received');
        console.error('Request details:', error.request);
      } else {
        // Something else happened
        alert(`Upload failed: ${error.message}`);
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form-container">
      {!uploadSuccess ? (
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="documentType">Document Type:</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              style={{ color: 'black' }}
            >
              <option value="" style={{ color: 'black' }}>Select Document Type</option>
              <option value="passport" style={{ color: 'black' }}>Passport</option>
              <option value="id-card" style={{ color: 'black' }}>National ID Card</option>
              <option value="driver-license" style={{ color: 'black' }}>Driver's License</option>
              <option value="birth-certificate" style={{ color: 'black' }}>Birth Certificate</option>
              <option value="marriage-certificate" style={{ color: 'black' }}>Marriage Certificate</option>
              <option value="academic-certificate" style={{ color: 'black' }}>Academic Certificate</option>
              <option value="professional-certificate" style={{ color: 'black' }}>Professional Certificate</option>
              <option value="visa" style={{ color: 'black' }}>Visa</option>
              <option value="work-permit" style={{ color: 'black' }}>Work Permit</option>
              <option value="residence-permit" style={{ color: 'black' }}>Residence Permit</option>
              <option value="social-security-card" style={{ color: 'black' }}>Social Security Card</option>
              <option value="voter-id" style={{ color: 'black' }}>Voter ID</option>
              <option value="utility-bill" style={{ color: 'black' }}>Utility Bill</option>
              <option value="bank-statement" style={{ color: 'black' }}>Bank Statement</option>
              <option value="insurance-card" style={{ color: 'black' }}>Insurance Card</option>
              <option value="medical-certificate" style={{ color: 'black' }}>Medical Certificate</option>
              <option value="tax-document" style={{ color: 'black' }}>Tax Document</option>
              <option value="property-deed" style={{ color: 'black' }}>Property Deed</option>
              <option value="other" style={{ color: 'black' }}>Other Document</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="file">Choose Document:</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              required
            />
            {file && (
              <p style={{ color: 'white', marginTop: '8px', fontSize: '14px' }}>
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      ) : (
        <div className="verification-progress">
          {/* Success Message */}
          <div className="success-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>
              <span className="success-icon">✅</span>
            </div>
            <h2 style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
              Document Uploaded Successfully!
            </h2>
            <p style={{ color: '#e5e7eb', fontSize: '1rem' }}>
              Your document is now being processed by our AI verification system
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '10px' 
            }}>
              <span style={{ color: '#e5e7eb', fontSize: '0.9rem' }}>Verification Progress</span>
              <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {verificationProgress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#374151',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${verificationProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Current Step */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '25px',
            padding: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <span className="loading-spinner" style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                border: '2px solid #374151',
                borderTop: '2px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
            <p style={{ color: '#e5e7eb', fontSize: '0.95rem', margin: 0 }}>
              {currentStep || 'Initializing verification...'}
            </p>
          </div>

          {/* Verification Steps */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#e5e7eb', fontSize: '1.1rem', marginBottom: '15px', textAlign: 'center' }}>
              Verification Process
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {[
                { step: '1', title: 'Document Analysis', icon: '🔍', done: verificationProgress >= 40 },
                { step: '2', title: 'AI OCR Processing', icon: '🤖', done: verificationProgress >= 60 },
                { step: '3', title: 'Authenticity Check', icon: '🛡️', done: verificationProgress >= 80 },
                { step: '4', title: 'Report Generation', icon: '📊', done: verificationProgress >= 100 }
              ].map((item) => (
                <div key={item.step} style={{
                  padding: '12px',
                  backgroundColor: item.done ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  border: `1px solid ${item.done ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                    {item.done ? '✅' : item.icon}
                  </div>
                  <p style={{ 
                    color: item.done ? '#10b981' : '#e5e7eb', 
                    fontSize: '0.8rem', 
                    margin: 0,
                    fontWeight: item.done ? 'bold' : 'normal'
                  }}>
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {verificationProgress >= 100 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                📊 View Dashboard
              </button>
              <button
                onClick={resetForm}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                📤 Upload Another
              </button>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .success-icon {
          animation: bounce 1s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default UploadForm;
