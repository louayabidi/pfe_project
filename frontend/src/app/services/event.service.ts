import { Injectable } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EventFilters, EventPage } from '../core/models/event.model';


@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API = `${environment.apiUrl}/api/events`;

  constructor(private http: HttpClient) {}

  // Récupère les events enregistrés par le scanner
getRegisteredEvents(appId: number): Observable<string[]> {
  return this.http.get<string[]>(`${this.API}/registered`, {
    params: { appId: appId.toString() }
  });
}



getIncomingEvents(appId: number, filters: EventFilters): Observable<EventPage> {
    let params = new HttpParams()
      .set('appId', appId)
      .set('page',  filters.page)
      .set('size',  filters.size);

    if (filters.userId)    params = params.set('userId',    filters.userId);
    if (filters.eventName) params = params.set('eventName', filters.eventName);
    if (filters.dateFrom)  params = params.set('dateFrom',  filters.dateFrom);
    if (filters.dateTo)    params = params.set('dateTo',    filters.dateTo);

    return this.http.get<EventPage>(`${this.API}/incoming`, { params });
  }

  getDistinctUsers(appId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/incoming/users`,
      { params: new HttpParams().set('appId', appId) });
  }

  getDistinctEventNames(appId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/incoming/event-names`,
      { params: new HttpParams().set('appId', appId) });
  }
}