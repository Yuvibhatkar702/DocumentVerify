// Quick test script to create a test user and verify authentication
const jwt = require('jsonwebtoken');

// Test authentication setup
const createTestUser = () => {
  console.log('Creating test user data...');
  
  // Create a test JWT token (for testing purposes only)
  const testToken = jwt.sign(
    { 
      userId: '675d1234567890abcdef1234', // Mock user ID
      email: 'test@example.com',
      name: 'Test User'
    }, 
    'test-secret-key', // Using a test secret
    { expiresIn: '24h' }
  );
  
  console.log('Test token created:', testToken);
  
  // Instructions for the user
  console.log('\n=== AUTHENTICATION FIX INSTRUCTIONS ===');
  console.log('1. Copy the token above');
  console.log('2. Open browser Developer Tools (F12)');
  console.log('3. Go to Console tab');
  console.log('4. Run: localStorage.setItem("token", "' + testToken + '")');
  console.log('5. Refresh the page and try uploading again');
  console.log('\nAlternatively, you can:');
  console.log('- Register a new account');
  console.log('- Or login with existing credentials');
  console.log('=======================================\n');
  
  return testToken;
};

// Run the test
createTestUser();

module.exports = { createTestUser };
