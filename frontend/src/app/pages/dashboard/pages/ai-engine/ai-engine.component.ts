import {
  Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy
} from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AiEngineService, UserSegment, SegmentStat } from 'src/app/services/ai-engine.service';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-ai-engine',
  templateUrl: './ai-engine.component.html',
  styleUrls: ['./ai-engine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('pulse', [
      state('false', style({ opacity: 1 })),
      state('true', style({ opacity: 1 })),
      transition('false => true', [
        animate('0.5s ease-in-out', style({ opacity: 0.7 })),
        animate('0.5s ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AiEngineComponent implements OnInit, OnDestroy {

  private aiService  = inject(AiEngineService);
  readonly appState = inject(AppStateService);
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
    toObservable(this.appState.currentAppId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(appId => {
        if (appId) this.loadData(appId);
        else {
          this.segments.set([]);
          this.stats.set([]);
        }
      });
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
        this.error.set('Engine run failed — please try again');
        this.running.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.successMsg.set('🎉 Engine executed successfully — actions applied to all segments.');
          setTimeout(() => this.loadData(appId), 600);
        }
        this.running.set(false);
      });
  }

  scoreOutcomes() {
    if (this.scoring()) return;
    this.scoring.set(true);
    this.successMsg.set(null);
    this.error.set(null);

    this.aiService.scoreOutcomes()
      .pipe(takeUntil(this.destroy$), catchError(() => {
        this.error.set('Outcome scoring failed — please try again');
        this.scoring.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.successMsg.set('📊 Outcomes scored successfully — return rates updated.');
          const appId = this.selectedAppId();
          if (appId) setTimeout(() => this.loadData(appId), 600);
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
      POWER_USER:   'Daily active users — your most engaged segment.',
      MAINTAINER:   'Consistent weekly engagement — very stable users.',
      EXPERIMENTER: 'Tried the product but activity has declined.',
      LURKER:       'Signed up but minimal interaction — untapped potential.',
      AT_RISK:      'Silent for 14+ days — at critical churn risk.',
      CHURNED:      'No activity for 28+ days — likely lost to churn.'
    };
    return map[segment] ?? '';
  }

  getActionLabel(actionType: string): string {
    const map: Record<string, string> = {
      AWARD_WELCOME_BONUS:     '+25 pts Welcome Bonus',
      AWARD_COMEBACK_BONUS:    '+50 pts Comeback Bonus',
      AWARD_RETENTION_BONUS:   '+100 pts Retention Bonus',
      AWARD_WINBACK_BONUS:     '+200 pts Win-Back Bonus',
      AWARD_CONSISTENCY_BONUS: '+30 pts Consistency Bonus',
      OBSERVED_POWER_USER:     'Observed (No Action Needed)'
    };
    return map[actionType] ?? actionType;
  }

  formatSilence(days: number): string {
    if (days < 1)  return 'Today';
    if (days < 2)  return 'Yesterday';
    if (days < 7)  return `${Math.floor(days)}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    return `${Math.floor(days / 30)}mo`;
  }

  trackByUserId(_: number, s: UserSegment) { return s.userId; }
  trackByStat(_: number, s: SegmentStat)   { return s.segment + s.actionType; }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}