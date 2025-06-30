import React from 'react';
import UploadForm from '../components/UploadForm';
import { uploadDocument } from '../services/documentService';

const DocumentUploadPage = () => {
  const handleUpload = async (formData) => {
    try {
      const response = await uploadDocument(formData);
      console.log('Document uploaded:', response.data);
      // Handle successful upload, e.g., show a success message or refresh the document list
    } catch (error) {
      console.error('Error uploading document:', error);
      // Handle upload error, e.g., show an error message
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Upload a New Document</h1>
      <UploadForm onUploadSuccess={handleUpload} />
    </div>
  );
};

export default DocumentUploadPage;
