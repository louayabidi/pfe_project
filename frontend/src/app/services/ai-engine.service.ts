import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserSegment {
  userId: string;
  appId: number;
  lifetimePoints: number;
  totalEvents: number;
  activeDays: number;
  lastSeen: string;
  daysSilent: number;
  segment: 'LURKER' | 'EXPERIMENTER' | 'MAINTAINER' | 'AT_RISK' | 'POWER_USER' | 'CHURNED';
}

export interface SegmentStat {
  segment: string;
  actionType: string;
  total: number;
  returned: number;
  returnRate: number;
}

export interface AiRunResponse {
  appId: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AiEngineService {

  private readonly base = `${environment.apiUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  runEngine(appId: number): Observable<AiRunResponse> {
    return this.http.post<AiRunResponse>(`${this.base}/run/${appId}`, {});
  }

  scoreOutcomes(): Observable<any> {
    return this.http.post(`${this.base}/score-outcomes`, {});
  }

  getSegments(appId: number): Observable<UserSegment[]> {
    return this.http.get<UserSegment[]>(`${this.base}/segments/${appId}`);
  }

  getStats(appId: number): Observable<SegmentStat[]> {
    return this.http.get<SegmentStat[]>(`${this.base}/stats/${appId}`);
  }
}