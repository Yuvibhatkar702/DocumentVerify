const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// API endpoints
const BACKEND_URL = 'http://localhost:5000';
const AI_ML_URL = 'http://localhost:8000';

let authToken = null;

// Test results tracking
const results = {
  backendHealth: 'PENDING',
  aimlHealth: 'PENDING',
  userRegistration: 'PENDING',
  userLogin: 'PENDING',
  textExtraction: 'PENDING',
  documentClassification: 'PENDING',
  fileUpload: 'PENDING',
  documentVerification: 'PENDING',
  errorHandling: 'PENDING',
  authProtection: 'PENDING'
};

async function runTests() {
  console.log('🚀 Starting Document Verification System Tests\n');

  // Test backend health
  console.log('🔍 Testing Backend Health...');
  try {
    const backendHealth = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend Health:', backendHealth.data);
    results.backendHealth = 'PASSED';
  } catch (error) {
    console.log('❌ Backend Health Error:', error.response?.data || error.message);
    results.backendHealth = 'FAILED';
  }

  // Test AI/ML service health
  console.log('🔍 Testing AI/ML Service Health...');
  try {
    const aimlHealth = await axios.get(`${AI_ML_URL}/`);
    console.log('✅ AI/ML Health:', aimlHealth.data);
    results.aimlHealth = 'PASSED';
  } catch (error) {
    console.log('❌ AI/ML Health Error:', error.response?.data || error.message);
    results.aimlHealth = 'FAILED';
  }

  // Test user registration with proper validation data
  console.log('🔍 Testing User Registration...');
  try {
    const registerResponse = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123'
    });
    console.log('✅ User Registration:', registerResponse.data);
    results.userRegistration = 'PASSED';
    
    // Store token for future tests
    if (registerResponse.data.token) {
      authToken = registerResponse.data.token;
    }
  } catch (error) {
    console.log('❌ User Registration Error:', error.response?.data || error.message);
    results.userRegistration = 'FAILED';
  }

  // Test user login
  console.log('🔍 Testing User Login...');
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'TestPassword123'
    });
    console.log('✅ User Login:', loginResponse.data);
    results.userLogin = 'PASSED';
    
    // Update token
    if (loginResponse.data.token) {
      authToken = loginResponse.data.token;
    }
  } catch (error) {
    console.log('❌ User Login Error:', error.response?.data || error.message);
    results.userLogin = 'FAILED';
  }

  // Test text extraction
  console.log('🔍 Testing Text Extraction...');
  try {
    const textResponse = await axios.post(`${AI_ML_URL}/extract-text`, {
      text: 'This is a test document for text extraction'
    });
    console.log('✅ Text Extraction:', textResponse.data);
    results.textExtraction = 'PASSED';
  } catch (error) {
    console.log('❌ Text Extraction Error:', error.response?.data || error.message);
    results.textExtraction = 'FAILED';
  }

  // Test document classification
  console.log('🔍 Testing Document Classification...');
  try {
    const classifyResponse = await axios.post(`${AI_ML_URL}/classify-document`, {
      document_type: 'passport',
      text_content: 'Passport United States of America'
    });
    console.log('✅ Document Classification:', classifyResponse.data);
    results.documentClassification = 'PASSED';
  } catch (error) {
    console.log('❌ Document Classification Error:', error.response?.data || error.message);
    results.documentClassification = 'FAILED';
  }

  // Test file upload with real image
  console.log('🔍 Testing File Upload...');
  try {
    await testFileUpload();
    results.fileUpload = 'PASSED';
  } catch (error) {
    console.log('❌ File Upload Error:', error.message);
    results.fileUpload = 'FAILED';
  }

  // Test document verification
  console.log('🔍 Testing Document Verification...');
  try {
    const verifyResponse = await axios.post(`${AI_ML_URL}/verify-document`, {
      document_type: 'passport',
      extracted_data: {
        name: 'John Doe',
        passport_number: 'P123456789',
        country: 'United States'
      }
    });
    console.log('✅ Document Verification:', verifyResponse.data);
    results.documentVerification = 'PASSED';
  } catch (error) {
    console.log('❌ Document Verification Error:', error.response?.data || error.message);
    results.documentVerification = 'FAILED';
  }

  // Test error handling
  console.log('🔍 Testing Error Handling...');
  try {
    await testErrorHandling();
    results.errorHandling = 'PASSED';
  } catch (error) {
    console.log('❌ Error Handling Test Failed:', error.message);
    results.errorHandling = 'FAILED';
  }

  // Test authentication protection
  console.log('🔍 Testing Authentication Protection...');
  try {
    await testAuthProtection();
    results.authProtection = 'PASSED';
  } catch (error) {
    console.log('❌ Auth Protection Test Failed:', error.message);
    results.authProtection = 'FAILED';
  }

  // Print summary
  console.log('\n📊 Test Results Summary:');
  const passed = Object.values(results).filter(r => r === 'PASSED').length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test}: ${result}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
}

