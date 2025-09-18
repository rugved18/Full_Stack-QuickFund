import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { UserDetails } from '../../modals/adminApprovalModels';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  userDetails: UserDetails | null = null;
  userId: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id') ?? '';
      if (this.userId) {
        this.loadUserDetails();
      } else {
        this.error = 'No user ID provided';
      }
    });
  }

  loadUserDetails(): void {
    this.error = '';
    this.userDetails = null;

    this.adminService.getUserDetails(this.userId).subscribe({
      next: (details) => {
        // ✅ Safely merge data with defaults to avoid undefined errors
        this.userDetails = {
          ...details,
          user: {
            ...details.user,
            details: {
              ...details.user.details,
              addressDetails: details.user.details?.addressDetails ?? {
                street: '',
                city: '',
                state: '',
                pinCode: ''
              },
              employment: details.user.details?.employment ?? {
                employer: '',
                jobTitle: '',
                annualIncome: 0,
                employmentType: '',
                yearsEmployed: 0
              },
              education: details.user.details?.education ?? {
                institution: '',
                degree: '',
                fieldOfStudy: '',
                yearOfStudy: '',
                expectedGraduation: '',
                feeStructure: ''
              },
              otherOccupation: details.user.details?.otherOccupation ?? {
                occupationDescription: '',
                sourceOfIncome: '',
                monthlyIncome: 0
              }
            }
          },
          loans: details.loans ?? [],
          repayments: details.repayments ?? [],
          totalLoaned: details.totalLoaned ?? 0,
          totalRepaid: details.totalRepaid ?? 0,
          activeLoans: details.activeLoans ?? 0,
          completedLoans: details.completedLoans ?? 0,
          rejectedLoans: details.rejectedLoans ?? 0
        };
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.error = 'Failed to load user details. Please try again.';
        this.userDetails = null;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/approve']);
  }

  getLoanStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Closed':
        return 'bg-primary';
      case 'Rejected':
        return 'bg-danger';
      case 'Pending':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString ?? '';
    }
  }

  /**
   * Helper to get monthly income safely
   */
  getMonthlyIncome(): number {
    const annualIncome = this.userDetails?.user?.details?.employment?.annualIncome ?? 0;
    return Math.round(annualIncome / 12);
  }
}
