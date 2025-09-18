import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoanData } from '../modals/loan-data';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private dataUrl = 'assets/loan-history.json';

  constructor(private http: HttpClient) {}

  getLoans(): Observable<LoanData[]> {
    return this.http.get<LoanData[]>(this.dataUrl);
  }
}
