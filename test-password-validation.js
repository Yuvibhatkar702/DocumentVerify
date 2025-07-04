// Test password validation
const testPassword = (password) => {
  console.log(`Testing password: "${password}"`);
  
  // Check password length
  if (password.length < 6) {
    console.log('❌ Password too short (minimum 6 characters)');
    return false;
  }
  
  // Check password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRegex.test(password)) {
    console.log('❌ Password must contain:');
    console.log('  - At least one uppercase letter (A-Z)');
    console.log('  - At least one lowercase letter (a-z)');
    console.log('  - At least one number (0-9)');
    
    // More detailed checks
    if (!/[a-z]/.test(password)) {
      console.log('  Missing: lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      console.log('  Missing: uppercase letter');
    }
    if (!/\d/.test(password)) {
      console.log('  Missing: number');
    }
    
    return false;
  }
  
  console.log('✅ Password meets all requirements');
  return true;
};

// Test common password patterns
console.log('=== PASSWORD VALIDATION TESTS ===\n');

// Test the passwords that might be used
testPassword('password'); // Common weak password
console.log('');
testPassword('Password'); // Missing number
console.log('');
testPassword('password123'); // Missing uppercase
console.log('');
testPassword('PASSWORD123'); // Missing lowercase
console.log('');
testPassword('Password123'); // Should work
console.log('');
testPassword('Test123456'); // Should work
console.log('');

// Test the exact password from the form
console.log('=== TESTING ACTUAL FORM PASSWORD ===');
// This is likely what's in the form based on the screenshot
const formPassword = '••••••'; // This is what's shown in the form
console.log('Note: The form shows dots (••••••) which suggests the password');
console.log('might not meet the complexity requirements.');
console.log('');
console.log('Suggested strong passwords:');
console.log('- Password123');
console.log('- Test123456');
console.log('- MyPass123');
console.log('- DocVerify1');
