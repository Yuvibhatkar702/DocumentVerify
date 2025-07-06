// Simple test page to verify if OAuth routes are accessible
import React from 'react';

const TestOAuthPage = () => {
  const testGoogleRoute = () => {
    // This will show us if the route exists
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`)
      .then(response => {
        console.log('Google route response:', response);
        alert(`Google route exists! Status: ${response.status}`);
      })
      .catch(error => {
        console.error('Google route error:', error);
        alert(`Google route error: ${error.message}`);
      });
  };

  const testGithubRoute = () => {
    // This will show us if the route exists
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/github`)
      .then(response => {
        console.log('GitHub route response:', response);
        alert(`GitHub route exists! Status: ${response.status}`);
      })
      .catch(error => {
        console.error('GitHub route error:', error);
        alert(`GitHub route error: ${error.message}`);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">OAuth Route Test</h1>
        <div className="space-y-4">
          <button 
            onClick={testGoogleRoute}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Test Google Route
          </button>
          <button 
            onClick={testGithubRoute}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900"
          >
            Test GitHub Route
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestOAuthPage;
