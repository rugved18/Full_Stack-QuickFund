import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../modals/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @Output() register = new EventEmitter<any>();
  @Output() switchToLogin = new EventEmitter<void>();

  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { name, email, phone, password, confirmPassword } = this.registerForm.value;

      if (password !== confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      // ✅ Build user object with correct nested structure
      const newUser: User = {
        _id: '', // backend will generate this
        name,
        email,
        phone,
        password,
        role: 'user',
        details: {
          firstName: '',
          lastName: '',
          dob: '',
          aadharNumber: '',
          countryCode: '+91',
          occupation: '',
          addressDetails: {
            street: '',
            city: '',
            state: '',
            pinCode: ''
          },
          employment: {
            employer: '',
            jobTitle: '',
            annualIncome: 0,
            employmentType: '',
            yearsEmployed: 0
          },
          education: {
            institution: '',
            degree: '',
            fieldOfStudy: '',
            yearOfStudy: '',
            expectedGraduation: '',
            feeStructure: ''
          },
          otherOccupation: {
            occupationDescription: '',
            sourceOfIncome: '',
            monthlyIncome: null
          },
          monthlyIncome: 0,
          employmentStatus: '',
          creditScore: 0,
          dateJoined: new Date().toISOString()
        }
      };

      this.authService.registerUser(newUser).subscribe({
        next: () => {
          alert('Registration successful! Please login.');
          this.switchToLogin.emit();
        },
        error: (err) => {
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
