// Test script for Document Verification System APIs
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// API endpoints
const BACKEND_URL = 'http://localhost:5000';
const AI_ML_URL = 'http://localhost:8000';

// Test functions
async function testBackendHealth() {
    console.log('🔍 Testing Backend Health...');
    try {
        const response = await axios.get(`${BACKEND_URL}/api/health`);
        console.log('✅ Backend Health:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Backend Health Error:', error.message);
        return false;
    }
}

async function testAIMLHealth() {
    console.log('🔍 Testing AI/ML Service Health...');
    try {
        const response = await axios.get(`${AI_ML_URL}/`);
        console.log('✅ AI/ML Health:', response.data);
        return true;
    } catch (error) {
        console.log('❌ AI/ML Health Error:', error.message);
        return false;
    }
}

async function testUserRegistration() {
    console.log('🔍 Testing User Registration...');
    try {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpassword123'
        };
        
        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
        console.log('✅ User Registration:', response.data);
        return response.data.token;
    } catch (error) {
        console.log('❌ User Registration Error:', error.response?.data || error.message);
        return null;
    }
}

async function testUserLogin() {
    console.log('🔍 Testing User Login...');
    try {
        const loginData = {
            email: 'test@example.com',
            password: 'testpassword123'
        };
        
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, loginData);
        console.log('✅ User Login:', response.data);
        return response.data.token;
    } catch (error) {
        console.log('❌ User Login Error:', error.response?.data || error.message);
        return null;
    }
}

async function testTextExtraction() {
    console.log('🔍 Testing Text Extraction...');
    try {
        // Create a simple test request (without actual file for now)
        const testData = {
            text: "Sample document text for testing"
        };
        
        const response = await axios.post(`${AI_ML_URL}/extract-text`, testData);
        console.log('✅ Text Extraction:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Text Extraction Error:', error.response?.data || error.message);
        return false;
    }
}

async function testDocumentClassification() {
    console.log('🔍 Testing Document Classification...');
    try {
        const testData = {
            text: "This is a sample invoice document with amount $1000"
        };
        
        const response = await axios.post(`${AI_ML_URL}/classify-document`, testData);
        console.log('✅ Document Classification:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Document Classification Error:', error.response?.data || error.message);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Document Verification System Tests\n');
    
    const results = {
        backendHealth: await testBackendHealth(),
        aimlHealth: await testAIMLHealth(),
        userRegistration: await testUserRegistration(),
        userLogin: await testUserLogin(),
        textExtraction: await testTextExtraction(),
        documentClassification: await testDocumentClassification()
    };
    
    console.log('\n📊 Test Results Summary:');
    Object.entries(results).forEach(([test, result]) => {
        console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testBackendHealth,
    testAIMLHealth,
    testUserRegistration,
    testUserLogin,
    testTextExtraction,
    testDocumentClassification,
    runAllTests
};
