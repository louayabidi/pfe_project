// frontend/src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalOwners:        number;
  activeOwners:       number;
  verifiedOwners:     number;
  totalAdmins:        number;
  totalApps:          number;
  totalRules:         number;
  totalAdvancedRules: number;
}

export interface OwnerSummary {
  id: number;
  email: string;
  fullName: string;
  companyName?: string;
  verified: boolean;
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
  
  // Verification audit trail
  verifiedByAdminEmail?: string;
  verifiedAt?: Date;

  // Stats
  totalApps: number;
  totalRules: number;
  totalAdvancedRules: number;
}

export interface AdminUser {
  id:        number;
  email:     string;
  fullName:  string;
  role:      'ADMIN' | 'SUPER_ADMIN';
  active:    boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface CreateAdminRequest {
  email:    string;
  password: string;
  fullName: string;
}

// ── SERVICE ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly BASE = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  // Stats
  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.BASE}/stats`);
  }

  // Owners
  getOwners(): Observable<OwnerSummary[]> {
    return this.http.get<OwnerSummary[]>(`${this.BASE}/owners`);
  }
  toggleOwner(id: number): Observable<OwnerSummary> {
    return this.http.put<OwnerSummary>(`${this.BASE}/owners/${id}/toggle`, {});
  }
  deleteOwner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/owners/${id}`);
  }

  // Admins (Super Admin only)
  getAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.BASE}/admins`);
  }
  createAdmin(req: CreateAdminRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.BASE}/admins`, req);
  }
  toggleAdmin(id: number): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.BASE}/admins/${id}/toggle`, {});
  }


  verifyOwner(ownerId: number, verify: boolean): Observable<OwnerSummary> {
  return this.http.patch<OwnerSummary>(
    `${this.BASE}/owners/${ownerId}/verify`,
    { verify }
  );
}
}