import { Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AnalyticsService, LeaderboardPage, LeaderboardEntry } from 'src/app/services/analytics.service';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private route = inject(ActivatedRoute);
  private appState = inject(AppStateService);

  // ── SIGNALS ──────────────────────────────────────────────────────
  leaderboard = signal<LeaderboardPage | null>(null);
  loading      = signal(false);
  error        = signal<string | null>(null);
  currentPage  = signal(0);
  sortBy       = signal<'points' | 'events' | 'days' | 'rules'>('points');
  searchQuery  = signal('');

  // ── APP STATE ────────────────────────────────────────────────────
  readonly selectedAppId = this.appState.currentAppId;
  readonly apps          = this.appState.apps;

  // ── CONFIG ───────────────────────────────────────────────────────
  readonly pageSize = 20;

  // ── COMPUTED ─────────────────────────────────────────────────────
  filteredEntries = computed(() => {
    const q       = this.searchQuery().toLowerCase().trim();
    const entries = this.leaderboard()?.entries ?? [];
    if (!q) return entries;
    return entries.filter(e => e.userId.toLowerCase().includes(q));
  });

  maxValue = computed(() => {
    const entries = this.leaderboard()?.entries ?? [];
    if (!entries.length) return 1;
    const values = entries.map(e => this.getSortValue(e));
    return Math.max(...values) || 1;
  });

  // ── HELPERS ──────────────────────────────────────────────────────
  getSortValue(entry: LeaderboardEntry): number {
    switch (this.sortBy()) {
      case 'events': return entry.totalEvents;
      case 'days':   return entry.activeDaysCount;
      case 'rules':  return entry.rulesTriggered;
      default:       return entry.lifetimePoints;
    }
  }

  getSortLabel(): string {
    switch (this.sortBy()) {
      case 'events': return 'events';
      case 'days':   return 'active days';
      case 'rules':  return 'rules';
      default:       return 'points';
    }
  }

  readonly getRankBadge = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  /** Returns an array of page numbers (1-based) with -1 as ellipsis markers */
  getPaginationRange(): number[] {
    const total   = this.leaderboard()?.totalPages ?? 0;
    const current = this.currentPage() + 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  // ── PRIVATE ──────────────────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();
  private readonly appId$   = toObservable(this.appState.currentAppId);

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const urlAppId = params['appId'] ? Number(params['appId']) : null;
        if (urlAppId && !this.appState.currentAppId()) {
          this.appState.selectApp(urlAppId);
        }
      });

    this.appId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((appId: number | null) => {
        if (appId) {
          this.currentPage.set(0);
          this.loadLeaderboard();
        }
      });
  }

  selectApp(appId: number): void {
    this.appState.selectApp(appId);
  }

  onAppChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (id) this.appState.selectApp(id);
  }

  loadLeaderboard() {
    const appId = this.selectedAppId();
    if (!appId) return;

    this.loading.set(true);
    this.error.set(null);

    this.analyticsService
      .getLeaderboard(appId, this.currentPage(), this.pageSize, this.sortBy())
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading leaderboard:', err);
          this.error.set('Error loading leaderboard');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((data: LeaderboardPage | null) => {
        if (data) this.leaderboard.set(data);
        this.loading.set(false);
      });
  }

  nextPage() {
    const lb = this.leaderboard();
    if (lb && this.currentPage() < lb.totalPages - 1) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadLeaderboard();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadLeaderboard();
    }
  }

  setSortBy(sort: 'points' | 'events' | 'days' | 'rules') {
    this.sortBy.set(sort);
    this.currentPage.set(0);
    this.searchQuery.set('');
    this.loadLeaderboard();
  }

  formatDate(date: string | null): string {
    if (!date) return 'Never';
    const d        = new Date(date);
    const now      = new Date();
    const diffMs   = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)  return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  }

  exportCsv() {
    const entries = this.filteredEntries();
    const header  = 'Rank,User,Points,Events,Active Days,Rules Triggered,Last Active\n';
    const rows    = entries.map(e =>
      `${e.rank},"${e.userId}",${e.lifetimePoints},${e.totalEvents},${e.activeDaysCount},${e.rulesTriggered},"${this.formatDate(e.lastEventAt)}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `leaderboard-${this.sortBy()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  trackByUserId(_: number, entry: LeaderboardEntry): string {
    return entry.userId;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}