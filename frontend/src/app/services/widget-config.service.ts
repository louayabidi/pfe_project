import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface WidgetConfigRequest {
  name: string;
  displayMode: string;
  contentMode: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  label: string;
  showLifetime: boolean;
  showLevel: boolean;
  animate: boolean;
  borderRadius: number;
  language: string;
}

export interface WidgetConfigResponse {
  id: number;
  publishableKey: string;
  name: string;
  displayMode: string;
  contentMode: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  label: string;
  showLifetime: boolean;
  showLevel: boolean;
  animate: boolean;
  borderRadius: number;
  generatedCode: string;
  createdAt: string;
  updatedAt: string;
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class WidgetConfigService {
  private apiUrl = `${environment.apiUrl}/api/widgets`;

  constructor(private http: HttpClient) {}

  saveConfig(appId: number, config: WidgetConfigRequest): Observable<WidgetConfigResponse> {
    return this.http.post<WidgetConfigResponse>(`${this.apiUrl}/config/${appId}`, config);
  }

  getConfig(publishableKey: string): Observable<WidgetConfigResponse> {
    return this.http.get<WidgetConfigResponse>(`${this.apiUrl}/config/${publishableKey}`);
  }

getAppConfigs(appId: number): Observable<WidgetConfigResponse[]> {
  return this.http.get<WidgetConfigResponse[]>(`${this.apiUrl}/config/${appId}`); 

}
}