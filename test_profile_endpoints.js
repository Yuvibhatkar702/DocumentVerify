// Test script for Profile & Settings endpoints
const API_BASE_URL = 'http://localhost:50011/api';

// Test data
const testUser = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '1234567890',
  company: 'Test Company',
  role: 'user'
};

let authToken = '';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  
  return data;
}

async function testEndpoints() {
  console.log('🚀 Testing Profile & Settings Endpoints');
  console.log('='.repeat(50));

  try {
    // Test 1: Register user
    console.log('\n1. Testing Registration...');
    try {
      const registerResponse = await makeRequest(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(testUser)
      });
      console.log('✅ Registration successful:', registerResponse.message);
    } catch (error) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, continuing with login...');
      } else {
        console.log('❌ Registration failed:', error.message);
      }
    }

    // Test 2: Login
    console.log('\n2. Testing Login...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    authToken = loginResponse.token;
    console.log('✅ Login successful, token received');

    // Set up authenticated requests
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // Test 3: Get Profile
    console.log('\n3. Testing Get Profile...');
    const profileResponse = await makeRequest(`${API_BASE_URL}/auth/profile`, {
      headers: authHeaders
    });
    console.log('✅ Profile retrieved:', profileResponse.user.firstName, profileResponse.user.lastName);

    // Test 4: Update Profile
    console.log('\n4. Testing Update Profile...');
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '9876543210',
      company: 'Updated Company'
    };
    
    const updateResponse = await makeRequest(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updateData)
    });
    console.log('✅ Profile updated successfully');

    // Test 5: Change Password
    console.log('\n5. Testing Change Password...');
    const newPassword = 'NewPassword123!';
    const passwordResponse = await makeRequest(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: testUser.password,
        newPassword: newPassword
      })
    });
    console.log('✅ Password changed successfully');

    // Test 6: Generate API Key
    console.log('\n6. Testing Generate API Key...');
    const apiKeyResponse = await makeRequest(`${API_BASE_URL}/auth/generate-api-key`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({})
    });
    console.log('✅ API Key generated:', apiKeyResponse.apiKey.substring(0, 10) + '...');

    // Test 7: Login with new password
    console.log('\n7. Testing Login with New Password...');
    const newLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: newPassword
      })
    });
    console.log('✅ Login with new password successful');

    console.log('\n🎉 All tests passed! Profile & Settings backend is working correctly.');
    console.log('\nNow you can test the frontend features:');
    console.log('1. Start the frontend: npm start (in client directory)');
    console.log('2. Open http://localhost:3000');
    console.log('3. Register/Login and test all Profile & Settings features');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Make sure the backend server is running on port 50011');
  }
}

// Run the tests
testEndpoints();
