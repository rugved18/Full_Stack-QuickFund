import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanApplicationService } from '../../../../services/loan-application.service';
import { CustomValidators } from '../../../../validators/form.validators';
import { OCCUPATION_TYPES, EMPLOYMENT_TYPES, INDIAN_STATES } from '../../../../constants/form-options.constants';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.css'
})
export class PersonalDetailsComponent implements OnInit {
  @Output() onNext = new EventEmitter<void>();

  personalForm: FormGroup;
  
  readonly occupationTypes = OCCUPATION_TYPES;
  readonly employmentTypes = EMPLOYMENT_TYPES;
  readonly indianStates = INDIAN_STATES;

  constructor(
    private fb: FormBuilder,
    private loanApplicationService: LoanApplicationService
  ) {
    this.personalForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormWatchers();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), CustomValidators.nameValidator]],
      lastName: ['', [Validators.required, Validators.minLength(1), CustomValidators.nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, CustomValidators.indianPhoneValidator]],
      countryCode: ['+91', Validators.required],
      dateOfBirth: ['', [Validators.required, CustomValidators.ageValidator]],
      aadharNumber: ['', [Validators.required, CustomValidators.aadhaarValidator]],
      
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', [Validators.required, CustomValidators.nameValidator]],
        state: ['', Validators.required],
        pinCode: ['', [Validators.required, CustomValidators.pinCodeValidator]]
      }),
      
      occupationType: ['employed', Validators.required],
      
      employment: this.fb.group({
        employer: [''],
        jobTitle: [''],
        annualIncome: [''],
        employmentType: ['full-time'],
        yearsEmployed: ['']
      }),
      
      education: this.fb.group({
        institution: [''],
        degree: [''],
        fieldOfStudy: [''],
        yearOfStudy: [''],
        expectedGraduation: [''],
        feeStructure: ['']
      }),
      
      otherOccupation: this.fb.group({
        occupationDescription: [''],
        sourceOfIncome: [''],
        monthlyIncome: ['']
      })
    });
  }

  private initializeForm(): void {
    const currentApplication = this.loanApplicationService.application();
    if (currentApplication.personalInfo) {
      this.personalForm.patchValue(currentApplication.personalInfo);
    }
  }

  private setupFormWatchers(): void {
    this.personalForm.get('occupationType')?.valueChanges.subscribe(value => {
      this.updateOccupationValidators(value);
    });

    this.updateOccupationValidators(this.personalForm.get('occupationType')?.value || 'employed');
  }

  private updateOccupationValidators(occupationType: string): void {
    const employmentGroup = this.personalForm.get('employment') as FormGroup;
    const educationGroup = this.personalForm.get('education') as FormGroup;
    const otherGroup = this.personalForm.get('otherOccupation') as FormGroup;

    this.clearGroupValidators(employmentGroup);
    this.clearGroupValidators(educationGroup);
    this.clearGroupValidators(otherGroup);

    switch (occupationType) {
      case 'employed':
        this.addEmploymentValidators(employmentGroup);
        break;
      case 'student':
        this.addEducationValidators(educationGroup);
        break;
      case 'other':
        this.addOtherOccupationValidators(otherGroup);
        break;
    }
  }

  private clearGroupValidators(group: FormGroup): void {
    Object.keys(group.controls).forEach(key => {
      group.get(key)?.clearValidators();
      group.get(key)?.updateValueAndValidity();
    });
  }

  private addEmploymentValidators(group: FormGroup): void {
    group.get('employer')?.setValidators([Validators.required]);
    group.get('jobTitle')?.setValidators([Validators.required]);
    group.get('annualIncome')?.setValidators([Validators.required, Validators.min(1)]);
    group.get('yearsEmployed')?.setValidators([Validators.required, Validators.min(0)]);
    group.updateValueAndValidity();
  }

  private addEducationValidators(group: FormGroup): void {
    group.get('institution')?.setValidators([Validators.required]);
    group.get('degree')?.setValidators([Validators.required]);
    group.get('fieldOfStudy')?.setValidators([Validators.required]);
    group.get('yearOfStudy')?.setValidators([Validators.required]);
    group.get('expectedGraduation')?.setValidators([Validators.required]);
    group.get('feeStructure')?.setValidators([Validators.required, Validators.min(1)]);
    group.updateValueAndValidity();
  }

  private addOtherOccupationValidators(group: FormGroup): void {
    group.get('occupationDescription')?.setValidators([Validators.required]);
    group.get('sourceOfIncome')?.setValidators([Validators.required]);
    group.get('monthlyIncome')?.setValidators([Validators.required, Validators.min(1)]);
    group.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.personalForm.valid) {
      const formValue = this.personalForm.value;
      this.loanApplicationService.updatePersonalInfo(formValue);
      this.onNext.emit();
    } else {
      this.markFormGroupTouched(this.personalForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  getFieldError(fieldPath: string): string {
    const control = this.getNestedControl(this.personalForm, fieldPath);
    if (control?.errors && control.touched) {
      return this.getValidationMessage(fieldPath, control.errors);
    }
    return '';
  }

  private getNestedControl(form: FormGroup, path: string): AbstractControl<any> | null {
  return path.split('.').reduce<AbstractControl<any> | null>(
    (control, key) => control instanceof FormGroup ? control.get(key) : null,
    form
  );
}

  private getValidationMessage(fieldName: string, errors: any): string {
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['min']) return 'Value must be greater than 0';
    if (errors['underAge']) return 'You must be at least 18 years old';
    if (errors['invalidPhone']) return 'Please enter a valid 10-digit phone number';
    if (errors['invalidAadhaar']) return 'Please enter a valid 12-digit Aadhaar number';
    if (errors['invalidPinCode']) return 'Please enter a valid 6-digit PIN code';
    if (errors['invalidName']) return 'Please enter a valid name (letters and spaces only)';
    return 'Please enter a valid value';
  }

  isFieldInvalid(fieldPath: string): boolean {
    const control = this.getNestedControl(this.personalForm, fieldPath);
    return !!(control?.invalid && control?.touched);
  }

  get currentOccupationType(): string {
    return this.personalForm.get('occupationType')?.value || 'employed';
  }

  getOccupationIcon(type: string): string {
    switch(type) {
      case 'employed': return 'bi bi-building';
      case 'student': return 'bi bi-mortarboard';
      case 'other': return 'bi bi-briefcase';
      default: return 'bi bi-briefcase';
    }
  }
}