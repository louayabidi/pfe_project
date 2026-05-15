import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppModel {
  id: number;
  name: string;
  description: string;
  apiKey: string;
  active: boolean;
  createdAt: string;
}

export interface CreateAppRequest {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class AppModelService {
  private readonly API = `${environment.apiUrl}/api/apps`;

  constructor(private http: HttpClient) {}

  getMyApps(): Observable<AppModel[]> {
    return this.http.get<AppModel[]>(this.API);
  }

  createApp(data: CreateAppRequest): Observable<AppModel> {
    return this.http.post<AppModel>(this.API, data);
  }

   deleteApp(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  updateApp(id: number, payload: { name: string; description?: string }): Observable<AppModel> {
  return this.http.put<AppModel>(`${this.API}/${id}`, payload);
}
}