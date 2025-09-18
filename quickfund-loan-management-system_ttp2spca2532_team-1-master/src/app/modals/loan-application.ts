export interface LoanApplication {
  id: string;
  customer: string;
  purpose: string;
  amount: number;
  duration: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'closed' | 'rejected' | 'active';
  date: string;
  appliedDate: string;
  creditScore?: number;
  monthlyIncome?: number;
  employmentStatus?: string;
}