import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from '../models/user.interface';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  access_token: string;
}

interface RegisterDto {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

interface BackendUser {
  ID: number;
  user_login: string;
  user_email: string;
  display_name: string;
  user_registered: string;
  user_status: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          // Store the JWT token
          localStorage.setItem('access_token', response.access_token);

          // Get user info from token
          const user = this.getCurrentUser();

          // Store user in localStorage and update subject
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);

          return user;
        })
      );
  }

  register(username: string, email: string, password: string, displayName: string): Observable<User> {
    const registerDto: RegisterDto = { username, email, password, displayName };

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, registerDto)
      .pipe(
        map(response => {
          // Store the JWT token
          localStorage.setItem('access_token', response.access_token);

          // Get user info from token
          const user = this.getCurrentUser();

          // Store user in localStorage and update subject
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);

          return user;
        })
      );
  }

  getCurrentUser(): User {
    // For now, decode the JWT token to get user info
    // In a real app, you might want to call /auth/me endpoint
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }

    // Decode JWT token (simple base64 decode - in production use a proper JWT library)
    const payload = JSON.parse(atob(token.split('.')[1]));

    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      firstName: payload.username, // Backend doesn't have firstName/lastName yet
      lastName: '',
      role: 'administrator', // TODO: Get from backend
      capabilities: ['manage_options', 'edit_posts', 'publish_posts'], // TODO: Get from backend
      meta: {},
      registeredDate: new Date(),
      status: 'active'
    };
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasCapability(capability: string): boolean {
    return this.currentUser?.capabilities.includes(capability) || false;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}