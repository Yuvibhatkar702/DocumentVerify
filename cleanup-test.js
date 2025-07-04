const mongoose = require('mongoose');
const User = require('./server/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/documentverify', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cleanupAndTest = async () => {
  try {
    console.log('Cleaning up test user...');
    
    // Delete the test user if it exists
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Test user deleted (if existed)');
    
    // Create a new test user
    console.log('Creating new test user...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123456'
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    
    // Test password comparison
    console.log('Testing password comparison...');
    const isValid = await testUser.comparePassword('Test123456');
    console.log('Password comparison result:', isValid);
    
    // Test with wrong password
    const isInvalid = await testUser.comparePassword('wrongpassword');
    console.log('Wrong password comparison result:', isInvalid);
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

cleanupAndTest();
