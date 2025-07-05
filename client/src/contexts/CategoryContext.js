import React, { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

// Document type categorization - Extensible for future categories
export const DOCUMENT_CATEGORIES = {
  'identity': {
    name: 'ID Documents',
    description: 'Passport, ID card, license',
    icon: '🆔',
    color: 'blue',
    userTypes: ['all'], // visible to all users
    documentTypes: [
      'aadhar-card',
      'passport',
      'id-card',
      'driver-license',
      'social-security-card',
      'voter-id'
    ]
  },
  'certificates': {
    name: 'Certificates',
    description: 'Academic, professional docs',
    icon: '📋',
    color: 'green',
    userTypes: ['all'],
    documentTypes: [
      'birth-certificate',
      'marriage-certificate',
      'academic-certificate',
      'professional-certificate',
      'medical-certificate'
    ]
  },
  'school-certificates': {
    name: 'School Certificates',
    description: 'School records, diplomas',
    icon: '🎓',
    color: 'yellow',
    userTypes: ['student', 'admin'], // visible to students and admins
    documentTypes: [
      'school-diploma',
      'school-transcript',
      'school-leaving-certificate',
      'school-report-card',
      'school-attendance-certificate'
    ]
  },
  'college-transcripts': {
    name: 'College Transcripts',
    description: 'University records, degrees',
    icon: '📜',
    color: 'indigo',
    userTypes: ['student', 'graduate', 'admin'],
    documentTypes: [
      'college-transcript',
      'degree-certificate',
      'graduation-certificate',
      'college-marksheet',
      'college-enrollment-letter'
    ]
  },
  'internship-letters': {
    name: 'Internship Letters',
    description: 'Internship docs, references',
    icon: '💼',
    color: 'teal',
    userTypes: ['student', 'graduate', 'professional'],
    documentTypes: [
      'internship-letter',
      'internship-completion-certificate',
      'internship-recommendation-letter',
      'internship-offer-letter'
    ]
  },
  'employment-documents': {
    name: 'Employment Documents',
    description: 'Work permits, employment letters',
    icon: '👔',
    color: 'orange',
    userTypes: ['professional', 'admin'],
    documentTypes: [
      'employment-letter',
      'salary-certificate',
      'work-permit',
      'employment-contract',
      'job-offer-letter'
    ]
  },
  'other': {
    name: 'Other Documents',
    description: 'Bank statements, bills',
    icon: '📄',
    color: 'purple',
    userTypes: ['all'],
    documentTypes: [
      'utility-bill',
      'bank-statement',
      'insurance-card',
      'tax-document',
      'property-deed',
      'visa',
      'residence-permit',
      'other'
    ]
  }
};

// Document type display names - Extended for new categories
export const DOCUMENT_TYPE_NAMES = {
  'aadhar-card': 'Aadhar Card',
  'passport': 'Passport',
  'id-card': 'National ID Card',
  'driver-license': 'Driver\'s License',
  'birth-certificate': 'Birth Certificate',
  'marriage-certificate': 'Marriage Certificate',
  'academic-certificate': 'Academic Certificate',
  'professional-certificate': 'Professional Certificate',
  'visa': 'Visa',
  'work-permit': 'Work Permit',
  'residence-permit': 'Residence Permit',
  'social-security-card': 'Social Security Card',
  'voter-id': 'Voter ID',
  'utility-bill': 'Utility Bill',
  'bank-statement': 'Bank Statement',
  'insurance-card': 'Insurance Card',
  'medical-certificate': 'Medical Certificate',
  'tax-document': 'Tax Document',
  'property-deed': 'Property Deed',
  'other': 'Other Document',
  // New document types
  'school-diploma': 'School Diploma',
  'school-transcript': 'School Transcript',
  'school-leaving-certificate': 'School Leaving Certificate',
  'school-report-card': 'School Report Card',
  'school-attendance-certificate': 'School Attendance Certificate',
  'college-transcript': 'College Transcript',
  'degree-certificate': 'Degree Certificate',
  'graduation-certificate': 'Graduation Certificate',
  'college-marksheet': 'College Marksheet',
  'college-enrollment-letter': 'College Enrollment Letter',
  'internship-letter': 'Internship Letter',
  'internship-completion-certificate': 'Internship Completion Certificate',
  'internship-recommendation-letter': 'Internship Recommendation Letter',
  'internship-offer-letter': 'Internship Offer Letter',
  'employment-letter': 'Employment Letter',
  'salary-certificate': 'Salary Certificate',
  'employment-contract': 'Employment Contract',
  'job-offer-letter': 'Job Offer Letter'
};

export const CategoryProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allowedDocumentTypes, setAllowedDocumentTypes] = useState([]);
  const [userType, setUserType] = useState('all'); // default user type

  // Get user type from localStorage or context (can be extended)
  const getUserType = () => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      return storedUserType;
    }
    
    // Try to infer from user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const userData = parsedUser.user || parsedUser;
        return userData.userType || userData.role || 'all';
      } catch (e) {
        console.log('Error parsing user data:', e);
      }
    }
    
    return 'all';
  };

  // Get categories visible to the current user
  const getVisibleCategories = () => {
    const currentUserType = getUserType();
    const visibleCategories = {};
    
    Object.entries(DOCUMENT_CATEGORIES).forEach(([categoryId, category]) => {
      if (category.userTypes.includes('all') || category.userTypes.includes(currentUserType)) {
        visibleCategories[categoryId] = category;
      }
    });
    
    return visibleCategories;
  };

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = DOCUMENT_CATEGORIES[categoryId];
    if (category) {
      setAllowedDocumentTypes(category.documentTypes);
    } else {
      // If no category selected, allow all document types
      setAllowedDocumentTypes(Object.keys(DOCUMENT_TYPE_NAMES));
    }
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setAllowedDocumentTypes(Object.keys(DOCUMENT_TYPE_NAMES));
  };

  const getCategoryInfo = (categoryId) => {
    return DOCUMENT_CATEGORIES[categoryId] || null;
  };

  const getDocumentTypeName = (documentType) => {
    return DOCUMENT_TYPE_NAMES[documentType] || documentType;
  };

  const isDocumentTypeAllowed = (documentType) => {
    if (!selectedCategory) return true; // If no category selected, allow all
    return allowedDocumentTypes.includes(documentType);
  };

  const setUserTypeManually = (type) => {
    setUserType(type);
    localStorage.setItem('userType', type);
  };

  const value = {
    selectedCategory,
    allowedDocumentTypes,
    userType: getUserType(),
    selectCategory,
    clearCategory,
    getCategoryInfo,
    getDocumentTypeName,
    isDocumentTypeAllowed,
    setUserTypeManually,
    categories: getVisibleCategories(), // Only return categories visible to current user
    allCategories: DOCUMENT_CATEGORIES // Return all categories for admin purposes
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
