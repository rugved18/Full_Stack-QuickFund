import { FormGroup } from '@angular/forms';

export class FormUtils {
  
  static markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  static getNestedControl(formGroup: FormGroup, path: string) {
    return path.split('.').reduce((group: any, key: string) => {
      return group?.get(key);
    }, formGroup);
  }

  static formatCurrency(value: string): string {
    if (!value) return '';
    const numValue = value.replace(/\D/g, '');
    if (!numValue) return '';
    return new Intl.NumberFormat('en-IN').format(parseInt(numValue));
  }

  static formatCurrencyInput(event: any, formGroup: FormGroup, controlName: string): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value) {
      const formattedValue = new Intl.NumberFormat('en-IN').format(parseInt(value));
      event.target.value = formattedValue;
      formGroup.get(controlName)?.setValue(value);
    }
  }

  static calculateEMI(amount: number, durationMonths: number, annualRate: number = 12): number {
    if (!amount || !durationMonths) return 0;
    
    const monthlyRate = annualRate / 12 / 100;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
                (Math.pow(1 + monthlyRate, durationMonths) - 1);
    
    return Math.round(emi);
  }

  static isFieldInvalid(formGroup: FormGroup, fieldPath: string): boolean {
    const control = this.getNestedControl(formGroup, fieldPath);
    return !!(control?.invalid && control?.touched);
  }

  static clearGroupValidators(group: FormGroup): void {
    Object.keys(group.controls).forEach(key => {
      group.get(key)?.clearValidators();
      group.get(key)?.updateValueAndValidity();
    });
  }
}