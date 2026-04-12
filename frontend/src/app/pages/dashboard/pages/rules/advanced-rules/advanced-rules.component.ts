import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AdvancedRuleService, AdvancedRule } from 'src/app/services/advanced-rule.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-advanced-rules',
  templateUrl: './advanced-rules.component.html',
  styleUrls: ['./advanced-rules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedRulesComponent implements OnInit, OnDestroy {
  rules        = signal<AdvancedRule[]>([]);
  loading      = signal(true);
  error        = signal<string | null>(null);
  confirmingId = signal<number | null>(null);
  activeCount  = computed(() => this.rules().filter(r => r.active).length);

  private readonly destroy$ = new Subject<void>();
  private readonly appId$   = toObservable(this.appState.currentAppId);

  constructor(
    private svc: AdvancedRuleService,
    private router: Router,
    private route: ActivatedRoute,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.appId$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      if (id) this.load(id);
    });
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
      const id = p['appId'] ? Number(p['appId']) : null;
      if (id && !this.appState.currentAppId()) this.appState.selectApp(id);
    });
  }

  load(appId: number): void {
    this.loading.set(true); this.error.set(null);
    this.svc.getRules(appId).subscribe({
      next: r => { this.rules.set(r); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les règles avancées'); this.loading.set(false); }
    });
  }

  toggle(rule: AdvancedRule): void {
    const appId = this.appState.currentAppId(); if (!appId) return;
    this.svc.toggleRule(rule.id, !rule.active, appId).subscribe({
      next: u => this.rules.update(l => l.map(r => r.id === u.id ? u : r))
    });
  }

  delete(ruleId: number): void {
    if (this.confirmingId() !== ruleId) {
      this.confirmingId.set(ruleId);
      setTimeout(() => { if (this.confirmingId() === ruleId) this.confirmingId.set(null); }, 3000);
      return;
    }
    const appId = this.appState.currentAppId(); if (!appId) return;
    this.svc.deleteRule(ruleId, appId).subscribe({
      next: () => { this.rules.update(l => l.filter(r => r.id !== ruleId)); this.confirmingId.set(null); }
    });
  }

  newRule(): void {
    this.router.navigate(['/dashboard/rules/advanced/new'], { queryParams: { appId: this.appState.currentAppId() } });
  }

  trackById = (_: number, r: AdvancedRule) => r.id;

  get appId() { return this.appState.currentAppId(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}