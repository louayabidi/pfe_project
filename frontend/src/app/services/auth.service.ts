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
      tap(res  => this.handleAuthSuccess(res)),
      catchError(err => this.handleError(err))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
      tap(res  => this.handleAuthSuccess(res)),
      catchError(err => this.handleError(err))
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

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.message || err.error || 'An error occurred';
    return throwError(() => new Error(message));
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
    catchError(err => this.handleError(err))
  );
}


}