import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin, map } from "rxjs";
import {
  User,
  Loan,
  Repayment,
  LoanApplication,
  UserDetails,
} from "../modals/adminApprovalModels";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = "http://localhost:5000/api/admin";

  constructor(private http: HttpClient) {}

  getAllLoans(): Observable<Loan[]> {
    console.log(" Fetching ALL loans...");
    return this.http.get<any[]>(`${this.apiUrl}/loans`).pipe(
      map((loans) => {
        console.log("Raw loans received:", loans);
        return loans.map((loan) => ({
          ...loan,
          id: loan._id,
          userId: loan.userId,
          status: this.toTitleCase(loan.status), 
        }));
      })
    );
  }

  getAllRepayments(): Observable<Repayment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/repayments`).pipe(
      map((repayments) =>
        repayments.map((repayment) => ({
          ...repayment,
          id: repayment._id,
          loanId: repayment.loanId,
        }))
      )
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) =>
        users.map((user) => ({
          ...user,
          id: user._id,
        }))
      )
    );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
      map((user) => ({
        ...user,
        id: user._id,
      }))
    );
  }

  getUserDetails(userId: string): Observable<UserDetails> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}/details`).pipe(
      map((response) => {
        const user: User = {
          ...response.user,
          id: response.user._id,
        };

        const loans: Loan[] =
          response.loans?.map((loan: any) => ({
            ...loan,
            id: loan._id,
            userId: loan.userId,
            status: this.toTitleCase(loan.status),
          })) || [];

        const repayments: Repayment[] = [];
        response.loans?.forEach((loan: any) => {
          if (loan.repayments && Array.isArray(loan.repayments)) {
            loan.repayments.forEach((repayment: any) => {
              repayments.push({
                id: repayment._id,
                loanId: repayment.loanId,
                amount: repayment.amount,
                date: repayment.date,
              });
            });
          }
        });

        return {
          user,
          loans,
          repayments,
          totalLoaned: response.totalLoaned || 0,
          totalRepaid: response.totalRepaid || 0,
          activeLoans: loans.filter((l) => l.status === "Active").length,
          completedLoans: loans.filter((l) => l.status === "Closed").length,
          rejectedLoans: loans.filter((l) => l.status === "Rejected").length,
        } as UserDetails;
      })
    );
  }

  approveApplication(loanId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/loans/${loanId}/approve`, {});
  }

  rejectApplication(loanId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/loans/${loanId}/reject`, {});
  }

  getLoansByUserId(userId: string): Observable<Loan[]> {
    return this.getAllLoans().pipe(
      map((loans) => loans.filter((loan) => loan.userId === userId))
    );
  }

  getRepaymentsByLoanIds(loanIds: string[]): Observable<Repayment[]> {
    return this.getAllRepayments().pipe(
      map((repayments) =>
        repayments.filter((repayment) => loanIds.includes(repayment.loanId))
      )
    );
  }

  sendLoanEmail(emailData: {
    userId: string;
    name: string;
    email: string;
    purpose: string;
    loanDue: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, emailData);
  }

  getLoanApplications(): Observable<LoanApplication[]> {
    return forkJoin({
      users: this.getAllUsers(),
      loans: this.getAllLoans(),
    }).pipe(
      map(({ users, loans }) => {
        console.log("Users received:", users);
        console.log("Loans received (TitleCase status):", loans);

        return loans
          .map((loan) => {
            const user = users.find((u) => u.id === loan.userId);
            if (!user) return null;

            let riskLevel = "Medium";
            if (
              user.details.creditScore >= 750 &&
              user.details.monthlyIncome >= 50000
            ) {
              riskLevel = "Low";
            } else if (
              user.details.creditScore < 650 ||
              user.details.monthlyIncome < 30000
            ) {
              riskLevel = "High";
            }

            return {
              id: loan.id,
              userId: user.id,
              customer: user.name,
              email: user.email,
              phone: user.phone,
              amount: loan.amount,
              purpose: loan.purpose,
              duration: loan.duration,
              status: this.toTitleCase(loan.status),
              date: new Date(user.details.dateJoined).toLocaleDateString(
                "en-IN"
              ),
              riskLevel,
              creditScore: user.details.creditScore,
              monthlyIncome: user.details.monthlyIncome,
              employmentStatus: user.details.employmentStatus,
              occupation: user.details.occupation,
              outstandingBalance:
                loan.outstandingBalance ||
                loan.amount - (loan.totalRepaid || 0),
            } as LoanApplication;
          })
          .filter((app) => app !== null) as LoanApplication[];
      })
    );
  }

  private toTitleCase(value: string): string {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
