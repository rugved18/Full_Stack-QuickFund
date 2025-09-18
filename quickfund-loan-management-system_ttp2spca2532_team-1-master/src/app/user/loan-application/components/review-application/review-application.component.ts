import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { LoanApplicationService } from "../../../../services/loan-application.service";
import { LoanApplication } from "../../../../interfaces/loan-application.interface";
import {
  LOAN_PURPOSES,
  LOAN_DURATIONS,
} from "../../../../constants/form-options.constants";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-review-application",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./review-application.component.html",
  styleUrl: "./review-application.component.css",
})
export class ReviewApplicationComponent implements OnInit {
  @Output() onBack = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  application!: LoanApplication;
  termsAccepted = false;
  creditCheckConsent = false;
  isSubmitting = false;
  selectedFiles: { [key: string]: File } = {};

  readonly loanPurposes = LOAN_PURPOSES;
  readonly loanDurations = LOAN_DURATIONS;

  constructor(private loanApplicationService: LoanApplicationService) {}

  ngOnInit(): void {
    this.application = this.loanApplicationService.application();
  }

  get calculatedEMI(): number {
    return this.loanApplicationService.calculateEMI(
      +this.application.amount,
      +this.application.duration
    );
  }

  get totalPayable(): number {
    return this.calculatedEMI * (+this.application.duration || 0);
  }

  maskAadhaar(aadhaar: string): string {
    if (!aadhaar || aadhaar.length !== 12) return aadhaar;
    return `${aadhaar.slice(0, 4)} XXXX XXXX ${aadhaar.slice(-4)}`;
  }

  getOccupationLabel(type: string): string {
    const occupationMap: { [key: string]: string } = {
      employed: "Employed",
      student: "Student",
      other: "Other",
    };
    return occupationMap[type] || type;
  }

  getLoanPurposeLabel(value: string): string {
    const purpose = this.loanPurposes.find((p) => p.value === value);
    return purpose ? purpose.label : value;
  }

  getLoanDurationLabel(value: string): string {
    const duration = this.loanDurations.find((d) => d.value === value);
    return duration ? duration.label : value;
  }

  getDocumentName(documentType: string): string {
    const document = this.application.documents?.[documentType];
    if (document instanceof File) return document.name;
    return "Uploaded";
  }

  canSubmit(): boolean {
    return this.termsAccepted && this.creditCheckConsent && !this.isSubmitting;
  }

  async submitApplication(
    application: LoanApplication,
    files: { [key: string]: File }
  ): Promise<void> {
    if (!this.canSubmit()) return;

    this.isSubmitting = true;

    try {
      // Ensure files include existing documents
      const filesToSend: { [key: string]: File } = { ...files };

      const docs = application.documents as
        | { [key: string]: File | boolean | undefined }
        | undefined;

      if (docs) {
        Object.keys(docs).forEach((key) => {
          const doc = docs[key];
          if (doc instanceof File) {
            filesToSend[key] = doc;
          }
        });
      }

      const response = await this.loanApplicationService
        .submitApplication(application, filesToSend)
        .toPromise();

      if (response && response.loanApplication) {
        this.loanApplicationService.updateApplication(response.loanApplication);
      }

      this.onSubmit.emit();
    } catch (error) {
      alert(
        "There was an error submitting your application. Please try again."
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  onFileSelected(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Update application documents
      this.application.documents = {
        ...this.application.documents,
        [key]: file,
      };
    }
  }

  goBack(): void {
    this.onBack.emit();
  }
}
