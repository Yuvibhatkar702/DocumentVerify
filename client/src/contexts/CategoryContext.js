import React, { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

// Document type categorization - Comprehensive for General users
export const DOCUMENT_CATEGORIES = {
  'identity': {
    name: 'ID Documents',
    description: '📄 Documents to prove identity',
    icon: '🆔',
    color: 'blue',
    documentTypes: [
      'aadhar-card',
      'pan-card',
      'voter-id',
      'passport',
      'driving-license',
      'ration-card',
      'npr-id',
      'social-security-id',
      'employee-id-card',
      'student-id-card',
      'senior-citizen-card',
      'visa',
      'oci-pio-card',
      'other-id-document'
    ]
  },
  'educational': {
    name: 'Educational Certificates',
    description: '📄 Academic records and proofs',
    icon: '🎓',
    color: 'green',
    documentTypes: [
      'ssc-10th-marksheet',
      'hsc-12th-marksheet',
      'diploma-certificate',
      'bachelors-degree',
      'masters-degree',
      'provisional-certificate',
      'migration-certificate',
      'character-certificate',
      'transfer-certificate',
      'bonafide-certificate',
      'admit-card',
      'hall-ticket',
      'entrance-exam-result',
      'internship-completion-certificate',
      'mooc-online-course-certificate',
      'other-educational-document'
    ]
  },
  'government-certificates': {
    name: 'Government Issued Certificates',
    description: '📄 Documents issued by govt authorities',
    icon: '🏛️',
    color: 'indigo',
    documentTypes: [
      'caste-certificate',
      'income-certificate',
      'domicile-certificate',
      'birth-certificate',
      'death-certificate',
      'disability-certificate',
      'ews-certificate',
      'marriage-certificate',
      'police-character-certificate',
      'gazette-name-change-certificate',
      'adoption-certificate',
      'legal-heir-certificate',
      'obc-sc-st-certificate',
      'other-govt-issued-certificate'
    ]
  },
  'financial': {
    name: 'Financial Documents',
    description: '📄 Income, banking, and financial data',
    icon: '💰',
    color: 'yellow',
    documentTypes: [
      'bank-passbook',
      'bank-statement',
      'salary-slip',
      'form-16',
      'income-tax-return',
      'pf-account-details',
      'loan-approval-letter',
      'emi-schedule',
      'credit-card-statement',
      'investment-proof',
      'uan-epfo-slip',
      'digital-payment-receipt',
      'other-financial-document'
    ]
  },
  'address-proof': {
    name: 'Address Proof',
    description: '📄 Residential verification documents',
    icon: '🏠',
    color: 'purple',
    documentTypes: [
      'aadhar-card-address',
      'voter-id-address',
      'passport-address',
      'electricity-bill',
      'water-bill',
      'gas-bill',
      'property-tax-receipt',
      'rent-agreement',
      'telephone-landline-bill',
      'registered-sale-deed',
      'bank-passbook-address',
      'ration-card-address',
      'other-address-proof'
    ]
  },
  'employment': {
    name: 'Employment Documents',
    description: '📄 Work-related proofs',
    icon: '💼',
    color: 'orange',
    documentTypes: [
      'offer-letter',
      'appointment-letter',
      'experience-letter',
      'relieving-letter',
      'salary-certificate',
      'employment-agreement',
      'joining-report',
      'noc-certificate',
      'promotion-letter',
      'appraisal-letter',
      'internship-letter',
      'employment-id',
      'other-work-document'
    ]
  },
  'medical': {
    name: 'Medical Documents',
    description: '📄 Health, insurance, and treatment documents',
    icon: '🏥',
    color: 'red',
    documentTypes: [
      'medical-report',
      'covid-vaccination-certificate',
      'covid-test-report',
      'health-card',
      'insurance-policy',
      'insurance-claim-report',
      'doctor-prescription',
      'discharge-summary',
      'opd-slip',
      'disability-certificate-medical',
      'blood-group-card',
      'other-medical-document'
    ]
  },
  'other': {
    name: 'Other Documents',
    description: '📄 Any miscellaneous or unclassified documents',
    icon: '📄',
    color: 'gray',
    documentTypes: [
      'affidavit',
      'notarized-documents',
      'self-declaration',
      'non-employment-agreements',
      'court-orders',
      'legal-notices',
      'school-leaving-certificate',
      'hostel-form',
      'club-ngo-membership-card',
      'vehicle-registration-rc',
      'driving-school-certificate',
      'personal-notes',
      'other-miscellaneous-document'
    ]
  }
};

// Document type display names - Comprehensive for General users
export const DOCUMENT_TYPE_NAMES = {
  // ID Documents
  'aadhar-card': 'Aadhar Card',
  'pan-card': 'PAN Card',
  'voter-id': 'Voter ID',
  'passport': 'Passport',
  'driving-license': 'Driving License',
  'ration-card': 'Ration Card',
  'npr-id': 'National Population Register (NPR) ID',
  'social-security-id': 'Social Security ID (if international)',
  'employee-id-card': 'Employee ID Card',
  'student-id-card': 'Student ID Card',
  'senior-citizen-card': 'Senior Citizen Card',
  'visa': 'Visa',
  'oci-pio-card': 'OCI/PIO Card',
  'other-id-document': '🟣 Other ID Document',
  
  // Educational Certificates
  'ssc-10th-marksheet': 'SSC (10th) Marksheet',
  'hsc-12th-marksheet': 'HSC (12th) Marksheet',
  'diploma-certificate': 'Diploma Certificate',
  'bachelors-degree': 'Bachelor\'s Degree',
  'masters-degree': 'Master\'s Degree',
  'provisional-certificate': 'Provisional Certificate',
  'migration-certificate': 'Migration Certificate',
  'character-certificate': 'Character Certificate',
  'transfer-certificate': 'Transfer Certificate',
  'bonafide-certificate': 'Bonafide Certificate',
  'admit-card': 'Admit Card',
  'hall-ticket': 'Hall Ticket',
  'entrance-exam-result': 'Entrance Exam Result (JEE/NEET etc.)',
  'internship-completion-certificate': 'Internship Completion Certificate',
  'mooc-online-course-certificate': 'MOOC/Online Course Certificate (Coursera, edX, etc.)',
  'other-educational-document': '🟣 Other Educational Document',
  
  // Government Issued Certificates
  'caste-certificate': 'Caste Certificate',
  'income-certificate': 'Income Certificate',
  'domicile-certificate': 'Domicile Certificate',
  'birth-certificate': 'Birth Certificate',
  'death-certificate': 'Death Certificate',
  'disability-certificate': 'Disability Certificate',
  'ews-certificate': 'EWS Certificate',
  'marriage-certificate': 'Marriage Certificate',
  'police-character-certificate': 'Character Certificate (Police)',
  'gazette-name-change-certificate': 'Gazette Name Change Certificate',
  'adoption-certificate': 'Adoption Certificate',
  'legal-heir-certificate': 'Legal Heir Certificate',
  'obc-sc-st-certificate': 'OBC/SC/ST Certificate',
  'other-govt-issued-certificate': '🟣 Other Govt-Issued Certificate',
  
  // Financial Documents
  'bank-passbook': 'Bank Passbook',
  'bank-statement': 'Bank Statement (PDF/Image)',
  'salary-slip': 'Salary Slip',
  'form-16': 'Form 16',
  'income-tax-return': 'Income Tax Return (ITR)',
  'pf-account-details': 'PF Account Details',
  'loan-approval-letter': 'Loan Approval Letter',
  'emi-schedule': 'EMI Schedule',
  'credit-card-statement': 'Credit Card Statement',
  'investment-proof': 'Investment Proof (FD/RD/Mutual Fund)',
  'uan-epfo-slip': 'UAN/EPFO Slip',
  'digital-payment-receipt': 'Digital Payment Receipt (UPI/Wallet)',
  'other-financial-document': '🟣 Other Financial Document',
  
  // Address Proof
  'aadhar-card-address': 'Aadhar Card (if address visible)',
  'voter-id-address': 'Voter ID',
  'passport-address': 'Passport (with address)',
  'electricity-bill': 'Electricity Bill',
  'water-bill': 'Water Bill',
  'gas-bill': 'Gas Bill',
  'property-tax-receipt': 'Property Tax Receipt',
  'rent-agreement': 'Rent Agreement',
  'telephone-landline-bill': 'Telephone/Landline Bill',
  'registered-sale-deed': 'Registered Sale Deed',
  'bank-passbook-address': 'Bank Passbook (with address)',
  'ration-card-address': 'Ration Card',
  'other-address-proof': '🟣 Other Address Proof',
  
  // Employment Documents
  'offer-letter': 'Offer Letter',
  'appointment-letter': 'Appointment Letter',
  'experience-letter': 'Experience Letter',
  'relieving-letter': 'Relieving Letter',
  'salary-certificate': 'Salary Certificate',
  'employment-agreement': 'Employment Agreement',
  'joining-report': 'Joining Report',
  'noc-certificate': 'NOC (No Objection Certificate)',
  'promotion-letter': 'Promotion Letter',
  'appraisal-letter': 'Appraisal Letter',
  'internship-letter': 'Internship Letter',
  'employment-id': 'Employment ID',
  'other-work-document': '🟣 Other Work Document',
  
  // Medical Documents
  'medical-report': 'Medical Report',
  'covid-vaccination-certificate': 'COVID Vaccination Certificate',
  'covid-test-report': 'COVID Test Report',
  'health-card': 'Health Card (Ayushman Bharat, etc.)',
  'insurance-policy': 'Insurance Policy',
  'insurance-claim-report': 'Insurance Claim Report',
  'doctor-prescription': 'Doctor Prescription',
  'discharge-summary': 'Discharge Summary',
  'opd-slip': 'OPD Slip',
  'disability-certificate-medical': 'Disability Certificate (Govt-issued)',
  'blood-group-card': 'Blood Group Card',
  'other-medical-document': '🟣 Other Medical Document',
  
  // Other Documents
  'affidavit': 'Affidavit',
  'notarized-documents': 'Notarized Documents',
  'self-declaration': 'Self-declaration',
  'non-employment-agreements': 'Agreements (Non-employment)',
  'court-orders': 'Court Orders',
  'legal-notices': 'Legal Notices',
  'school-leaving-certificate': 'School Leaving Certificate',
  'hostel-form': 'Hostel Form',
  'club-ngo-membership-card': 'Club/NGO Membership Card',
  'vehicle-registration-rc': 'Vehicle Registration (RC)',
  'driving-school-certificate': 'Driving School Certificate',
  'personal-notes': 'Personal Notes',
  'other-miscellaneous-document': '🟣 Other Miscellaneous Document',
  
  // Legacy support
  'other': 'Other Document'
};

export const CategoryProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allowedDocumentTypes, setAllowedDocumentTypes] = useState([]);

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

  const value = {
    selectedCategory,
    allowedDocumentTypes,
    selectCategory,
    clearCategory,
    getCategoryInfo,
    getDocumentTypeName,
    isDocumentTypeAllowed,
    categories: DOCUMENT_CATEGORIES // Return all categories for all users
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
