import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserProfile, LoanRecord, RepaymentRecord } from '../modals/repayment.interface';

@Injectable({ providedIn: 'root' })
export class RepaymentService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Current user profile
  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/profile`);
  }

  // All my repayments across loans
  getMyRepayments(): Observable<RepaymentRecord[]> {
    return this.http.get<RepaymentRecord[]>(`${this.baseUrl}/users/repayment`);
  }

  // Create a new repayment (server sets id and date)
  createRepayment(repaymentData: { loanId: string | number; amount: number; }): Observable<RepaymentRecord> {
    return this.http.post<RepaymentRecord>(`${this.baseUrl}/users/repayment`, {
      loanId: repaymentData.loanId,
      amount: repaymentData.amount
    });
  }

  // Aggregated summary compatible with component needs
  getUserLoanSummary(userId: string): Observable<{ loans: LoanRecord[]; repayments: RepaymentRecord[] }>{
    return this.http.get<{ loans: LoanRecord[]; repayments: RepaymentRecord[] }>(`${this.baseUrl}/users/loan-summary`);
  }
}
