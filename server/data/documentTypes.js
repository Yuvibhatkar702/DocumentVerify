// server/data/documentTypes.js

const expandedDocumentTypes = [
  // ID Documents
  'aadhar-card', 'pan-card', 'voter-id', 'passport', 'driving-license',
  'ration-card', 'npr-id', 'social-security-id', 'employee-id-card',
  'student-id-card', 'senior-citizen-card', 'visa', 'oci-card', 'pio-card', 'other-id-document',

  // Educational Certificates
  'ssc-marksheet', 'hsc-marksheet', 'diploma-certificate', 'bachelor-degree',
  'master-degree', 'provisional-certificate', 'migration-certificate',
  'character-certificate', 'transfer-certificate', 'bonafide-certificate',
  'admit-card', 'hall-ticket', 'entrance-exam-result', 'internship-certificate',
  'mooc-certificate', 'other-educational-document',

  // Government Issued Certificates
  'caste-certificate', 'income-certificate', 'domicile-certificate', 'birth-certificate',
  'death-certificate', 'disability-certificate', 'ews-certificate', 'marriage-certificate',
  'police-character-certificate', 'gazette-name-change', 'adoption-certificate',
  'legal-heir-certificate', 'obc-certificate', 'sc-certificate', 'st-certificate', 'other-govt-certificate',

  // Financial Documents
  'bank-passbook', 'bank-statement', 'salary-slip', 'form-16', 'itr', 'pf-details',
  'loan-approval', 'emi-schedule', 'credit-card-statement', 'investment-proof',
  'uan-slip', 'upi-receipt', 'other-financial-document',

  // Address Proof
  'address-aadhar-card', 'address-voter-id', 'address-passport', 'electricity-bill',
  'water-bill', 'gas-bill', 'property-tax-receipt', 'rent-agreement',
  'telephone-bill', 'sale-deed', 'address-bank-passbook', 'address-ration-card', 'other-address-proof',

  // Employment Documents
  'offer-letter', 'appointment-letter', 'experience-letter', 'relieving-letter',
  'salary-certificate', 'employment-agreement', 'joining-report', 'noc', 'promotion-letter',
  'appraisal-letter', 'internship-letter', 'employment-id', 'other-work-document',

  // Medical Documents
  'medical-report', 'covid-vaccine-certificate', 'covid-test-report', 'health-card',
  'insurance-policy', 'insurance-claim', 'doctor-prescription', 'discharge-summary',
  'opd-slip', 'blood-group-card', 'other-medical-document',

  // Miscellaneous
  'affidavit', 'notarized-document', 'self-declaration', 'non-employment-agreement',
  'court-order', 'legal-notice', 'school-leaving-certificate', 'hostel-form',
  'club-membership-card', 'rc', 'driving-school-certificate', 'personal-notes', 'other-miscellaneous'
];

module.exports = { expandedDocumentTypes };
