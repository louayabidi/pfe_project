import { IncomingEvent, EventFilters, EventPage } from '../core/models/event.model';

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';



@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API = `${environment.apiUrl}/api/events`;
  
  // Simple metadata cache per app
  private usersCache = new Map<number, string[]>();
  private eventNamesCache = new Map<number, string[]>();

  constructor(private http: HttpClient) {}

  /**
   * Get registered events (from scanner) for an app
   */
  getRegisteredEvents(appId: number): Observable<string[]> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<string[]>(`${this.API}/registered`, { params }).pipe(
      catchError(err => {
        console.error('Error fetching registered events:', err);
        return of([]);
      })
    );
  }

  /**
   * Get incoming events with pagination and filters
   */
  getIncomingEvents(appId: number, filters: EventFilters): Observable<EventPage> {
    let params = new HttpParams()
      .set('appId', appId.toString())
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());

    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.eventName) params = params.set('eventName', filters.eventName);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get<EventPage>(`${this.API}/incoming`, { params }).pipe(
      catchError(err => {
        console.error('Error fetching incoming events:', err);
        throw err;
      })
    );
  }

  /**
   * Get distinct users who triggered events in an app
   * Uses cache to minimize requests
   */
  getDistinctUsers(appId: number): Observable<string[]> {
    if (this.usersCache.has(appId)) {
      return of(this.usersCache.get(appId)!);
    }

    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<string[]>(`${this.API}/incoming/users`, { params }).pipe(
      tap(users => this.usersCache.set(appId, users)),
      catchError(err => {
        console.error('Error fetching distinct users:', err);
        return of([]);
      })
    );
  }

  /**
   * Get distinct event names for an app
   * Uses cache to minimize requests
   */
  getDistinctEventNames(appId: number): Observable<string[]> {
    if (this.eventNamesCache.has(appId)) {
      return of(this.eventNamesCache.get(appId)!);
    }

    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<string[]>(`${this.API}/incoming/event-names`, { params }).pipe(
      tap(names => this.eventNamesCache.set(appId, names)),
      catchError(err => {
        console.error('Error fetching distinct event names:', err);
        return of([]);
      })
    );
  }

  /**
   * Invalidate metadata caches for an app
   */
  invalidateMetadata(appId: number): void {
    this.usersCache.delete(appId);
    this.eventNamesCache.delete(appId);
  }

  /**
   * Clear all caches (for logout)
   */
  clearCache(): void {
    this.usersCache.clear();
    this.eventNamesCache.clear();
  }
}