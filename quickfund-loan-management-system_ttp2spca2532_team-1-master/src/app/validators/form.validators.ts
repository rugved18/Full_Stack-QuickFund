import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  static nameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(control.value)) {
      return { invalidName: true };
    }
    return null;
  };

  static indianPhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(control.value)) {
      return { invalidPhone: true };
    }
    return null;
  };

  static aadhaarValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const aadhaarPattern = /^\d{12}$/;
    if (!aadhaarPattern.test(control.value)) {
      return { invalidAadhaar: true };
    }
    return null;
  };

  static pinCodeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const pinCodePattern = /^\d{6}$/;
    if (!pinCodePattern.test(control.value)) {
      return { invalidPinCode: true };
    }
    return null;
  };

  static ageValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 18) {
        return { underAge: true };
      }
    }
    
    if (age < 18) {
      return { underAge: true };
    }
    
    return null;
  };

  static emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    // Strict email regex that requires proper format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(control.value)) {
      return { invalidEmail: true };
    }
    
    // Additional checks for common invalid patterns
    const value = control.value.toLowerCase();
    
    // Check for consecutive dots
    if (value.includes('..')) {
      return { invalidEmail: true };
    }
    
    // Check for invalid characters in local part
    if (!/^[a-zA-Z0-9._%+-]+$/.test(value.split('@')[0])) {
      return { invalidEmail: true };
    }
    
    // Check for invalid characters in domain part
    const domain = value.split('@')[1];
    if (domain && !/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return { invalidEmail: true };
    }
    
    return null;
  };
}