import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoanApplicationComponent } from './loan-application/loan-application.component';
import { LoanHistoryComponent } from './loan-history/loan-history.component';
import { ProfileComponent } from './profile/profile.component';
import { RepaymentComponent } from './repayment/repayment.component';
import { UserLayoutComponent } from '../layout/user-layout/user-layout.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'apply-loan', component: LoanApplicationComponent },
      { path: 'history', component: LoanHistoryComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'repayment', component: RepaymentComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
