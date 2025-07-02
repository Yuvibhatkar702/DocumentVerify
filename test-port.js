const express = require('express');
const app = express();

// Test server to verify port handling
const PORT = process.env.PORT || 5001;

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Port test successful!', 
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Function to start server with port fallback
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Test server running on port ${port}`);
    console.log(`🌐 Test URL: http://localhost:${port}/test`);
    console.log(`Press Ctrl+C to stop`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test server...');
    server.close(() => {
      console.log('✅ Test server stopped.');
      process.exit(0);
    });
  });
};

startServer(PORT);
