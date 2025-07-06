// Debug registration component - save this as a test file
import React, { useState } from 'react';

const DebugRegister = () => {
  const [result, setResult] = useState('');
  
  const testRegistration = async () => {
    setResult('Testing...');
    
    const testData = {
      name: 'Debug Test User',
      email: 'debug@test.com',
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
      role: 'general',
      termsAccepted: true
    };
    
    try {
      console.log('Sending request to:', 'http://localhost:50011/api/auth/register');
      console.log('With data:', testData);
      
      const response = await fetch('http://localhost:50011/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setResult(`✅ SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ ERROR: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('Request failed:', error);
      setResult(`❌ NETWORK ERROR: ${error.message}`);
    }
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Debug Registration Test</h2>
      <button onClick={testRegistration} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Test Registration
      </button>
      <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '20px', whiteSpace: 'pre-wrap' }}>
        {result}
      </pre>
    </div>
  );
};

export default DebugRegister;
