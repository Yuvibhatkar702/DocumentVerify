const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn('Warning: MONGODB_URI not found in environment variables');
      console.warn('Using default local MongoDB URI: mongodb://localhost:27017/documentverify');
      process.env.MONGODB_URI = 'mongodb://localhost:27017/documentverify';
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Please ensure MongoDB is running or provide a valid MONGODB_URI');
    console.error('For development, you can:');
    console.error('1. Install MongoDB locally');
    console.error('2. Use MongoDB Atlas (cloud)');
    console.error('3. Update MONGODB_URI in .env file');
    
    // Don't exit in development, just warn
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing without database connection...');
      // Don't throw error in development to allow server to start
    }
  }
};

module.exports = connectDB;
