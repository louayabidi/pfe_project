import { Injectable } from '@angular/core';
import { AuthResponse } from '../core/models/auth.models';

const TOKEN_KEY = 'gamify_token';
const USER_KEY  = 'gamify_user';

@Injectable({ providedIn: 'root' })
export class TokenService {

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  saveUser(user: AuthResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): AuthResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}