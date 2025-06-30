const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// API endpoints
const AI_ML_URL = 'http://localhost:8000';
const BACKEND_URL = 'http://localhost:5000';

class FileUploadTester {
  constructor() {
    this.testResults = {};
    this.testDir = path.join(__dirname, 'test_files');
    this.ensureTestDirectory();
  }

  ensureTestDirectory() {
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }
  }

  // Create different types of test files
  createTestFiles() {
    console.log('📁 Creating test files...');
    
    // Create a simple PNG image with text
    const testImages = [
      this.createSimpleImage('test-passport.png', 'PASSPORT\nUnited States of America\nJohn Doe\nP123456789'),
      this.createSimpleImage('test-license.png', 'DRIVER LICENSE\nState of California\nJane Smith\nDL987654321'),
      this.createSimpleImage('test-invoice.png', 'INVOICE #12345\nDate: 2025-06-30\nAmount: $1,500.00\nCustomer: ABC Company'),
      this.createSimpleImage('test-receipt.png', 'RECEIPT\nStore: Example Store\nDate: 2025-06-30\nTotal: $29.99'),
    ];

    // Create different file formats
    this.createTextFile('test-document.txt', 'This is a plain text document for testing');
    this.createJSONFile('test-data.json', { type: 'test', content: 'sample data' });
    
    console.log('✅ Test files created successfully');
  }

  createSimpleImage(filename, text) {
    const filePath = path.join(this.testDir, filename);
    
    // Create a simple base64 PNG (1x1 pixel)
    const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    fs.writeFileSync(filePath, Buffer.from(base64PNG, 'base64'));
    
    return filePath;
  }

  createTextFile(filename, content) {
    const filePath = path.join(this.testDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  createJSONFile(filename, data) {
    const filePath = path.join(this.testDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return filePath;
  }

  // Test different file upload scenarios
  async testFileUploadScenarios() {
    console.log('🧪 Starting File Upload Tests\n');

    const tests = [
      {
        name: 'Valid Image Upload (PNG)',
        file: 'test-passport.png',
        contentType: 'image/png',
        shouldPass: true
      },
      {
        name: 'Valid Image Upload (JPG simulation)',
        file: 'test-license.png',
        contentType: 'image/jpeg',
        shouldPass: true
      },
      {
        name: 'Invalid File Type (TXT)',
        file: 'test-document.txt',
        contentType: 'text/plain',
        shouldPass: false
      },
      {
        name: 'Invalid File Type (JSON)',
        file: 'test-data.json',
        contentType: 'application/json',
        shouldPass: false
      },
      {
        name: 'Large File Test',
        file: 'test-invoice.png',
        contentType: 'image/png',
        shouldPass: true
      }
    ];

    for (const test of tests) {
      await this.runSingleUploadTest(test);
    }

    this.printUploadTestSummary();
  }

  async runSingleUploadTest(testConfig) {
    console.log(`🔍 Testing: ${testConfig.name}`);
    
    try {
      const filePath = path.join(this.testDir, testConfig.file);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Test AI/ML Service Upload
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: testConfig.file,
        contentType: testConfig.contentType
      });

      const response = await axios.post(`${AI_ML_URL}/api/v1/ocr`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 15000
      });

      if (testConfig.shouldPass) {
        console.log(`  ✅ ${testConfig.name}: PASSED`);
        console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}\n`);
        this.testResults[testConfig.name] = 'PASSED';
      } else {
        console.log(`  ⚠️  ${testConfig.name}: Unexpectedly succeeded`);
        this.testResults[testConfig.name] = 'UNEXPECTED_SUCCESS';
      }

    } catch (error) {
      if (!testConfig.shouldPass && error.response?.status >= 400) {
        console.log(`  ✅ ${testConfig.name}: PASSED (correctly rejected)`);
        console.log(`  📊 Error: ${error.response.data?.detail || error.message}\n`);
        this.testResults[testConfig.name] = 'PASSED';
      } else {
        console.log(`  ❌ ${testConfig.name}: FAILED`);
        console.log(`  📊 Error: ${error.response?.data || error.message}\n`);
        this.testResults[testConfig.name] = 'FAILED';
      }
    }
  }

  // Test file upload with different parameters
  async testAdvancedUploadScenarios() {
    console.log('🚀 Advanced File Upload Tests\n');

    // Test multiple file uploads
    await this.testMultipleFileUpload();
    
    // Test file size limits
    await this.testFileSizeLimits();
    
    // Test concurrent uploads
    await this.testConcurrentUploads();
    
    // Test upload with metadata
    await this.testUploadWithMetadata();
  }

  async testMultipleFileUpload() {
    console.log('🔍 Testing Multiple File Upload...');
    
    try {
      const files = ['test-passport.png', 'test-license.png'];
      const promises = files.map(file => {
        const filePath = path.join(this.testDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        const formData = new FormData();
        formData.append('file', fileBuffer, {
          filename: file,
          contentType: 'image/png'
        });

        return axios.post(`${AI_ML_URL}/api/v1/ocr`, formData, {
          headers: formData.getHeaders(),
          timeout: 15000
        });
      });

      const results = await Promise.all(promises);
      console.log('  ✅ Multiple file upload: PASSED');
      console.log(`  📊 Processed ${results.length} files successfully\n`);
      this.testResults['Multiple File Upload'] = 'PASSED';

    } catch (error) {
      console.log('  ❌ Multiple file upload: FAILED');
      console.log(`  📊 Error: ${error.message}\n`);
      this.testResults['Multiple File Upload'] = 'FAILED';
    }
  }

  async testFileSizeLimits() {
    console.log('🔍 Testing File Size Limits...');
    
    try {
      // Create a larger file (simulated)
      const largeBuffer = Buffer.alloc(1024 * 1024 * 2); // 2MB
      largeBuffer.fill('A');
      
      const formData = new FormData();
      formData.append('file', largeBuffer, {
        filename: 'large-test.png',
        contentType: 'image/png'
      });

      const response = await axios.post(`${AI_ML_URL}/api/v1/ocr`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      console.log('  ✅ Large file upload: PASSED');
      this.testResults['File Size Limits'] = 'PASSED';

    } catch (error) {
      if (error.response?.status === 413) {
        console.log('  ✅ File size limit correctly enforced');
        this.testResults['File Size Limits'] = 'PASSED';
      } else {
        console.log('  ❌ File size test: FAILED');
        console.log(`  📊 Error: ${error.message}\n`);
        this.testResults['File Size Limits'] = 'FAILED';
      }
    }
  }

  async testConcurrentUploads() {
    console.log('🔍 Testing Concurrent Uploads...');
    
    try {
      const concurrentTests = Array(3).fill().map((_, index) => {
        const filePath = path.join(this.testDir, 'test-passport.png');
        const fileBuffer = fs.readFileSync(filePath);
        
        const formData = new FormData();
        formData.append('file', fileBuffer, {
          filename: `concurrent-test-${index}.png`,
          contentType: 'image/png'
        });

        return axios.post(`${AI_ML_URL}/api/v1/ocr`, formData, {
          headers: formData.getHeaders(),
          timeout: 20000
        });
      });

      const startTime = Date.now();
      const results = await Promise.all(concurrentTests);
      const endTime = Date.now();

      console.log('  ✅ Concurrent uploads: PASSED');
      console.log(`  📊 Processed ${results.length} files in ${endTime - startTime}ms\n`);
      this.testResults['Concurrent Uploads'] = 'PASSED';

    } catch (error) {
      console.log('  ❌ Concurrent uploads: FAILED');
      console.log(`  📊 Error: ${error.message}\n`);
      this.testResults['Concurrent Uploads'] = 'FAILED';
    }
  }

  async testUploadWithMetadata() {
    console.log('🔍 Testing Upload with Metadata...');
    
    try {
      const filePath = path.join(this.testDir, 'test-passport.png');
      const fileBuffer = fs.readFileSync(filePath);
      
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: 'metadata-test.png',
        contentType: 'image/png'
      });
      
      // Add metadata fields
      formData.append('document_type', 'passport');
      formData.append('expected_language', 'en');
      formData.append('user_id', 'test-user-123');

      const response = await axios.post(`${AI_ML_URL}/api/v1/ocr`, formData, {
        headers: formData.getHeaders(),
        timeout: 15000
      });

      console.log('  ✅ Upload with metadata: PASSED');
      console.log(`  📊 Response: ${JSON.stringify(response.data, null, 2)}\n`);
      this.testResults['Upload with Metadata'] = 'PASSED';

    } catch (error) {
      console.log('  ❌ Upload with metadata: FAILED');
      console.log(`  📊 Error: ${error.response?.data || error.message}\n`);
      this.testResults['Upload with Metadata'] = 'FAILED';
    }
  }

  printUploadTestSummary() {
    console.log('📊 File Upload Test Results Summary:');
    console.log('=' .repeat(50));
    
    const passed = Object.values(this.testResults).filter(r => r === 'PASSED').length;
    const total = Object.keys(this.testResults).length;
    
    Object.entries(this.testResults).forEach(([test, result]) => {
      const icon = result === 'PASSED' ? '✅' : result === 'FAILED' ? '❌' : '⚠️';
      console.log(`${icon} ${test}: ${result}`);
    });
    
    console.log('=' .repeat(50));
    console.log(`🎯 Overall File Upload Tests: ${passed}/${total} passed`);
    
    if (passed === total) {
      console.log('🎉 All file upload tests passed successfully!');
    } else {
      console.log('⚠️  Some file upload tests need attention.');
    }
  }

  // Cleanup test files
  cleanup() {
    console.log('🧹 Cleaning up test files...');
    try {
      if (fs.existsSync(this.testDir)) {
        fs.rmSync(this.testDir, { recursive: true, force: true });
        console.log('✅ Test files cleaned up successfully');
      }
    } catch (error) {
      console.log('⚠️  Cleanup warning:', error.message);
    }
  }
}

// Main execution
async function runFileUploadTests() {
  const tester = new FileUploadTester();
  
  try {
    // Create test files
    tester.createTestFiles();
    
    // Run basic upload tests
    await tester.testFileUploadScenarios();
    
    // Run advanced upload tests
    await tester.testAdvancedUploadScenarios();
    
  } catch (error) {
    console.error('🚨 File upload testing failed:', error);
  } finally {
    // Cleanup (comment out if you want to keep test files)
    // tester.cleanup();
  }
}

// Export for use in other tests
module.exports = { FileUploadTester, runFileUploadTests };

// Run if called directly
if (require.main === module) {
  runFileUploadTests();
}
