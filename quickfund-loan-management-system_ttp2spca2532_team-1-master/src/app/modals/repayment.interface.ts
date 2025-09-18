export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  details?: {
    monthlyIncome?: number;
    employmentStatus?: string;
    creditScore?: number;
    dateJoined?: string;
    address?: string;
    dob?: string;
    aadharNumber?: string;
    occupation?: string;
  };
}

export interface LoanRecord {
  id: number | string;
  userId: string;
  amount: number;
  purpose: string;
  duration: number;
  status: string;
}

export interface RepaymentRecord {
  id: number | string;
  loanId: number | string;
  amount: number;
  date: string;
}
