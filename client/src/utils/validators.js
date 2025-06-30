export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const field in rules) {
    const value = formData[field];
    const rule = rules[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    if (rule.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      continue;
    }
    
    if (rule.password && !validatePassword(value)) {
      errors[field] = 'Password must be at least 8 characters with uppercase, lowercase, and number';
      continue;
    }
    
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
      continue;
    }
  }
  
  return errors;
};
