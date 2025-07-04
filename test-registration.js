const axios = require('axios');

// Test registration endpoint
const testRegistration = async () => {
  try {
    console.log('Testing registration endpoint...');
    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123456',
      confirmPassword: 'Test123456'
    };
    
    console.log('Sending registration request:', {
      name: testUser.name,
      email: testUser.email,
      password: '***masked***'
    });
    
    const response = await axios.post('http://localhost:5001/api/auth/register', testUser);
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Test login endpoint
const testLogin = async () => {
  try {
    console.log('\nTesting login endpoint...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'Test123456'
    };
    
    console.log('Sending login request:', {
      email: loginData.email,
      password: '***masked***'
    });
    
    const response = await axios.post('http://localhost:5001/api/auth/login', loginData);
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run tests
const runTests = async () => {
  await testRegistration();
  setTimeout(async () => {
    await testLogin();
  }, 2000);
};

runTests();
