import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { Router } from "@angular/router";
import { AdminService } from "../../services/admin.service";
import { LoanApplication } from "../../modals/adminApprovalModels";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Component({
  selector: "app-approvals",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./approvals.component.html",
  styleUrl: "./approvals.component.css",
})
export class ApprovalsComponent implements OnInit {
  applications: LoanApplication[] = [];
  filteredApplications: LoanApplication[] = [];
  searchTerm: string = "";
  statusFilter: string = "";
  applicationCounts = { pending: 0, closed: 0, rejected: 0, active: 0 };

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.adminService.getLoanApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.calculateApplicationCounts();
        this.filterApplications();
      },
      error: (error) => console.error('Error loading applications:', error),
    });
  }


  calculateApplicationCounts(): void {
    this.applicationCounts = {
      pending: this.applications.filter((app) => app.status.toLowerCase() === "pending").length,
      closed: this.applications.filter((app) => app.status.toLowerCase() === "closed").length,
      rejected: this.applications.filter((app) => app.status.toLowerCase() === "rejected").length,
      active: this.applications.filter((app) => app.status.toLowerCase() === "active").length,
    };
  }

  filterApplications(): void {
    let filtered = this.applications;

    if (this.statusFilter) {
      filtered = filtered.filter(
        (app) => app.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.customer.toLowerCase().includes(term) ||
          app.id.toLowerCase().includes(term) ||
          app.purpose.toLowerCase().includes(term)
      );
    }

    this.filteredApplications = filtered;
  }

  onSearchChange(): void {
    this.filterApplications();
  }

  onStatusFilterChange(): void {
    this.filterApplications();
  }

  navigateToUserDetails(userId: string): void {
    this.router.navigate(["/admin/user-details", userId]);
  }

  sendEmail(application: LoanApplication, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    console.log("=== EMAIL BUTTON CLICKED ===");
    console.log("Customer:", application.customer);
    console.log("Status:", application.status);

    // Compare with lowercase, keep DB as Title Case
    if (application.status.toLowerCase() !== "active") {
      const alertMessage = `Emails can only be sent for active loans.\n\nCurrent loan status: ${
        application.status
      }\nCustomer: ${application.customer}`;
      alert(alertMessage);
      console.log("Alert shown for non-active loan");
      return;
    }

    console.log("Proceeding to send email for active loan...");

    const emailData = {
      userId: application.userId,
      name: application.customer,
      email: application.email,
      purpose: application.purpose,
      loanDue: application.outstandingBalance || 0,
    };

    console.log("Email data:", emailData);

    this.adminService.sendLoanEmail(emailData).subscribe({
      next: (response) => {
        alert(`Email sent successfully to ${application.customer}!`);
        console.log("Email sent successfully:", response);
      },
      error: (error) => {
        alert("Failed to send email. Please try again.");
        console.error("Error sending email:", error);
      },
    });
  }

  approveApplication(applicationId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.adminService.approveApplication(applicationId).subscribe({
      next: () => {
        this.loadApplications();
      },
      error: (error) => {
        console.error("Error approving application:", error);
      },
    });
  }

  rejectApplication(applicationId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.adminService.rejectApplication(applicationId).subscribe({
      next: () => {
        this.loadApplications();
      },
      error: (error) => {
        console.error("Error rejecting application:", error);
      },
    });
  }

  exportToExcel(): void {
    const exportData = this.filteredApplications.map((app) => ({
      Customer: app.customer,
      Email: app.email,
      Phone: app.phone,
      Purpose: app.purpose,
      "Amount (₹)": app.amount,
      "Duration (months)": app.duration,
      "Risk Level": app.riskLevel,
      Status: app.status, // stays Title Case
      Date: app.date,
      "Credit Score": app.creditScore,
      "Monthly Income (₹)": app.monthlyIncome,
      "Employment Status": app.employmentStatus,
      Occupation: app.occupation,
      "Outstanding Balance (₹)": app.outstandingBalance || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Applications");

    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    worksheet["!cols"] = columnWidths;

    const fileName = `loan_applications_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  exportToPDF(): void {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(18);
    doc.text("Loan Applications Report", 14, 15);

    autoTable(doc, {
      head: [
        [
          "Customer",
          "Email",
          "Purpose",
          "Amount",
          "Duration",
          "Risk",
          "Status",
          "Date",
          "Credit Score",
        ],
      ],
      body: this.filteredApplications.map((app) => [
        app.customer,
        app.email,
        app.purpose,
        `₹${app.amount.toLocaleString()}`,
        `${app.duration}m`,
        app.riskLevel,
        app.status, // already Title Case
        app.date,
        app.creditScore?.toString() || "N/A",
      ]),
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const fileName = `loan_applications_report_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  }

  getRiskLevelClass(riskLevel: string): string {
    switch (riskLevel) {
      case "Low":
        return "text-success";
      case "Medium":
        return "text-warning";
      case "High":
        return "text-danger";
      default:
        return "text-muted";
    }
  }

  getStatusClass(status: string): string {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case "pending":
        return "bg-warning text-dark";
      case "closed":
        return "bg-success";
      case "rejected":
        return "bg-danger";
      case "active":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  }

  goBack(): void {
    this.router.navigate(["/admin/dashboard"]);
  }

  trackByApplicationId(index: number, application: LoanApplication): string {
    return application.id;
  }
}
