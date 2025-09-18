import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RepaymentService } from '../../services/repayment.service';
import { UserProfile, LoanRecord, RepaymentRecord } from '../../modals/repayment.interface';

@Component({
  selector: 'app-repayment',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './repayment.component.html',
  styleUrl: './repayment.component.css'
})
export class RepaymentComponent implements OnInit {
  constructor(private repaymentService: RepaymentService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData(); // always load from server
  }

  form = {
    loanId: '',
    amount: null as number | null,
    method: ''
  };

  user: UserProfile | null = null;
  loans: LoanRecord[] = [];
  repayments: RepaymentRecord[] = [];

  selectedLoan: LoanRecord | null = null;
  selectedRepayments: RepaymentRecord[] = [];

  // Payment submission state
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  loadUserData() {
    this.repaymentService.getMe().subscribe({
      next: (me) => {
        this.user = me;

        this.repaymentService.getUserLoanSummary(String(me.id)).subscribe({
          next: ({ loans, repayments }) => {
            this.loans = loans.filter(l => l.status.toLowerCase() === 'active');
            this.repayments = repayments;
            this.form.loanId = '';
            this.selectedLoan = null;
            this.selectedRepayments = [];
          },
          error: () => {
            this.errorMessage = 'Failed to load loan summary. Please try again.';
          }
        });
      },
      error: () => {
        alert('Session expired, please log in again');
        this.router.navigate(['/homepage']);
      }
    });
  }

  onLoanChange() {
    const loanIdStr = String(this.form.loanId);
    this.selectedLoan = this.loans.find(l => String(l.id) === loanIdStr) || null;
    this.selectedRepayments = this.selectedLoan
      ? this.repayments.filter(r => String(r.loanId) === loanIdStr)
      : [];
  }

  onSubmit() {
    if (this.form.loanId && this.form.amount && this.form.method) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const repaymentData = {
        loanId: this.form.loanId,
        amount: this.form.amount
      };

      this.repaymentService.createRepayment(repaymentData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = `Payment of ₹${this.form.amount} submitted successfully!`;

          // Reset form
          this.form = { loanId: '', amount: null, method: '' };

          // Refresh data directly
          this.loadUserData();

          // Clear success message after 5s
          setTimeout(() => (this.successMessage = ''), 5000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to submit payment. Please try again.';
          console.error('Repayment submission error:', error);

          // Clear error after 5s
          setTimeout(() => (this.errorMessage = ''), 5000);
        }
      });
    }
  }

  get totalPaid(): number {
    if (!this.selectedLoan) return 0;
    if (this.selectedLoan.status.toLowerCase() === 'closed') {
      return this.selectedLoan.amount;
    }
    return this.selectedRepayments.reduce((sum, r) => sum + r.amount, 0);
  }

  get outstanding(): number {
    if (!this.selectedLoan) return 0;
    if (this.selectedLoan.status.toLowerCase() === 'closed') {
      return 0;
    }
    return this.selectedLoan.amount - this.totalPaid;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
