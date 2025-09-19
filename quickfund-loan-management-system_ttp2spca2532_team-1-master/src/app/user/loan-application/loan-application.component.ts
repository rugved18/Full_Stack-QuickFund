import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoanApplicationService } from '../../services/loan-application.service';
import { Step, PageType } from '../../modals/loan-application.interface';
import { ApplicationSubmittedComponent } from './components/application-submitted/application-submitted.component';
import { ReviewApplicationComponent } from './components/review-application/review-application.component';
import { LoanDetailsAndDocumentsComponent } from './components/loan-details-and-documents/loan-details-and-documents.component';
import { PersonalDetailsComponent } from './components/personal-details/personal-details.component';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [CommonModule, ApplicationSubmittedComponent, ReviewApplicationComponent, LoanDetailsAndDocumentsComponent, PersonalDetailsComponent],
  templateUrl: './loan-application.component.html',
  styleUrl: './loan-application.component.css'
})
export class LoanApplicationComponent implements OnInit {
  currentPage: PageType = 'personal';

  steps: Step[] = [
    { 
      key: 'personal', 
      label: 'Personal Details', 
      shortLabel: 'Personal',
      icon: 'bi bi-person-fill',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-primary bg-opacity-10',
      textColor: 'text-primary'
    },
    { 
      key: 'loan-docs', 
      label: 'Loan Details & Documents', 
      shortLabel: 'Loan & Docs',
      icon: 'bi bi-credit-card-fill',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-success bg-opacity-10',
      textColor: 'text-success'
    },
    { 
      key: 'review', 
      label: 'Review Application', 
      shortLabel: 'Review',
      icon: 'bi bi-eye-fill',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-warning bg-opacity-10',
      textColor: 'text-warning'
    },
    { 
      key: 'submitted', 
      label: 'Application Complete', 
      shortLabel: 'Complete',
      icon: 'bi bi-award-fill',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-success bg-opacity-10',
      textColor: 'text-success'
    }
  ];

  constructor(
    private loanApplicationService: LoanApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentPage = this.loanApplicationService.currentPage();
  }

  navigateTo(page: PageType): void {
    this.currentPage = page;
    this.loanApplicationService.navigateTo(page);
  }

  getCurrentStepIndex(): number {
    return this.steps.findIndex(step => step.key === this.currentPage);
  }

  getCurrentStep(): Step {
    return this.steps[this.getCurrentStepIndex()];
  }

  isStepCompleted(stepIndex: number): boolean {
    return stepIndex < this.getCurrentStepIndex();
  }

  isStepActive(stepIndex: number): boolean {
    return stepIndex === this.getCurrentStepIndex();
  }

  getProgressPercentage(): number {
    return Math.round(((this.getCurrentStepIndex() + 1) / this.steps.length) * 100);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}