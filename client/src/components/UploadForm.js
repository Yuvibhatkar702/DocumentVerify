import React, { useState } from 'react';
import { uploadDocument } from '../services/documentService';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');

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
      const response = await uploadDocument(file, documentType);
      onUploadSuccess(response.data);
      setFile(null);
      setDocumentType('');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group">
        <label htmlFor="documentType">Document Type:</label>
        <select
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          required
        >
          <option value="">Select Document Type</option>
          <option value="passport">Passport</option>
          <option value="id-card">ID Card</option>
          <option value="driver-license">Driver's License</option>
          <option value="certificate">Certificate</option>
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
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
};

export default UploadForm;
