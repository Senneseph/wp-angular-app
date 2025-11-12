import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '../../core/utils/api-url.util';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  error: string = '';
  loading: boolean = false;
  private isBrowser: boolean;
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.apiUrl = getApiUrl();
  }

  onSubmit(): void {
    this.error = '';

    // Validation
    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.http.post<{ access_token: string; message: string }>(
      `${this.apiUrl}/auth/change-password`,
      { newPassword: this.newPassword }
    ).subscribe({
      next: (response) => {
        // Update the token in localStorage
        if (this.isBrowser) {
          localStorage.setItem('access_token', response.access_token);
        }

        // Redirect to dashboard
        this.router.navigate(['/ap-admin/dashboard']);
      },
      error: (err) => {
        console.error('Password change error:', err);
        this.error = err.error?.message || 'Failed to change password. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

