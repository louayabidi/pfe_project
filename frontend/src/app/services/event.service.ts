import { IncomingEvent, EventFilters, EventPage } from '../core/models/event.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API = `${environment.apiUrl}/api/events`;
  
  private usersCache = new Map<number, string[]>();
  private eventNamesCache = new Map<number, string[]>();

  constructor(private http: HttpClient) {}

  getRegisteredEvents(appId: number): Observable<string[]> {
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<string[]>(`${this.API}/registered`, { params }).pipe(
      catchError(err => {
        console.error('Error fetching registered events:', err);
        return of([]);
      })
    );
  }

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

  getDistinctDisplayNames(appId: number): Observable<string[]> {
    if (this.usersCache.has(appId)) {
      return of(this.usersCache.get(appId)!);
    }

    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<string[]>(`${this.API}/incoming/display-names`, { params }).pipe(
      tap(names => this.usersCache.set(appId, names)),
      catchError(err => {
        console.error('Error fetching distinct display names:', err);
        return of([]);
      })
    );
  }

  invalidateMetadata(appId: number): void {
    this.usersCache.delete(appId);
    this.eventNamesCache.delete(appId);
  }

  clearCache(): void {
    this.usersCache.clear();
    this.eventNamesCache.clear();
  }
}