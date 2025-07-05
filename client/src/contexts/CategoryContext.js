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
      'voter-id',
      'driver-license',
      'pan-card',
      'ration-card',
      'student-id-card',
      'birth-certificate'
    ]
  },
  'certificates': {
    name: 'Certificates',
    description: 'Academic, professional docs',
    icon: '📋',
    color: 'green',
    userTypes: ['all'],
    documentTypes: [
      'course-completion-certificate',
      'diploma-certificate',
      'professional-certification',
      'language-certificate',
      'coding-certificate'
    ]
  },
  'school-certificates': {
    name: 'School Certificates',
    description: 'School records, diplomas',
    icon: '🎓',
    color: 'yellow',
    userTypes: ['student', 'admin'], // visible to students and admins
    documentTypes: [
      '10th-marksheet',
      '12th-marksheet',
      'transfer-certificate',
      'bonafide-certificate-school',
      'character-certificate',
      'school-leaving-certificate'
    ]
  },
  'college-transcripts': {
    name: 'College Transcripts',
    description: 'University records, degrees',
    icon: '📜',
    color: 'indigo',
    userTypes: ['student', 'graduate', 'admin'],
    documentTypes: [
      'semester-marksheet',
      'provisional-certificate',
      'degree-certificate',
      'transcript-of-records',
      'bonafide-certificate-college',
      'consolidated-marksheet'
    ]
  },
  'internship-letters': {
    name: 'Internship Letters',
    description: 'Internship docs, references',
    icon: '💼',
    color: 'teal',
    userTypes: ['student', 'graduate', 'professional'],
    documentTypes: [
      'internship-offer-letter',
      'internship-completion-certificate',
      'letter-of-recommendation',
      'company-work-letter',
      'stipend-letter'
    ]
  },
  'government-certificates': {
    name: 'Government Issued Certificates',
    description: 'Government documents, category certificates',
    icon: '🏛️',
    color: 'red',
    userTypes: ['student', 'admin', 'all'],
    documentTypes: [
      'caste-certificate',
      'domicile-certificate',
      'income-certificate',
      'ews-certificate',
      'non-creamy-layer-certificate',
      'disability-certificate',
      'nationality-certificate',
      'minority-certificate'
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
      'bank-passbook-copy',
      'hostel-admission-slip',
      'utility-bill',
      'health-report',
      'rent-agreement',
      'travel-pass',
      'insurance-card'
    ]
  }
};

// Document type display names - Extended for new categories
export const DOCUMENT_TYPE_NAMES = {
  // ID Documents
  'aadhar-card': 'Aadhar Card',
  'passport': 'Passport',
  'voter-id': 'Voter ID',
  'driver-license': 'Driving License',
  'pan-card': 'PAN Card',
  'ration-card': 'Ration Card',
  'student-id-card': 'Student ID Card',
  'birth-certificate': 'Birth Certificate',
  
  // Certificates
  'course-completion-certificate': 'Course Completion Certificate',
  'diploma-certificate': 'Diploma Certificate',
  'professional-certification': 'Professional Certification (AWS, Google, Coursera, etc.)',
  'language-certificate': 'Language Certificate (IELTS, TOEFL)',
  'coding-certificate': 'Coding Certificate (HackerRank, etc.)',
  
  // School Certificates
  '10th-marksheet': '10th Marksheet',
  '12th-marksheet': '12th Marksheet',
  'transfer-certificate': 'Transfer Certificate (TC)',
  'bonafide-certificate-school': 'Bonafide Certificate (School)',
  'character-certificate': 'Character Certificate',
  'school-leaving-certificate': 'School Leaving Certificate',
  
  // College Transcripts
  'semester-marksheet': 'Semester-wise Mark Sheets',
  'provisional-certificate': 'Provisional Certificate',
  'degree-certificate': 'Degree Certificate',
  'transcript-of-records': 'Transcript of Records',
  'bonafide-certificate-college': 'Bonafide Certificate (College)',
  'consolidated-marksheet': 'Consolidated Marksheet',
  
  // Internship Letters
  'internship-offer-letter': 'Internship Offer Letter',
  'internship-completion-certificate': 'Internship Completion Certificate',
  'letter-of-recommendation': 'Letter of Recommendation (LOR)',
  'company-work-letter': 'Company Work Letter',
  'stipend-letter': 'Stipend Letter',
  
  // Government Issued Certificates
  'caste-certificate': 'Caste Certificate (SC/ST/OBC)',
  'domicile-certificate': 'Domicile Certificate',
  'income-certificate': 'Income Certificate',
  'ews-certificate': 'EWS Certificate',
  'non-creamy-layer-certificate': 'Non-Creamy Layer Certificate (for OBC)',
  'disability-certificate': 'Disability Certificate (PWD)',
  'nationality-certificate': 'Nationality Certificate',
  'minority-certificate': 'Minority Certificate',
  
  // Employment Documents
  'employment-letter': 'Employment Letter',
  'salary-certificate': 'Salary Certificate',
  'work-permit': 'Work Permit',
  'employment-contract': 'Employment Contract',
  'job-offer-letter': 'Job Offer Letter',
  
  // Other Documents
  'bank-passbook-copy': 'Bank Passbook Copy',
  'hostel-admission-slip': 'Hostel Admission Slip',
  'utility-bill': 'Utility Bills (Electricity, Internet)',
  'health-report': 'Health Reports or Medical Certificate',
  'rent-agreement': 'Rent Agreement',
  'travel-pass': 'Travel Pass',
  'insurance-card': 'Insurance Card',
  
  // Legacy support
  'other': 'Other Document'
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
