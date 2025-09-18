import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { UserService } from "../../services/user.service";
import { isPlatformBrowser } from "@angular/common";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  imports: [CommonModule, HttpClientModule, RouterModule],
})
export class DashboardComponent implements OnInit {
  user: any;
  loans: any[] = [];
  activeLoans: any[] = [];
  repayments: any[] = [];
  recentLoan: any;
  totalRepaid = 0;
  outstandingBalance = 0;

  constructor(
    private userService: UserService, private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.fetchDashboard(userId);
    }
  }
}


  fetchDashboard(userId: string): void {
  this.userService.getDashboard(userId).subscribe({
    next: (data) => {
      this.user = data.user;
      this.loans = data.loans;
      this.activeLoans = data.activeLoans;
      this.recentLoan = data.recentLoan;
      this.totalRepaid = data.totalRepaid;
      this.outstandingBalance = data.outstandingBalance;
    },
    error: (err) => console.error("Failed to fetch dashboard:", err),
  });
}

}
