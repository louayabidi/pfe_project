import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../core/models/auth.models';
import { TokenService } from './token.service';
import { environment } from '../../environments/environment';

export interface AdminAuthResponse {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  token: string;
  message?: string;
}

export interface AuthError {
  error: string;
  message: string;
  remainingSeconds?: number;
  remainingMinutes?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/api/auth`;
  private readonly ADMIN_API = `${environment.apiUrl}/api/admin`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(
    this.tokenService.getUser()
  );
  
  // Public observable for components to subscribe to
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}
  
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => this.handleAuthError(err))
    );
  }
  
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => this.handleAuthError(err))
    );
  }
  
  logout(): void {
    this.tokenService.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }
  
  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }
  
  private handleAuthSuccess(res: AuthResponse): void {
    this.tokenService.saveToken(res.token);
    this.tokenService.saveUser(res);
    this.currentUserSubject.next(res);
  }
  
  /**
   * Enhanced error handling that properly extracts error messages from backend responses
   */
// In handleAuthError — fix the order so status 0 only fires when there's no message yet
private handleAuthError(err: HttpErrorResponse): Observable<never> {
  let errorMessage = '';

  if (err.status === 0) {
    errorMessage = 'Unable to connect to server. Please check your connection.';
  } else if (err.error && typeof err.error === 'object') {
    errorMessage = err.error.message || err.error.error || '';
  } else if (typeof err.error === 'string') {
    errorMessage = err.error;
  }

  // Fallbacks per status code
  if (!errorMessage) {
    if (err.status === 400) errorMessage = 'Invalid request. Please check your input.';
    else if (err.status === 401) errorMessage = 'Invalid email or password';
    else if (err.status === 403) errorMessage = 'Access forbidden';
    else if (err.status === 404) errorMessage = 'Service not found';
    else if (err.status === 500) errorMessage = 'Server error. Please try again later.';
    else errorMessage = 'An unexpected error occurred';
  }

  return throwError(() => new Error(errorMessage));
}
  
  adminLogin(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AdminAuthResponse>(`${this.ADMIN_API}/auth/login`, data).pipe(
      map((adminRes: AdminAuthResponse): AuthResponse => ({
        id: adminRes.id,
        email: adminRes.email,
        fullName: adminRes.fullName,
        companyName: '',                    // admins don't have a company
        message: adminRes.message || 'Admin login successful',
        verified: false,                    // admins are not "verified" like owners
        token: adminRes.token,
        role: adminRes.role 
      })),
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => this.handleAuthError(err))
    );
  }
}