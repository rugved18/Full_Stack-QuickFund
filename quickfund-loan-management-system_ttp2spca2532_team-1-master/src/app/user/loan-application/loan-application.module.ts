import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LoanApplicationRoutingModule } from './loan-application-routing.module';
import { LoanApplicationComponent } from './loan-application.component';
import { PersonalDetailsComponent } from './components/personal-details/personal-details.component';
import { LoanDetailsAndDocumentsComponent } from './components/loan-details-and-documents/loan-details-and-documents.component';
import { ReviewApplicationComponent } from './components/review-application/review-application.component';
import { ApplicationSubmittedComponent } from './components/application-submitted/application-submitted.component';

@NgModule({
  declarations: [
    LoanApplicationComponent,
    PersonalDetailsComponent,
    LoanDetailsAndDocumentsComponent,
    ReviewApplicationComponent,
    ApplicationSubmittedComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoanApplicationRoutingModule
  ]
})
export class LoanApplicationModule { }