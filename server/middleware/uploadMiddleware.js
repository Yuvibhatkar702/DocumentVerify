const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('=== MULTER FILE FILTER ===');
  console.log('File filter checking file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    fieldname: file.fieldname,
    encoding: file.encoding
  });
  console.log('Request headers in filter:', req.headers);
  console.log('=== END FILE FILTER DEBUG ===');
  
  // Allowed file types - expanded list
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'application/pdf'
  ];

  // Also check file extension as backup
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.tiff', '.bmp'];
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('File rejected - Invalid type:', file.mimetype, 'Extension:', fileExt);
    cb(new Error(`Invalid file type "${file.mimetype}". Allowed types: Images (JPEG, PNG, GIF, WebP, TIFF, BMP) and PDF files.`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const uploadErrorHandler = (error, req, res, next) => {
  console.error('=== MULTER ERROR HANDLER ===');
  console.error('Multer error:', error);
  console.error('Error type:', error.constructor.name);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Request file:', req.file);
  console.error('Request body:', req.body);
  console.error('Request headers:', req.headers);
  console.error('=== END ERROR HANDLER DEBUG ===');
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Use "document" as the field name.'
      });
    }
  } else if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  return res.status(400).json({
    success: false,
    message: 'Upload error: ' + error.message
  });
};

module.exports = upload;
module.exports.uploadErrorHandler = uploadErrorHandler;
module.exports.uploadErrorHandler = uploadErrorHandler;
