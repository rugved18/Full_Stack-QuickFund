import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { UserService, LoanWithRepayments } from "../../services/user.service";
import { Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-loan-history",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./loan-history.component.html",
  styleUrls: ["./loan-history.component.css"],
})
export class LoanHistoryComponent implements OnInit {
  user: any;
  loans: LoanWithRepayments[] = [];
  filteredLoans: LoanWithRepayments[] = [];
  searchTerm: string = "";
  statusFilter: string = "";
  expandedLoan: string | null = null;
  loading: boolean = false;
  currentUserId: string = "";
  currentUserName: string = "";

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.currentUserId = userId;
        this.fetchDashboard(userId);
      }
    }
  }

  fetchDashboard(userId: string): void {
  this.loading = true;
  this.userService.getDashboard(userId).subscribe({
    next: (data) => {
     

      this.user = data.user;
      this.currentUserName = data.user?.name || "";

      // Map loans to match LoanWithRepayments structure
      this.loans = (data.loans || []).map((loan: any) => ({
        id: loan._id,
        userId: loan.userId,
        amount: loan.amount,
        purpose: loan.purpose,
        duration: loan.duration,
        status: loan.status,
        appliedDate: loan.appliedDate || '', 
        repaymentHistory: loan.repayments || []  
      }));

      this.filteredLoans = [...this.loans];
      this.loading = false;
    },
    error: (err) => {
      console.error("Failed to fetch dashboard:", err);
      this.loading = false;
    },
  });
}

  filterLoans(): void {
    this.filteredLoans = this.loans.filter((loan) => {
      const matchesSearch =
        !this.searchTerm ||
        loan.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        loan.purpose.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.statusFilter ||
        loan.status.toLowerCase() === this.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }


  getStatus(loan: LoanWithRepayments): string {
    return loan.status.toLowerCase();
  }

  getTotalRepaid(loan: LoanWithRepayments): number {
    if (!loan.repaymentHistory || loan.repaymentHistory.length === 0) {
      console.log(`Loan ${loan.id} has no repayments`);
      return 0;
    }
    
    const total = loan.repaymentHistory.reduce(
      (total, payment) => total + (payment.amount || 0),
      0
    );
    
    console.log(`Loan ${loan.id} total repaid: ${total}`);
    return total;
  }

  toggleDetails(loanId: string): void {
    this.expandedLoan = this.expandedLoan === loanId ? null : loanId;
  }

  trackByLoanId(index: number, loan: LoanWithRepayments): string {
    return loan.id;
  }

  getRemainingAmount(loan: LoanWithRepayments): number {
    return loan.amount - this.getTotalRepaid(loan);
  }

  getCompletionPercentage(loan: LoanWithRepayments): number {
    const percentage = (this.getTotalRepaid(loan) / loan.amount) * 100;
    return Math.round(Math.min(percentage, 100));
  }

  goBack(): void {
    this.router.navigate(["/user/dashboard"]);
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Debug method to check repayment data in template
  hasRepayments(loan: LoanWithRepayments): boolean {
    const hasData = loan.repaymentHistory && loan.repaymentHistory.length > 0;
    console.log(`Template check for loan ${loan.id}: hasRepayments = ${hasData}`, loan.repaymentHistory);
    return hasData;
  }

  // Debug method for currency formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}