import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, forkJoin } from "rxjs";
import { User } from "../modals/user";
import { AuthService } from "./auth.service";

export interface LoanWithRepayments {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  duration: number;
  status: string;
  appliedDate?: string;
  repaymentHistory: any[];
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = "http://localhost:5000";

  private currentUserId: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  updatePassword(
    userId: string,
    payload: { currentPassword: string; newPassword: string }
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/api/users/${userId}/password`,
      payload
    );
  }

  getDashboard(userId: string) {
    return this.http.get<any>(`${this.apiUrl}/api/users/${userId}/dashboard`);
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/users/${userId}`);
  }

  getLoans(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/loans?userId=${userId}`);
  }

  getRepayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/repayments`);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/users/${id}`, data);
  }

  getRepaymentsByLoanIds(loanIds: number[]): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/api/repayments`)
      .pipe(
        map((repayments) =>
          repayments.filter((r) => loanIds.includes(Number(r.loanId)))
        )
      );
  }

  getCurrentUserLoansWithRepayments(): Observable<LoanWithRepayments[]> {
    return this.getUserLoansWithRepayments(this.currentUserId);
  }

  getUserLoansWithRepayments(userId: string): Observable<LoanWithRepayments[]> {
    return forkJoin({
      loans: this.getLoans(userId),
      allRepayments: this.getRepayments(),
    }).pipe(
      map(({ loans, allRepayments }) =>
        loans.map((loan) => {
          const repaymentHistory = allRepayments.filter(
            (repayment) => repayment.loanId.toString() === loan.id
          );
          return {
            ...loan,
            repaymentHistory,
          } as LoanWithRepayments;
        })
      )
    );
  }

  // Add these inside your UserService class

  getCurrentUserLoansWithRepaymentsEnhanced(): Observable<
    LoanWithRepayments[]
  > {
    return forkJoin({
      loans: this.getLoans(this.currentUserId),
      allRepayments: this.getRepayments(),
    }).pipe(
      map(({ loans, allRepayments }) => {
        console.log("Raw loans:", loans);
        console.log("Raw repayments:", allRepayments);

        return loans.map((loan) => {
          const loanId = loan._id || loan.id;

          const repaymentHistory = allRepayments.filter((repayment) => {
            const repaymentLoanId = repayment.loanId || repayment.loan_id;
            return repaymentLoanId?.toString() === loanId?.toString();
          });

          console.log(`Loan ${loanId} repayments:`, repaymentHistory);

          return {
            ...loan,
            id: loanId, // Ensure loan has 'id'
            repaymentHistory,
          } as LoanWithRepayments;
        });
      })
    );
  }
}
