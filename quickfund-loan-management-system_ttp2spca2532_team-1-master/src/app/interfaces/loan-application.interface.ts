export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  dateOfBirth: string;
  aadharNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  occupationType: 'employed' | 'student' | 'other';
  employment?: {
    employer: string;
    jobTitle: string;
    annualIncome: string;
    employmentType: 'full-time' | 'part-time' | 'self-employed' | 'government' | 'private';
    yearsEmployed: string;
  };
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    yearOfStudy: string;
    expectedGraduation: string;
    feeStructure: string;
  };
  otherOccupation?: {
    occupationDescription: string;
    sourceOfIncome: string;
    monthlyIncome: string;
  };
}

export interface LoanApplication {
  personalInfo: PersonalInfo;
  amount: string;
  purpose: string;
  duration: string;
  documents: {
    aadhaarCard?: File;
    panCard?: File;
    incomeProof?: File;
    salarySlip?: File;
    bankStatement?: File;
    educationDocuments?: File;
    otherIncomeProof?: File;
    aadhaarKyc?: boolean;
    [key: string]: File | boolean | undefined;
  };
  status: 'Pending' | 'Active' | 'Rejected' | 'Closed';
  
}

export type PageType = 'personal' | 'loan-docs' | 'review' | 'submitted';

export interface Step {
  key: PageType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}