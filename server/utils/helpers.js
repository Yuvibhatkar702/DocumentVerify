const crypto = require('crypto');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate hash
const generateHash = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

// Generate HMAC
const generateHMAC = (data, secret, algorithm = 'sha256') => {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
};

// Encrypt data
const encrypt = (text, secretKey) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
};

// Decrypt data
const decrypt = (encryptedData, secretKey, iv) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Generate API key
const generateApiKey = () => {
  return 'dvs_' + generateRandomString(32);
};

// Validate API key format
const validateApiKey = (apiKey) => {
  const pattern = /^dvs_[a-f0-9]{64}$/;
  return pattern.test(apiKey);
};

// Generate document ID
const generateDocumentId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `doc_${timestamp}_${random}`;
};

// Generate verification code
const generateVerificationCode = (length = 6) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check password strength
const checkPasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  
  let score = 0;
  if (password.length >= minLength) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumbers) score++;
  if (hasNonalphas) score++;
  
  const strength = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
    5: 'Very Strong'
  };
  
  return {
    score,
    strength: strength[score],
    isValid: score >= 3
  };
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `${sanitizeFilename(baseName)}_${timestamp}_${random}.${extension}`;
};

module.exports = {
  generateRandomString,
  generateHash,
  generateHMAC,
  encrypt,
  decrypt,
  generateApiKey,
  validateApiKey,
  generateDocumentId,
  generateVerificationCode,
  checkPasswordStrength,
  sanitizeFilename,
  generateUniqueFilename
};
