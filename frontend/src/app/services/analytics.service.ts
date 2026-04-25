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

// ── Leaderboard Interfaces ──────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  lifetimePoints: number;
  totalEvents: number;
  activeDaysCount: number;
  rulesTriggered: number;
  lastEventAt: string;
}

export interface LeaderboardPage {
  entries: LeaderboardEntry[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
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
      .set('days', days.toString());
    
    return this.http.get<AnalyticsOverview>(
      `${this.baseUrl}/overview/${appId}`,
      { params }
    );
  }

  /**
   * Get leaderboard for an app
   * @param appId Application ID
   * @param page Page number (0-indexed)
   * @param size Page size (default 20)
   */
getLeaderboard(appId: number, page = 0, size = 20, sortBy = 'points'): Observable<LeaderboardPage> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString())
    .set('sortBy', sortBy);
  return this.http.get<LeaderboardPage>(`${this.baseUrl}/leaderboard/${appId}`, { params });
}
}