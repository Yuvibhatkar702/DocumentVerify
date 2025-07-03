const axios = require('axios');

async function testConnection() {
  console.log('Testing server connection...');
  
  try {
    // Test basic server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5001/api/health').catch(err => {
      console.log('Health endpoint not available, testing root...');
      return axios.get('http://localhost:5001/').catch(err2 => {
        throw new Error('Server not responding');
      });
    });
    
    console.log('✅ Server is responding');
    
    // Test auth endpoint
    console.log('2. Testing auth endpoint...');
    try {
      await axios.post('http://localhost:5001/api/auth/login', {
        email: 'test@test.com',
        password: 'wrongpassword'
      });
    } catch (authError) {
      if (authError.response && authError.response.status === 400) {
        console.log('✅ Auth endpoint is working (got expected 400 error)');
      } else {
        console.log('⚠️ Auth endpoint issue:', authError.message);
      }
    }
    
    // Test upload endpoint without auth (should get 401)
    console.log('3. Testing upload endpoint...');
    try {
      await axios.post('http://localhost:5001/api/documents/upload', {});
    } catch (uploadError) {
      if (uploadError.response && uploadError.response.status === 401) {
        console.log('✅ Upload endpoint is working (got expected 401 error)');
      } else {
        console.log('⚠️ Upload endpoint issue:', uploadError.message);
      }
    }
    
    console.log('\n=== Connection Test Complete ===');
    console.log('Server appears to be running correctly.');
    console.log('The upload issue might be related to:');
    console.log('1. Authentication token issues');
    console.log('2. File validation problems'); 
    console.log('3. CORS configuration');
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure the server is running: npm run dev (in server folder)');
    console.log('2. Check if port 5001 is in use: netstat -ano | findstr :5001');
    console.log('3. Verify MongoDB connection');
    console.log('4. Check server logs for errors');
  }
}

testConnection();
