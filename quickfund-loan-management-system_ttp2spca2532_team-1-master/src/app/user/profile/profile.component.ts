import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class ProfileComponent implements OnInit {
  activeTab: 'profile' | 'security' = 'profile';
  user: any;
  editMode = false;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  private originalProfileData: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Profile form
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [{ value: '', disabled: true }],
      dateJoined: [{ value: '', disabled: true }],
      street: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      state: [{ value: '', disabled: true }],
      pinCode: [{ value: '', disabled: true }]
    });

    // Password form
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordsMatch }
    );
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.userService.getUser(userId).subscribe({
          next: (res) => {
            this.user = res;
            this.originalProfileData = { ...res }; 

            // Fixed the form patching with proper data structure
            this.profileForm.patchValue({
              name: res.name,
              email: res.email,
              phone: res.phone,
              dateJoined: res.details?.dateJoined,
              street: res.details?.addressDetails?.street,
              city: res.details?.addressDetails?.city,
              state: res.details?.addressDetails?.state,
              pinCode: res.details?.addressDetails?.pinCode
            });
          },
          error: (err) => console.error('Error fetching user:', err)
        });
      }
    }
  }

  // Fixed credit status method - your data doesn't have creditScore, you might need to add it
  getCreditStatus(score?: number): string {
    if (score === undefined || score === null) return 'Not Available';
    if (score >= 750) return 'Good';
    if (score >= 600) return 'Fair';
    return 'Poor';
  }

  // Helper method to get employment status
  getEmploymentStatus(): string {
    if (!this.user?.details) return 'Not Available';
    
    if (this.user.details.occupation === 'employed' && this.user.details.employment) {
      return `${this.user.details.employment.employmentType} at ${this.user.details.employment.employer}`;
    } else if (this.user.details.occupation === 'student') {
      return 'Student';
    } else if (this.user.details.occupation === 'self-employed') {
      return 'Self Employed';
    } else if (this.user.details.occupation === 'unemployed') {
      return 'Unemployed';
    }
    
    return this.user.details.occupation || 'Not Specified';
  }

  // Helper method to get monthly income
  getMonthlyIncome(): string {
    if (!this.user?.details) return 'Not Available';

    // For employed users, calculate from annual income
    if (this.user.details.occupation === 'employed' && this.user.details.employment?.annualIncome) {
      const monthlyIncome = this.user.details.employment.annualIncome / 12;
      return `₹${monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }

    // For other occupations, check if monthly income is specified
    if (this.user.details.otherOccupation?.monthlyIncome) {
      return `₹${this.user.details.otherOccupation.monthlyIncome.toLocaleString('en-IN')}`;
    }

    return 'Not Available';
  }

  // Helper method to get full address
  getFullAddress(): string {
    const address = this.user?.details?.addressDetails;
    if (!address) return 'Not Available';

    const parts = [
      address.street,
      address.city,
      address.state,
      address.pinCode
    ].filter(part => part && part.trim() !== '');

    return parts.length > 0 ? parts.join(', ') : 'Not Available';
  }

  // Helper method to get annual income
  getAnnualIncome(): string {
    if (this.user?.details?.employment?.annualIncome) {
      return `₹${this.user.details.employment.annualIncome.toLocaleString('en-IN')}`;
    }
    return 'Not Available';
  }

  // Helper method to get job title
  getJobTitle(): string {
    return this.user?.details?.employment?.jobTitle || 'Not Available';
  }

  // Helper method to get years of employment
  getYearsEmployed(): string {
    if (this.user?.details?.employment?.yearsEmployed) {
      const years = this.user.details.employment.yearsEmployed;
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return 'Not Available';
  }

  enableEdit() {
    this.editMode = true;
    ['name', 'email', 'phone', 'street', 'city', 'state', 'pinCode'].forEach((field) =>
      this.profileForm.get(field)?.enable()
    );
  }

  cancelEdit() {
    this.editMode = false;
    this.profileForm.patchValue({
      name: this.originalProfileData.name,
      email: this.originalProfileData.email,
      phone: this.originalProfileData.phone,
      dateJoined: this.originalProfileData.details?.dateJoined,
      street: this.originalProfileData.details?.addressDetails?.street,
      city: this.originalProfileData.details?.addressDetails?.city,
      state: this.originalProfileData.details?.addressDetails?.state,
      pinCode: this.originalProfileData.details?.addressDetails?.pinCode
    });
    this.profileForm.disable();
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const updatedData = {
        ...this.user,
        name: this.profileForm.getRawValue().name,
        email: this.profileForm.getRawValue().email,
        phone: this.profileForm.getRawValue().phone,
        details: {
          ...this.user.details,
          addressDetails: {
            ...this.user.details?.addressDetails,
            street: this.profileForm.getRawValue().street,
            city: this.profileForm.getRawValue().city,
            state: this.profileForm.getRawValue().state,
            pinCode: this.profileForm.getRawValue().pinCode
          },
          dateJoined: this.user.details?.dateJoined 
        }
      };

      this.userService.updateUser(this.user._id || this.user.id, updatedData).subscribe({
        next: (res) => {
          this.user = res;
          this.originalProfileData = { ...res };
          this.editMode = false;
          this.profileForm.disable();
          alert('Profile updated successfully');
        },
        error: (err) => alert('Failed to update profile: ' + err.message)
      });
    }
  }

  updatePassword(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService.updatePassword(this.user._id || this.user.id, {
        currentPassword,
        newPassword
      }).subscribe({
        next: () => {
          alert('Password updated successfully');
          this.passwordForm.reset();
        },
        error: (err) => alert('Failed to update password: ' + err.error.message)
      });
    }
  }

  private passwordsMatch(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }
}