import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProfileResponse {
  id:                 number;
  email:              string;
  fullName:           string;
  companyName:        string;
  isVerified:         boolean;
  lastLogin:          string;
  createdAt:          string;
  totalApps:          number;
  totalRules:         number;
  totalAdvancedRules: number;
}

export interface UpdateProfileRequest {
  fullName:    string;
  companyName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly API = `${environment.apiUrl}/api/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.API);
  }

  updateProfile(req: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(this.API, req);
  }

  changePassword(req: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.API}/password`, req);
  }
}