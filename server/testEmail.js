// Test script to check email service
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailService() {
    console.log('Testing email service configuration...');
    
    // Check if environment variables are set
    console.log('Email User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('Email Password:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
    
    try {
        // Test connection
        const isConnected = await emailService.testConnection();
        console.log('Email service connection:', isConnected ? 'Success' : 'Failed');
        
        if (isConnected) {
            console.log('✅ Email service is configured correctly');
            console.log('You can now use the forgot password feature');
        } else {
            console.log('❌ Email service configuration failed');
            console.log('Please check your EMAIL_USER and EMAIL_PASSWORD in .env file');
        }
    } catch (error) {
        console.error('Error testing email service:', error.message);
    }
}

testEmailService();
