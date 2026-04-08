import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil, switchMap, tap, catchError, of } from 'rxjs';
import { KpiCardsComponent } from '../components/kpi-cards/kpi-cards.component';
import { EventsChartComponent } from '../components/events-chart/events-chart.component';
import { UsersChartComponent } from '../components/users-chart/users-chart.component';
import { TopEventsComponent } from '../components/top-events/top-events.component';
import { TopUsersComponent } from '../components/top-users/top-users.component';
import { HeatmapComponent } from '../components/heatmap/heatmap.component';
import { RetentionComponent } from '../components/retention/retention.component';
import { BadgeDistributionComponent } from '../components/badge-distribution/badge-distribution.component';
import { AnalyticsOverview, AnalyticsService } from 'src/app/services/analytics.service';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-analytics-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    KpiCardsComponent,
    EventsChartComponent,
    UsersChartComponent,
    TopEventsComponent,
    TopUsersComponent,
    HeatmapComponent,
    RetentionComponent,
    BadgeDistributionComponent,
  ],
  templateUrl: './analytics-shell.component.html',
  styleUrls: ['./analytics-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsShellComponent implements OnInit, OnDestroy {

  private readonly _data = signal<AnalyticsOverview | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _days = signal(30);

  get data(): AnalyticsOverview | null { return this._data(); }
  get loading(): boolean               { return this._loading(); }
  get error(): string | null           { return this._error(); }
  get days(): number                   { return this._days(); }
  get currentAppName(): string         { return this.appState.currentApp()?.name || 'No app selected'; }



get insight(): string | null {
  const series = this.data?.eventsByDay;
  if (!series?.length) return null;

  const peak = series.reduce((a, b) => a.value > b.value ? a : b);
  const avg = Math.round(series.reduce((s, p) => s + p.value, 0) / series.length);

  if (peak.value > avg * 2) {
    return `<strong>Activity spike on ${peak.date}</strong> — ${peak.value} events recorded,
      ${Math.round(peak.value / avg)}× the daily average. Check if a campaign or feature release drove this.`;
  }
  return null;
}

  private readonly destroy$ = new Subject<void>();
  private readonly appId$ = toObservable(this.appState.currentAppId);

  readonly dayOptions = [7, 14, 30, 90, 365];

  constructor(
    private analytics: AnalyticsService,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.appId$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this._loading.set(true);
          this._error.set(null);
        }),
        switchMap(appId => {
          if (!appId) {
            this._error.set('No app selected');
            this._loading.set(false);
            return of(null);
          }
          return this.analytics.getOverview(appId, this._days()).pipe(
            catchError(err => {
              console.error('Analytics error:', err);
              this._error.set('Failed to load analytics. Please try again.');
              this._loading.set(false);
              return of(null);
            })
          );
        })
      )
     .subscribe(data => {
  if (data) {
    this._data.set({
      ...data,
      eventsByDay: [...(data.eventsByDay ?? [])],   
      newUsersByDay: [...(data.newUsersByDay ?? [])],
    });
    this._loading.set(false);
  }
});
  }

  changeDays(d: number): void {
    this._days.set(d);
    const appId = this.appState.currentAppId();

    if (!appId) {
      this._error.set('No app selected');
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.analytics.getOverview(appId, d)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this._data.set(data);
          this._loading.set(false);
        },
        error: err => {
          console.error('Failed to load analytics:', err);
          this._error.set('Failed to load analytics');
          this._loading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}