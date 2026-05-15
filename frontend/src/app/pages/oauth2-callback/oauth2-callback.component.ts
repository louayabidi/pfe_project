import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../core/models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth2-callback',
  template: `
    <div style="
      display:flex; align-items:center; justify-content:center;
      min-height:100vh; background:#06050f; color:rgba(255,255,255,0.6);
      font-family:'DM Sans',sans-serif; font-size:1rem; gap:12px;">
      <span style="
        width:20px; height:20px; border-radius:50%;
        border:2px solid rgba(123,92,250,0.3);
        border-top-color:#7B5CFA;
        animation:spin 0.7s linear infinite;
        display:inline-block;">
      </span>
      Signing you in…
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `
})
export class OAuth2CallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error || !token) {
        this.router.navigate(['/login'], {
          queryParams: { error: 'Google sign-in failed. Please try again.' }
        });
        return;
      }

      // Save token then fetch the user profile to populate AuthResponse
      this.tokenService.saveToken(token);

      this.http.get<AuthResponse>(`${environment.apiUrl}/api/auth/me`).subscribe({
        next: (user) => {
          this.tokenService.saveUser(user);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          // Fallback: build a minimal AuthResponse from the token itself
          // (useful if you don't have a /me endpoint yet)
          const minimal: AuthResponse = {
            id: 0,
            email: '',
            fullName: '',
            companyName: '',
            message: 'Google login successful',
            verified: true,
            token
          };
          this.tokenService.saveUser(minimal);
          this.router.navigate(['/dashboard']);
        }
      });
    });
  }
}