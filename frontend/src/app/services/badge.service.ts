/**
 * ============================================================================
 * BADGE SERVICE (UPDATED)
 * ============================================================================
 * Service for managing badges with app-scoped operations.
 * Now accepts appId parameter for all operations.
 * 
 * Location: src/app/services/badge.service.ts
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Badge {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  hidden: boolean;
  maxAwardsPerUser?: number;
  createdAt: string;
  updatedAt?: string;
  appId: number;
}

export interface CreateBadgeRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  hidden?: boolean;
  maxAwardsPerUser?: number;
}

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly API = `${environment.apiUrl}/api/badges`;
  private badgeCache = new Map<number, Badge[]>();

  constructor(private http: HttpClient) {}

  /**
   * Get all badges for a specific app
   * Implements simple cache to avoid repeated requests
   */
  getBadges(appId: number): Observable<Badge[]> {
    // Return cached if available
    if (this.badgeCache.has(appId)) {
      return of(this.badgeCache.get(appId)!);
    }

    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<Badge[]>(this.API, { params }).pipe(
      tap(badges => {
        // Cache the result
        this.badgeCache.set(appId, badges);
      }),
      catchError(err => {
        console.error('Error fetching badges:', err);
        return of([]);
      })
    );
  }

  /**
   * Get a single badge by ID
   */
  getBadge(id: number, appId: number): Observable<Badge> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<Badge>(`${this.API}/${id}`, { params }).pipe(
      catchError(err => {
        console.error('Error fetching badge:', err);
        throw err;
      })
    );
  }

  /**
   * Create a new badge for the app
   */
  createBadge(appId: number, request: CreateBadgeRequest): Observable<Badge> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.post<Badge>(this.API, request, { params }).pipe(
      tap(badge => {
        // Invalidate cache after creation
        this.badgeCache.delete(appId);
      }),
      catchError(err => {
        console.error('Error creating badge:', err);
        throw err;
      })
    );
  }

  /**
   * Delete a badge
   */
  deleteBadge(id: number, appId: number): Observable<void> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.delete<void>(`${this.API}/${id}`, { params }).pipe(
      tap(() => {
        // Invalidate cache after deletion
        this.badgeCache.delete(appId);
      }),
      catchError(err => {
        console.error('Error deleting badge:', err);
        throw err;
      })
    );
  }

  /**
   * Invalidate cache for a specific app (call after operations)
   */
  invalidateCache(appId: number): void {
    this.badgeCache.delete(appId);
  }

  /**
   * Clear all caches (optional, for logout scenarios)
   */
  clearCache(): void {
    this.badgeCache.clear();
  }


  uploadImage(file: File): Observable<string> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http
    .post<{ url: string }>(`${environment.apiUrl}/api/badges/upload-image`, formData)
    .pipe(map(res => res.url));
}
}