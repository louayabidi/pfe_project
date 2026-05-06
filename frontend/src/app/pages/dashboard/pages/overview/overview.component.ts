import {
  Component, OnInit, OnDestroy, signal, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject, takeUntil, catchError, of } from 'rxjs';
import { AppModel, AppModelService } from 'src/app/services/app.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { RuleService } from 'src/app/services/rule.service';
import { BadgeService } from 'src/app/services/badge.service';
import { EventService } from 'src/app/services/event.service';

export interface AppStat {
  app: AppModel;
  ruleCount: number;
  badgeCount: number;
  eventCount: number;
  loading: boolean;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],   // ← rename .css → .scss
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit, OnDestroy {

  // ── Signals ────────────────────────────────────────────────────────────────
  apps     = signal<AppModel[]>([]);
  appStats = signal<AppStat[]>([]);
  loading  = signal(true);
  error    = signal<string | null>(null);

  // ── Computed totals ────────────────────────────────────────────────────────
  totalApps       = computed(() => this.apps().length);
  totalActiveApps = computed(() => this.apps().filter(a => a.active).length);
  totalRules      = computed(() => this.appStats().reduce((s, a) => s + a.ruleCount,  0));
  totalBadges     = computed(() => this.appStats().reduce((s, a) => s + a.badgeCount, 0));
  totalEvents     = computed(() => this.appStats().reduce((s, a) => s + a.eventCount, 0));

  private readonly destroy$ = new Subject<void>();

  constructor(
    private appService:  AppModelService,
    private ruleService: RuleService,
    private badgeService: BadgeService,
    private eventService: EventService,
    private appState: AppStateService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadOverview(); }

  // ── Data loading ───────────────────────────────────────────────────────────

  loadOverview(): void {
    this.loading.set(true);
    this.error.set(null);

    this.appService.getMyApps()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apps) => {
          this.apps.set(apps);
          // Seed stats with loading placeholders so the grid renders immediately
          this.appStats.set(apps.map(app => ({
            app, ruleCount: 0, badgeCount: 0, eventCount: 0, loading: true
          })));
          this.loading.set(false);
          // Fire parallel per-app stat fetches
          apps.forEach((app, i) => this.loadAppStats(app, i));
        },
        error: () => {
          this.error.set('Erreur lors du chargement des applications');
          this.loading.set(false);
        }
      });
  }

  private loadAppStats(app: AppModel, index: number): void {
    forkJoin({
      rules:  this.ruleService.getRules(app.id)
                  .pipe(catchError(() => of([]))),
      badges: this.badgeService.getBadges(app.id)
                  .pipe(catchError(() => of([]))),
      events: this.eventService.getIncomingEvents(app.id, { page: 0, size: 1 })
                  .pipe(catchError(() => of({ content: [], totalElements: 0, totalPages: 0 }))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ rules, badges, events }) => {
      this.appStats.update(stats => {
        const next = [...stats];
        next[index] = {
          ...next[index],
          ruleCount:  rules.length,
          badgeCount: badges.length,
          eventCount: (events as any).totalElements ?? 0,
          loading:    false,
        };
        return next;
      });
    });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  navigateToApp(appId: number): void {
    this.appState.selectApp(appId);
    this.router.navigate(['/dashboard/events'], { queryParams: { appId } });
  }

  navigateToRules(appId: number): void {
    this.appState.selectApp(appId);
    this.router.navigate(['/dashboard/rules'], { queryParams: { appId } });
  }

  navigateToBadges(appId: number): void {
    this.appState.selectApp(appId);
    this.router.navigate(['/dashboard/badges'], { queryParams: { appId } });
  }

  navigateToLeaderboard(appId: number): void {
    this.appState.selectApp(appId);
    this.router.navigate(['/dashboard/leaderboard'], { queryParams: { appId } });
  }

  newApp(): void { this.router.navigate(['/dashboard/apps/new']); }

  // ── Helpers ────────────────────────────────────────────────────────────────

  maskApiKey(key: string): string {
    if (!key || key.length < 12) return '••••••••••••••••';
    return key.substring(0, 10) + '••••••••' + key.substring(key.length - 4);
  }

  formatBigNum(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
    return `${n}`;
  }

  trackById(_: number, stat: AppStat): number { return stat.app.id; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}