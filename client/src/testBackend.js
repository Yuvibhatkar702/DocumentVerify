// Quick test to verify backend connection
const testBackend = async () => {
  try {
    const response = await fetch('http://localhost:50011/api/auth/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend connection successful:', data);
    } else {
      console.error('Backend connection failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Run test
testBackend();
