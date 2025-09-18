import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoanApplicationService } from '../../../../services/loan-application.service';
import { LoanApplication } from '../../../../interfaces/loan-application.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-submitted',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-submitted.component.html',
  styleUrl: './application-submitted.component.css'
})
export class ApplicationSubmittedComponent implements OnInit {
  @Output() onNewApplication = new EventEmitter<void>();

  application!: LoanApplication;
  applicationId!: string;
  submissionDate!: Date;
  expectedResponseDate!: Date;

  constructor(private loanApplicationService: LoanApplicationService) {}

  ngOnInit(): void {
    this.application = this.loanApplicationService.application();
    this.generateApplicationData();
  }

  private generateApplicationData(): void {
    // Generate a realistic application ID
    this.applicationId = `QF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Set submission date to now
    this.submissionDate = new Date();
    
    // Set expected response date (3-5 business days)
    this.expectedResponseDate = new Date();
    this.expectedResponseDate.setDate(this.expectedResponseDate.getDate() + 5);
  }

  downloadAcknowledgment(): void {
    // Simulate PDF download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
      encodeURIComponent(this.generateAcknowledgmentText()));
    element.setAttribute('download', `QuickFund_Application_${this.applicationId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  private generateAcknowledgmentText(): string {
    return `
QUICKFUND LOAN APPLICATION ACKNOWLEDGMENT

Application ID: ${this.applicationId}
Submission Date: ${this.submissionDate.toLocaleString()}
Applicant: ${this.application.personalInfo.firstName} ${this.application.personalInfo.lastName}
Email: ${this.application.personalInfo.email}
Phone: ${this.application.personalInfo.countryCode} ${this.application.personalInfo.phone}

LOAN DETAILS:
Amount: ₹${this.application.amount}
Purpose: ${this.application.purpose}
Duration: ${this.application.duration} months

STATUS: Application Submitted Successfully
Expected Response: ${this.expectedResponseDate.toDateString()}

For any queries, contact us at +91 1800-123-456 or support@quickfund.com

Thank you for choosing QuickFund!
    `;
  }

  trackApplication(): void {
    alert(`Application ID: ${this.applicationId}\n\nStatus: Under Review\n\nYou can track your application status using this ID.`);
  }

  startNewApplication(): void {
    if (confirm('Are you sure you want to start a new application? This will clear the current application data.')) {
      this.loanApplicationService.resetApplication();
      this.onNewApplication.emit();
    }
  }
}