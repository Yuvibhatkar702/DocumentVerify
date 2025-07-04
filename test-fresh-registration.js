const axios = require('axios');

// Test with a different email to avoid conflicts
const testRegistration = async () => {
  try {
    console.log('Testing registration with fresh email...');
    
    const testUser = {
      name: 'John Doe',
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'Test123456'
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
    } else if (error.request) {
      console.error('No response received');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testRegistration();
