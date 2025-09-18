export interface Repayment {
  date: string;
  amount: number;
}

export interface LoanData {
  id: string;
  purpose: string;
  amount: number;
  date: string;
  duration: string;
  customer: string;
  applied: string;
  repaymentHistory: Repayment[];
}