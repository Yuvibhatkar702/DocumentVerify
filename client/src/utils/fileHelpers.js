export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const validateDocumentFile = (file) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];
  
  const maxSizeInMB = 10;
  
  const errors = [];
  
  if (!isValidFileType(file, allowedTypes)) {
    errors.push('File type not supported. Please upload JPG, PNG, or PDF files.');
  }
  
  if (!isValidFileSize(file, maxSizeInMB)) {
    errors.push(`File size too large. Maximum size is ${maxSizeInMB}MB.`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
