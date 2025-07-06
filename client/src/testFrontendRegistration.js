// Test frontend registration
const testFrontendRegistration = async () => {
  console.log('Testing frontend registration...');
  
  const testData = {
    name: 'Frontend Test User',
    email: 'frontend@test.com',
    password: 'TestPassword123',
    confirmPassword: 'TestPassword123',
    role: 'general',
    termsAccepted: true
  };
  
  try {
    const response = await fetch('http://localhost:50011/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data);
    } else {
      console.log('❌ Registration failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testFrontendRegistration();
