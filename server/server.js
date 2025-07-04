require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5001; // Changed default port to 5001

// Connect to MongoDB and start server
const startApp = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed, but continuing with server startup...');
    console.error('The app will work but database operations will fail');
  }
  
  startServer(PORT);
};

startApp();

// Function to start server with port fallback
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server URL: http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
};

// Start the server
startServer(PORT);
