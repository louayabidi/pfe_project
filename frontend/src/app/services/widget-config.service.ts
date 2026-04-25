// frontend/src/app/services/widget-config.service.ts
// Replace your existing file with this — only change is layoutJson? added to the interface.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Response interface (mirrors WidgetConfigResponse.java) ───────────────────
export interface WidgetConfigResponse {
  id             : number;
  publishableKey : string;
  name           : string;
  displayMode    : string;
  contentMode    : string;
  backgroundColor: string;
  textColor      : string;
  accentColor    : string;
  label          : string;
  showLifetime   : boolean;
  showLevel      : boolean;
  animate        : boolean;
  borderRadius   : number;
  fontFamily    ?: string;
  darkMode      ?: boolean;
  language      ?: string;
  generatedCode  : string;
  layoutJson    ?: string;   // ← full canvas snapshot from Widget Studio
  createdAt     ?: string;
  updatedAt     ?: string;
}

// ── Request interface (mirrors WidgetConfigRequest.java) ─────────────────────
export interface WidgetConfigRequest {
  name           : string;
  displayMode    : string;
  contentMode    : string;
  backgroundColor: string;
  textColor      : string;
  accentColor    : string;
  label          : string;
  showLifetime   : boolean;
  showLevel      : boolean;
  animate        : boolean;
  borderRadius   : number;
  fontFamily    ?: string;
  darkMode      ?: boolean;
  language      ?: string;
  layoutJson    ?: string;   // ← serialised canvas elements + frame
}

// ── Service ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class WidgetConfigService {

  private readonly base = `${environment.apiUrl}/api/widgets`;

  constructor(private http: HttpClient) {}

  /** Load all widget configs for an app (dashboard use). */
  getAppConfigs(appId: number): Observable<WidgetConfigResponse[]> {
    return this.http.get<WidgetConfigResponse[]>(
      `${this.base}/config/${appId}`
    );
  }

  /** Save (create or update) a widget config. */
  saveConfig(
    appId  : number,
    payload: WidgetConfigRequest
  ): Observable<WidgetConfigResponse> {
    return this.http.post<WidgetConfigResponse>(
      `${this.base}/config/${appId}`,
      payload
    );
  }

  /** Public endpoint — used by the Flutter SDK (no auth). */
  getPublicConfig(publishableKey: string): Observable<WidgetConfigResponse> {
    return this.http.get<WidgetConfigResponse>(
      `${this.base}/public/${publishableKey}`
    );
  }
}