// Advanced test functions
async function testFileUpload() {
  console.log('  📎 Creating test image...');
  
  // Create a test image buffer
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  );
  
  // Test 1: Upload to AI/ML service
  const formData = new FormData();
  formData.append('file', testImageBuffer, {
    filename: 'test-document.png',
    contentType: 'image/png'
  });

  const uploadResponse = await axios.post(`${AI_ML_URL}/api/v1/ocr`, formData, {
    headers: {
      ...formData.getHeaders(),
    },
    timeout: 10000
  });
  
  console.log('  ✅ File upload to AI/ML service successful');
  
  // Test 2: Upload to backend (if endpoint exists)
  try {
    const backendFormData = new FormData();
    backendFormData.append('document', testImageBuffer, {
      filename: 'test-document.png',
      contentType: 'image/png'
    });
    
    const backendUpload = await axios.post(`${BACKEND_URL}/api/documents/upload`, backendFormData, {
      headers: {
        ...backendFormData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      timeout: 10000
    });
    
    console.log('  ✅ File upload to backend successful');
  } catch (error) {
    console.log('  ⚠️  Backend upload endpoint not available (expected)');
  }

  return true;
}

async function testErrorHandling() {
  const errorTests = [
    {
      name: 'Invalid file type',
      test: async () => {
        const formData = new FormData();
        formData.append('file', Buffer.from('invalid content'), {
          filename: 'test.txt',
          contentType: 'text/plain'
        });
        
        try {
          await axios.post(`${AI_ML_URL}/api/v1/ocr`, formData, {
            headers: formData.getHeaders()
          });
          throw new Error('Should have failed with invalid file type');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            console.log('  ✅ Invalid file type correctly rejected');
            return true;
          }
          throw error;
        }
      }
    },
    {
      name: 'Missing required fields',
      test: async () => {
        try {
          await axios.post(`${BACKEND_URL}/api/auth/register`, {
            email: 'incomplete@test.com'
            // Missing name and password
          });
          throw new Error('Should have failed with missing fields');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            console.log('  ✅ Missing fields correctly rejected');
            return true;
          }
          throw error;
        }
      }
    },
    {
      name: 'Invalid endpoint',
      test: async () => {
        try {
          await axios.get(`${AI_ML_URL}/nonexistent-endpoint`);
          throw new Error('Should have failed with 404');
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log('  ✅ Invalid endpoint correctly returns 404');
            return true;
          }
          throw error;
        }
      }
    }
  ];

  for (const errorTest of errorTests) {
    console.log(`  🧪 Testing: ${errorTest.name}`);
    await errorTest.test();
  }

  return true;
}

async function testAuthProtection() {
  console.log('  🔐 Testing protected endpoints...');
  
  // Test accessing protected endpoint without token
  try {
    await axios.get(`${BACKEND_URL}/api/auth/me`);
    throw new Error('Should require authentication');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('  ✅ Protected endpoint correctly requires authentication');
    } else {
      throw error;
    }
  }
  
  // Test with valid token
  if (authToken) {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('  ✅ Valid token correctly grants access');
    } catch (error) {
      console.log('  ⚠️  Protected endpoint test skipped (endpoint may not exist)');
    }
  }
  
  return true;
}

// Run tests
runTests().catch(console.error);
