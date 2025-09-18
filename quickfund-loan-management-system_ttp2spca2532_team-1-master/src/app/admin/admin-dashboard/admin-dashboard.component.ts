import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LoanPurposeChartComponent } from '../loan-purpose-chart/loan-purpose-chart.component';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, HttpClientModule, RouterModule, LoanPurposeChartComponent],
})
export class AdminDashboardComponent implements OnInit {
  loans: any[] = [];
  repayments: any[] = [];
  users: any[] = [];

  totalLoans = 0;
  totalAmount = 0;
  totalRepayments = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.adminService.getAllLoans().subscribe({
      next: (loans) => {
        this.loans = loans;
        this.totalLoans = loans.length;
        this.totalAmount = loans.reduce((sum, l) => sum + l.amount, 0);
      },
      error: (err) => console.error('Failed to fetch loans:', err),
    });

    this.adminService.getAllRepayments().subscribe({
      next: (repayments) => {
        this.repayments = repayments;
        this.totalRepayments = repayments.reduce((sum, r) => sum + r.amount, 0);

      },
      error: (err) => console.error('Failed to fetch repayments:', err),
    });

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => console.error('Failed to fetch users:', err),
    });
  }
}
