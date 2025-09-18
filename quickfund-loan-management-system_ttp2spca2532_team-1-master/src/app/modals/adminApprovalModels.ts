

export interface AddressDetails {
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface EmploymentDetails {
  employer: string;
  jobTitle: string;
  annualIncome: number;
  employmentType: string;
  yearsEmployed: number;
}

export interface EducationDetails {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  expectedGraduation: string;
  feeStructure: string;
}

export interface OtherOccupation {
  occupationDescription: string;
  sourceOfIncome: string;
  monthlyIncome: number;
}

export interface User {
  id: string; 
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  details: {
    monthlyIncome: number;
    employmentStatus: string;
    creditScore: number;
    dateJoined: string;
    address?: string;
    dob?: string;
    aadharNumber?: string;
    occupation: string;

    // Newly added nested objects
    addressDetails?: AddressDetails;
    employment?: EmploymentDetails;
    education?: EducationDetails;
    otherOccupation?: OtherOccupation;
  };
}

export interface Loan {
  id: string; 
  _id?: string;
  userId: string;
  amount: number;
  purpose: string;
  duration: number;
  status: string; 
  repayments?: Repayment[];
  totalRepaid?: number;
  outstandingBalance?: number;
}

export interface Repayment {
  id: string; 
  _id?: string;
  loanId: string;
  amount: number;
  date: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  purpose: string;
  duration: number;
  status: 'pending' | 'closed' | 'rejected' | 'active';
  date: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  creditScore: number;
  monthlyIncome: number;
  employmentStatus: string;
  occupation: string;
  outstandingBalance?: number;
}

export interface UserDetails {
  user: User;
  loans: Loan[];
  repayments: Repayment[];
  totalLoaned: number;
  totalRepaid: number;
  activeLoans: number;
  completedLoans: number;
  rejectedLoans: number;
}
