import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RuleService, Rule } from 'src/app/services/rule.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesComponent implements OnInit, OnDestroy {
  // ── SIGNALS ──────────────────────────────────────────────────────
  rules = signal<Rule[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  confirmingId = signal<number | null>(null);

  // ── COMPUTED ─────────────────────────────────────────────────────
  activeCount = computed(() => this.rules().filter(r => r.active).length);

  // ── PRIVATE ──────────────────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  // ✅ Field initializer — runs in injection context
  private readonly appId$ = toObservable(this.appState.currentAppId);

  constructor(
    private ruleService: RuleService,
    private router: Router,
    private route: ActivatedRoute,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
    // ✅ Use pre-built observable
    this.appId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(appId => {
        if (appId) this.loadRules(appId);
      });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const urlAppId = params['appId'] ? Number(params['appId']) : null;
        if (urlAppId && !this.appState.currentAppId()) {
          this.appState.selectApp(urlAppId);
        }
      });
  }

  loadRules(appId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.ruleService.getRules(appId).subscribe({
      next: (rules) => {
        this.rules.set(rules);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading rules:', err);
        this.error.set('Impossible de charger les règles');
        this.loading.set(false);
      }
    });
  }

  toggle(rule: Rule): void {
    const appId = this.appState.currentAppId();
    if (!appId) return;

    this.ruleService.toggleRule(rule.id, !rule.active, appId).subscribe({
      next: (updated) => {
        this.rules.update(list =>
          list.map(r => r.id === updated.id ? updated : r)
        );
      },
      error: (err) => {
        console.error('Error toggling rule:', err);
        this.error.set('Erreur lors de la modification');
      }
    });
  }

  delete(ruleId: number): void {
    if (this.confirmingId() !== ruleId) {
      this.confirmingId.set(ruleId);
      setTimeout(() => {
        if (this.confirmingId() === ruleId) this.confirmingId.set(null);
      }, 3000);
      return;
    }

    const appId = this.appState.currentAppId();
    if (!appId) return;

    this.ruleService.deleteRule(ruleId, appId).subscribe({
      next: () => {
        this.rules.update(list => list.filter(r => r.id !== ruleId));
        this.confirmingId.set(null);
      },
      error: (err) => {
        console.error('Error deleting rule:', err);
        this.error.set('Erreur lors de la suppression');
        this.confirmingId.set(null);
      }
    });
  }

  editRule(ruleId: number): void {
    const appId = this.appState.currentAppId();
    this.router.navigate(['/dashboard/rules', ruleId, 'edit'], {
      queryParams: { appId }
    });
  }

  newRule(): void {
    const appId = this.appState.currentAppId();
    this.router.navigate(['/dashboard/rules/new'], {
      queryParams: { appId }
    });
  }

  trackById(_: number, rule: Rule): number {
    return rule.id;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  get appId(): number | null {
    return this.appState.currentAppId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}