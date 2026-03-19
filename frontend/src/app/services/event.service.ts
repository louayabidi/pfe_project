import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
}