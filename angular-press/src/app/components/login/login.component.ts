import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  email = '';
  displayName = '';
  isRegistering = false;
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    if (this.isRegistering) {
      this.register();
    } else {
      this.login();
    }
  }

  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        console.log('Login successful:', user);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  register(): void {
    if (!this.email || !this.displayName) {
      this.error = 'Email and display name are required for registration';
      this.loading = false;
      return;
    }

    this.authService.register(this.username, this.email, this.password, this.displayName).subscribe({
      next: (user) => {
        console.log('Registration successful:', user);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.error = '';
  }
}

