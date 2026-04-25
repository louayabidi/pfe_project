import {
  Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy
} from '@angular/core';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { AiEngineService, UserSegment, SegmentStat } from 'src/app/services/ai-engine.service';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-ai-engine',
  templateUrl: './ai-engine.component.html',
  styleUrls: ['./ai-engine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiEngineComponent implements OnInit, OnDestroy {

  private aiService  = inject(AiEngineService);
  private appState   = inject(AppStateService);
  private destroy$   = new Subject<void>();

  // ── state ──────────────────────────────────────────────────────────────────
  segments     = signal<UserSegment[]>([]);
  stats        = signal<SegmentStat[]>([]);
  loading      = signal(false);
  running      = signal(false);
  scoring      = signal(false);
  error        = signal<string | null>(null);
  successMsg   = signal<string | null>(null);

  readonly selectedAppId = this.appState.currentAppId;
  readonly apps          = this.appState.apps;

  // ── computed ───────────────────────────────────────────────────────────────
  segmentCounts = computed(() => {
    const counts: Record<string, number> = {};
    this.segments().forEach(s => {
      counts[s.segment] = (counts[s.segment] || 0) + 1;
    });
    return counts;
  });

  totalUsers = computed(() => this.segments().length);

  segmentOrder = ['POWER_USER', 'MAINTAINER', 'EXPERIMENTER', 'LURKER', 'AT_RISK', 'CHURNED'];

  // ── lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    const appId = this.selectedAppId();
    if (appId) this.loadData(appId);
  }

  selectApp(appId: number) {
    this.appState.selectApp(appId);
    this.loadData(appId);
  }

  // ── data ───────────────────────────────────────────────────────────────────
  loadData(appId: number) {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      segments: this.aiService.getSegments(appId).pipe(catchError(() => of([]))),
      stats:    this.aiService.getStats(appId).pipe(catchError(() => of([])))
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ segments, stats }) => {
      this.segments.set(segments);
      this.stats.set(stats);
      this.loading.set(false);
    });
  }

  // ── actions ────────────────────────────────────────────────────────────────
  runEngine() {
    const appId = this.selectedAppId();
    if (!appId || this.running()) return;

    this.running.set(true);
    this.error.set(null);
    this.successMsg.set(null);

    this.aiService.runEngine(appId)
      .pipe(takeUntil(this.destroy$), catchError(err => {
        this.error.set('Engine run failed');
        this.running.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.successMsg.set('Engine ran successfully — actions have been applied to users.');
          this.loadData(appId);
        }
        this.running.set(false);
      });
  }

  scoreOutcomes() {
    if (this.scoring()) return;
    this.scoring.set(true);
    this.successMsg.set(null);

    this.aiService.scoreOutcomes()
      .pipe(takeUntil(this.destroy$), catchError(() => {
        this.error.set('Outcome scoring failed');
        this.scoring.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.successMsg.set('Outcomes scored — return rates updated.');
          const appId = this.selectedAppId();
          if (appId) this.loadData(appId);
        }
        this.scoring.set(false);
      });
  }

  // ── helpers ────────────────────────────────────────────────────────────────
  getSegmentColor(segment: string): string {
    const map: Record<string, string> = {
      POWER_USER:   '#34e89e',
      MAINTAINER:   '#7B5CFA',
      EXPERIMENTER: '#f59e0b',
      LURKER:       '#64748b',
      AT_RISK:      '#f97316',
      CHURNED:      '#f5476a'
    };
    return map[segment] ?? '#64748b';
  }

  getSegmentIcon(segment: string): string {
    const map: Record<string, string> = {
      POWER_USER:   '⚡',
      MAINTAINER:   '🔁',
      EXPERIMENTER: '🧪',
      LURKER:       '👻',
      AT_RISK:      '⚠️',
      CHURNED:      '💤'
    };
    return map[segment] ?? '❓';
  }

  getSegmentDescription(segment: string): string {
    const map: Record<string, string> = {
      POWER_USER:   'Daily active, highly engaged users.',
      MAINTAINER:   'Consistent weekly users — steady engagement.',
      EXPERIMENTER: 'Tried the app but activity has dropped.',
      LURKER:       'Signed up but barely interacted.',
      AT_RISK:      'Silent for 14+ days — at risk of leaving.',
      CHURNED:      'No activity for 28+ days.'
    };
    return map[segment] ?? '';
  }

  getActionLabel(actionType: string): string {
    const map: Record<string, string> = {
      AWARD_WELCOME_BONUS:     '+25 pts welcome bonus',
      AWARD_COMEBACK_BONUS:    '+50 pts comeback bonus',
      AWARD_RETENTION_BONUS:   '+100 pts retention bonus',
      AWARD_WINBACK_BONUS:     '+200 pts win-back bonus',
      AWARD_CONSISTENCY_BONUS: '+30 pts consistency bonus',
      OBSERVED_POWER_USER:     'Observed — no action needed'
    };
    return map[actionType] ?? actionType;
  }

  formatSilence(days: number): string {
    if (days < 1)  return 'Today';
    if (days < 2)  return 'Yesterday';
    if (days < 7)  return `${Math.floor(days)}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  trackByUserId(_: number, s: UserSegment) { return s.userId; }
  trackByStat(_: number, s: SegmentStat)   { return s.segment + s.actionType; }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}