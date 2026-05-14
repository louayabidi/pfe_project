import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface StreakMilestone {
  day: number;
  points: number;
  badgeId: number | null;
  freezeToken: boolean;
}

export interface StreakMultiplier {
  fromDay: number;
  multiplier: number;
}

export interface StreakConfig {
  id?: number;
  name: string;
  qualifyingEventsJson: string;
  windowType: 'CALENDAR_DAY' | 'ROLLING_24H';
  graceHours: number;
  maxFreezeTokens: number;
  milestonesJson: string;
  multipliersJson: string;
  comebackAfterDays: number | null;
  comebackBonusPoints: number | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelReward {
  level: number;
  points: number;
  badgeId: number | null;
}

export interface LevelConfig {
  id?: number;
  name: string;
  thresholdType: 'FLAT' | 'CUSTOM';
  flatThreshold: number;
  customThresholdsJson: string;
  headStartPct: number;
  levelTitlesJson: string;
  levelRewardsJson: string;
  maxLevel: number;
  active: boolean;
  cardStyle?: 'crystal' | 'inferno' | 'phantom';  
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EngagementService {

  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Streaks ───────────────────────────────────────────────────────────────

  getStreakConfigs(appId: number): Observable<StreakConfig[]> {
    return this.http.get<StreakConfig[]>(`${this.API}/api/streaks/config/${appId}`);
  }

  createStreakConfig(appId: number, cfg: StreakConfig): Observable<StreakConfig> {
    return this.http.post<StreakConfig>(`${this.API}/api/streaks/config/${appId}`, cfg);
  }

  updateStreakConfig(id: number, cfg: StreakConfig): Observable<StreakConfig> {
    return this.http.put<StreakConfig>(`${this.API}/api/streaks/config/${id}`, cfg);
  }

  deleteStreakConfig(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/api/streaks/config/${id}`);
  }

  toggleStreakConfig(id: number): Observable<StreakConfig> {
    return this.http.patch<StreakConfig>(`${this.API}/api/streaks/config/${id}/toggle`, {});
  }

  // ── Levels ────────────────────────────────────────────────────────────────

  getLevelConfigs(appId: number): Observable<LevelConfig[]> {
    return this.http.get<LevelConfig[]>(`${this.API}/api/levels/config/${appId}`);
  }

  createLevelConfig(appId: number, cfg: LevelConfig): Observable<LevelConfig> {
    return this.http.post<LevelConfig>(`${this.API}/api/levels/config/${appId}`, cfg);
  }

  updateLevelConfig(id: number, cfg: LevelConfig): Observable<LevelConfig> {
    return this.http.put<LevelConfig>(`${this.API}/api/levels/config/${id}`, cfg);
  }

  deleteLevelConfig(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/api/levels/config/${id}`);
  }

  toggleLevelConfig(id: number): Observable<LevelConfig> {
    return this.http.patch<LevelConfig>(`${this.API}/api/levels/config/${id}/toggle`, {});
  }

  // ── Event names (for dropdowns) ───────────────────────────────────────────

  getEventNames(appId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/api/events/names`, {
      params: { appId }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  parseMilestones(json: string): StreakMilestone[] {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  }

  stringifyMilestones(arr: StreakMilestone[]): string {
    return JSON.stringify(arr);
  }

  parseTitles(json: string): string[] {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  }

  parseLevelRewards(json: string): LevelReward[] {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  }

  parseQualifyingEvents(json: string): string[] {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  }
}