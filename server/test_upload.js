const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Test file upload to backend
async function testFileUpload() {
  try {
    console.log('Testing file upload to backend...');
    
    // Use one of the existing files in uploads folder
    const testFilePath = path.join(__dirname, '../uploads/document-1751628359289-27629353.jpeg');
    
    if (!fs.existsSync(testFilePath)) {
      console.error('Test file not found:', testFilePath);
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));
    formData.append('documentType', 'voter-id');
    
    console.log('Form data prepared');
    console.log('File path:', testFilePath);
    console.log('File exists:', fs.existsSync(testFilePath));
    
    // Make request (you'll need to replace with actual auth token)
    const response = await axios.post('http://localhost:50011/api/documents/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_AUTH_TOKEN' // Replace with real token
      }
    });
    
    console.log('Upload successful:', response.data);
    
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Just test the endpoint without auth for now
async function testEndpoint() {
  try {
    console.log('Testing endpoint availability...');
    const response = await axios.get('http://localhost:50011/api/documents', {
      headers: {
        'Authorization': 'Bearer fake-token' // This should give us a 401 but confirm endpoint works
      }
    });
    console.log('Endpoint response:', response.data);
  } catch (error) {
    console.log('Endpoint test result:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('✅ Endpoint is working (401 is expected without valid token)');
    } else {
      console.log('❌ Endpoint issue:', error.message);
    }
  }
}

// Run tests
testEndpoint();
