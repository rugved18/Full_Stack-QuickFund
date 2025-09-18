import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoanApplication } from '../modals/loan-application';

@Injectable({
  providedIn: 'root'
})
export class LoanApprovalService {
  private dataUrl = 'assets/loan-application.json';
  private applicationsSubject = new BehaviorSubject<LoanApplication[]>([]);
  public applications$ = this.applicationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadApplications();
  }

  private loadApplications(): void {
    this.http.get<LoanApplication[]>(this.dataUrl).subscribe({
      next: (data) => {
        this.applicationsSubject.next(data);
      },
      error: (error) => {
        console.error('Error loading loan applications:', error);
      }
    });
  }

  getApplications(): Observable<LoanApplication[]> {
    return this.applications$;
  }

  approveApplication(applicationId: string): void {
    const applications = this.applicationsSubject.value;
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status: 'approved' as const } : app
    );
    this.applicationsSubject.next(updatedApplications);
  }

  rejectApplication(applicationId: string): void {
    const applications = this.applicationsSubject.value;
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status: 'rejected' as const } : app
    );
    this.applicationsSubject.next(updatedApplications);
  }

  getApplicationById(id: string): LoanApplication | undefined {
    return this.applicationsSubject.value.find(app => app.id === id);
  }

  getApplicationsByStatus(status: string): LoanApplication[] {
    if (!status) return this.applicationsSubject.value;
    return this.applicationsSubject.value.filter(app => app.status === status);
  }

  getApplicationsCount(): { pending: number; approved: number; rejected: number; active: number } {
    const applications = this.applicationsSubject.value;
    return {
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      active: applications.filter(app => app.status === 'active').length
    };
  }
}