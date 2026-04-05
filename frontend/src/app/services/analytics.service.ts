import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface CategoryPoint {
  label: string;
  value: number;
}

export interface HeatmapPoint {
  dayOfWeek: number;  // 0-6
  hour: number;       // 0-23
  count: number;
}

export interface RetentionRow {
  cohort: string;
  rates: number[];
}

export interface AnalyticsOverview {
  totalEvents: number;
  totalUsers: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  avgEventsPerUser: number;
  totalBadgesAwarded: number;
  totalPointsAwarded: number;
  eventsByDay: TimeSeriesPoint[];
  newUsersByDay: TimeSeriesPoint[];
  topEvents: CategoryPoint[];
  topUsers: CategoryPoint[];
  badgeDistribution: CategoryPoint[];
  retentionMatrix: RetentionRow[];
  heatmap: HeatmapPoint[];
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  
  private readonly baseUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * Get analytics overview for an app
   * @param appId Application ID
   * @param days Number of days to analyze (1-365, default 30)
   */
  getOverview(appId: number, days: number = 30): Observable<AnalyticsOverview> {
    const params = new HttpParams()
      .set('appId', appId.toString())
      .set('days', days.toString());

    return this.http.get<AnalyticsOverview>(
      `${this.baseUrl}/overview`,
      { params }
    );
  }
}