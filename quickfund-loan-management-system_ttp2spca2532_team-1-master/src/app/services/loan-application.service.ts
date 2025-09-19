import { Injectable, signal, computed } from "@angular/core";
import {
  LoanApplication,
  PersonalInfo,
  PageType,
} from "../modals/loan-application.interface";
import { HttpClient, HttpParams } from "@angular/common/http";
import { tap, map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoanApplicationService {
  private baseUrl = "http://localhost:5000";

  private readonly initialApplication: LoanApplication = {
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      countryCode: "+91",
      dateOfBirth: "",
      aadharNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        pinCode: "",
      },
      occupationType: "employed",
      employment: {
        employer: "",
        jobTitle: "",
        annualIncome: "",
        employmentType: "full-time",
        yearsEmployed: "",
      },
    },
    amount: "",
    purpose: "",
    duration: "",
    documents: {
      aadhaarKyc: false,
    },
    status: "Pending",
  };

  private _application = signal<LoanApplication>(this.initialApplication);
  private _currentPage = signal<PageType>("personal");

  readonly application = this._application.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();

  readonly personalInfo = computed(() => this._application().personalInfo);

  readonly isApplicationComplete = computed(() => {
    const app = this._application();
    return !!(
      app.personalInfo.firstName &&
      app.personalInfo.lastName &&
      app.personalInfo.email &&
      app.amount &&
      app.purpose
    );
  });

  constructor(private http: HttpClient) {}

  updateApplication(updates: Partial<LoanApplication>): void {
    this._application.update((current) => ({ ...current, ...updates }));
  }

  updatePersonalInfo(updates: Partial<PersonalInfo>): void {
    this._application.update((current) => ({
      ...current,
      personalInfo: { ...current.personalInfo, ...updates },
    }));
  }

  updateDocuments(updates: Partial<LoanApplication["documents"]>): void {
    this._application.update((current) => ({
      ...current,
      documents: { ...current.documents, ...updates },
    }));
  }

  navigateTo(page: PageType): void {
    this._currentPage.set(page);
  }

  resetApplication(): void {
    this._application.set(this.initialApplication);
    this._currentPage.set("personal");
  }

  validatePersonalInfo(): boolean {
    const info = this.personalInfo();
    return !!(
      info.firstName &&
      info.lastName &&
      info.email &&
      info.phone &&
      info.dateOfBirth &&
      info.aadharNumber &&
      info.address.street &&
      info.address.city &&
      info.address.state &&
      info.address.pinCode
    );
  }

  validateLoanDetails(): boolean {
    const app = this._application();
    return !!(app.amount && app.purpose && app.duration);
  }

  calculateEMI(
    amount: number,
    durationMonths: number,
    annualRate: number = 12
  ): number {
    if (!amount || !durationMonths) return 0;

    const monthlyRate = annualRate / 12 / 100;
    const emi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1);

    return Math.round(emi);
  }

  /**
   * Load loan application data from backend by ID
   * @param id Application ID
   */
  loadApplication(id: string): Observable<LoanApplication> {
    return this.http
      .get<LoanApplication>(`${this.baseUrl}/${id}`)
      .pipe(tap((app) => this._application.set(app)));
  }

  /**
   * Submit (create or update) loan application to backend with files
   * Uses multipart/form-data.
   * @param application LoanApplication data (without files)
   * @param files Map of document field names to File objects
   */
  submitApplication(
    application: LoanApplication,
    files: { [key: string]: File }
  ): Observable<any> {
    const formData = new FormData();

    // Append top-level loan fields (ensure no undefined/null values)
    formData.append("amount", application.amount?.toString() || "");
    formData.append("purpose", application.purpose || "");
    formData.append("duration", application.duration?.toString() || "");
    formData.append("status", application.status || "Pending");

    // Recursive helper to append nested objects safely
    const appendNested = (obj: any, parentKey = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;

        if (value && typeof value === "object" && !(value instanceof File)) {
          appendNested(value, fullKey); // recurse for nested objects
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(fullKey, value as string | Blob);
        }
      });
    };

    // Append personalInfo recursively (includes Aadhaar number)
    appendNested(application.personalInfo, "personalInfo");

    // Append files if present
    Object.entries(files).forEach(([key, file]) => {
      if (file instanceof File) {
        formData.append(key, file, file.name);
      }
    });

    console.log("📤 Submitting Loan Application:", { application, files });

    // Send to backend
    return this.http.post(
      `${this.baseUrl}/api/users/loan-applications`,
      formData
    );
  }
}
