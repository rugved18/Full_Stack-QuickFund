import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanApplicationService } from '../../../../services/loan-application.service';
import { LOAN_PURPOSES, LOAN_DURATIONS } from '../../../../constants/form-options.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-details-and-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './loan-details-and-documents.component.html',
  styleUrl: './loan-details-and-documents.component.css'
})
export class LoanDetailsAndDocumentsComponent implements OnInit {
  @Output() onBack = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<void>();

  loanForm: FormGroup;
  uploadedFiles: { [key: string]: File } = {};
  isDragOver = false;
  
  readonly loanPurposes = LOAN_PURPOSES;
  readonly loanDurations = LOAN_DURATIONS;

   readonly interestRates: { [key: string]: number } = {
    education: 8,
    home: 9,
    vehicle: 10,
    business: 13,
    personal: 15,
    medical: 11,
    other: 12
  };


  constructor(
    private fb: FormBuilder,
    private loanApplicationService: LoanApplicationService
  ) {
    this.loanForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormWatchers();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(10000), Validators.max(10000000)]],
      purpose: ['', Validators.required],
      duration: ['', Validators.required]
    });
  }

  private initializeForm(): void {
    const currentApplication = this.loanApplicationService.application();
    this.loanForm.patchValue({
      amount: currentApplication.amount,
      purpose: currentApplication.purpose,
      duration: currentApplication.duration
    });

    // Load existing documents
    if (currentApplication.documents) {
      Object.keys(currentApplication.documents).forEach(key => {
        if (currentApplication.documents[key as keyof typeof currentApplication.documents] instanceof File) {
          this.uploadedFiles[key] = currentApplication.documents[key as keyof typeof currentApplication.documents] as File;
        }
      });
    }
  }

  private setupFormWatchers(): void {
    this.loanForm.valueChanges.subscribe(() => {
      // EMI calculation will be reactive
    });
  }

  getInterestRate(): number {
    const purpose = this.loanForm.get("purpose")?.value;
    return this.interestRates[purpose] || 12; // default 12% if not found
  }

  get calculatedEMI(): number {
    const amount = this.loanForm.get("amount")?.value;
    const duration = this.loanForm.get("duration")?.value;
    const interestRate = this.getInterestRate();
    
    if (amount && duration) {
      return this.loanApplicationService.calculateEMI(
        +amount,
        +duration,
        interestRate
      );
    }
    return 0;
  }

  getDurationLabel(value: string): string {
    const duration = this.loanDurations.find(d => d.value === value);
    return duration ? duration.label : '';
  }

  onFileSelected(event: any, documentType: string): void {
    const file = event.target.files[0];
    if (file && this.validateFile(file)) {
      this.uploadedFiles[documentType] = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent, documentType: string): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.validateFile(file)) {
        this.uploadedFiles[documentType] = file;
      }
    }
  }

  private validateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (file.size > maxSize) {
      alert('File size should not exceed 5MB');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      return false;
    }
    
    return true;
  }

  removeFile(documentType: string, event: Event): void {
    event.stopPropagation();
    delete this.uploadedFiles[documentType];
  }

  isFormValid(): boolean {
    return this.loanForm.valid && 
           this.uploadedFiles['aadhaarCard'] !== undefined && 
           this.uploadedFiles['panCard'] !== undefined;
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      // Update loan details
      const loanData = this.loanForm.value;
      this.loanApplicationService.updateApplication(loanData);
      
      // Update documents
      this.loanApplicationService.updateDocuments(this.uploadedFiles);
      
      // Navigate to review
      this.onNext.emit();
    } else {
      this.markFormGroupTouched(this.loanForm);
    }
  }

  goBack(): void {
    this.onBack.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldPath: string): string {
    const control = this.loanForm.get(fieldPath);
    if (control?.errors && control.touched) {
      return this.getValidationMessage(fieldPath, control.errors);
    }
    return '';
  }

  private getValidationMessage(fieldName: string, errors: any): string {
    if (errors['required']) return 'This field is required';
    if (errors['min']) return `Minimum amount is ₹${errors['min'].min}`;
    if (errors['max']) return `Maximum amount is ₹${errors['max'].max}`;
    return 'Please enter a valid value';
  }

  isFieldInvalid(fieldPath: string): boolean {
    const control = this.loanForm.get(fieldPath);
    return !!(control?.invalid && control?.touched);
  }
}
