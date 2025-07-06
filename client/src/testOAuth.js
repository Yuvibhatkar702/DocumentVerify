// Test OAuth endpoints
const testOAuth = async () => {
  console.log('Testing OAuth endpoints...');
  
  try {
    // Test Google OAuth endpoint
    const googleResponse = await fetch('http://localhost:50011/api/auth/google', {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log('Google OAuth status:', googleResponse.status);
    console.log('Google OAuth redirect URL:', googleResponse.url);
    
    // Test GitHub OAuth endpoint
    const githubResponse = await fetch('http://localhost:50011/api/auth/github', {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log('GitHub OAuth status:', githubResponse.status);
    console.log('GitHub OAuth redirect URL:', githubResponse.url);
    
  } catch (error) {
    console.error('OAuth test error:', error);
  }
};

testOAuth();
