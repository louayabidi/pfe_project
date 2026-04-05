/**
 * ============================================================================
 * RULE SERVICE (UPDATED)
 * ============================================================================
 * Service for managing rules with app-scoped operations.
 * Now accepts appId parameter for all operations.
 * 
 * Location: src/app/services/rule.service.ts
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Condition {
  field: string;
  operator: string;
  value: any;
}

export interface Action {
  type: 'POINTS' | 'BADGE';
  pointsAmount?: number;
  badgeId?: number;
  targetId?: number;
}

export interface CreateRuleRequest {
  name: string;
  description?: string;
  triggerEvent: string;
  conditions: Condition[];
  actions: Action[];
  priority?: number;
}

export interface Rule {
  id: number;
  name: string;
  description: string;
  triggerEvent: string;
  conditions: any[];
  actions: any[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  appId: number;
}

@Injectable({ providedIn: 'root' })
export class RuleService {
  private readonly API = `${environment.apiUrl}/api/rules`;
  private rulesCache = new Map<number, Rule[]>();

  constructor(private http: HttpClient) {}

  /**
   * Get all rules for a specific app
   * Implements cache to avoid repeated requests
   */
  getRules(appId: number): Observable<Rule[]> {
    // Return cached if available
    if (this.rulesCache.has(appId)) {
      return of(this.rulesCache.get(appId)!);
    }

    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<Rule[]>(this.API, { params }).pipe(
      tap(rules => {
        // Cache the result
        this.rulesCache.set(appId, rules);
      }),
      catchError(err => {
        console.error('Error fetching rules:', err);
        return of([]);
      })
    );
  }

  /**
   * Get a single rule by ID
   */
  getRule(id: number, appId: number): Observable<Rule> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<Rule>(`${this.API}/${id}`, { params }).pipe(
      catchError(err => {
        console.error('Error fetching rule:', err);
        throw err;
      })
    );
  }

  /**
   * Create a new rule for the app
   */
  createRule(appId: number, data: CreateRuleRequest): Observable<Rule> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.post<Rule>(this.API, data, { params }).pipe(
      tap(rule => {
        // Invalidate cache after creation
        this.rulesCache.delete(appId);
      }),
      catchError(err => {
        console.error('Error creating rule:', err);
        throw err;
      })
    );
  }

  /**
   * Toggle rule active status
   */
  toggleRule(ruleId: number, active: boolean, appId: number): Observable<Rule> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.patch<Rule>(
      `${this.API}/${ruleId}/toggle`,
      { active },
      { params }
    ).pipe(
      tap(() => {
        // Invalidate cache after toggle
        this.rulesCache.delete(appId);
      }),
      catchError(err => {
        console.error('Error toggling rule:', err);
        throw err;
      })
    );
  }

  /**
   * Delete a rule
   */
  deleteRule(ruleId: number, appId: number): Observable<void> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.delete<void>(`${this.API}/${ruleId}`, { params }).pipe(
      tap(() => {
        // Invalidate cache after deletion
        this.rulesCache.delete(appId);
      }),
      catchError(err => {
        console.error('Error deleting rule:', err);
        throw err;
      })
    );
  }

  /**
   * Invalidate cache for a specific app
   */
  invalidateCache(appId: number): void {
    this.rulesCache.delete(appId);
  }

  /**
   * Clear all caches (optional, for logout scenarios)
   */
  clearCache(): void {
    this.rulesCache.clear();
  }
}