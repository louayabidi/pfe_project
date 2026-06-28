import {
  Component, OnInit, OnDestroy, signal,
  ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AdvancedRuleService, CreateAdvancedRuleRequest,
  RULE_TEMPLATES, RuleTemplate
} from 'src/app/services/advanced-rule.service';
import { EventService } from 'src/app/services/event.service';
import { BadgeService } from 'src/app/services/badge.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

export interface BadgeOption {
  id: number;
  name: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-create-advanced-rule',
  templateUrl: './create-advanced-rule.component.html',
  styleUrls: ['./create-advanced-rule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAdvancedRuleComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  availableEvents  = signal<string[]>([]);
  availableBadges  = signal<BadgeOption[]>([]);
  loading          = signal(false);
  error            = signal<string | null>(null);
  dropdownOpen     = signal(false);
  // per-action badge dropdowns: index → open state
  badgeDropdowns   = signal<Record<number, boolean>>({});
  templates        = RULE_TEMPLATES;

  private readonly destroy$ = new Subject<void>();
  private readonly appId$   = toObservable(this.appState.currentAppId);

  conditionTypes = ['EVENT', 'EVENT_COUNT', 'TIME_PERIOD', 'DATA_FIELD'];
  operators      = ['EQUALS','NOT_EQUALS','GREATER_THAN','LESS_THAN',
                    'GREATER_THAN_OR_EQUAL','LESS_THAN_OR_EQUAL','CONTAINS','MULTIPLE_OF'];
  periodValues   = ['1_HOUR','1_DAY','7_DAYS','30_DAYS'];
  actionTypes    = ['POINTS','BADGE','MULTIPLIER','CUSTOM'];

  constructor(
    private fb: FormBuilder,
    private advancedRuleService: AdvancedRuleService,
    private eventService: EventService,
    private badgeService: BadgeService,
    private router: Router,
    private route: ActivatedRoute,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
      const id = p['appId'] ? Number(p['appId']) : null;
      if (id && !this.appState.currentAppId()) this.appState.selectApp(id);
    });
    this.appId$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      if (id) {
        this.loadEvents(id);
        this.loadBadges(id);
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name:            ['', [Validators.required, Validators.minLength(2)]],
      description:     [''],
      triggerEvents:   this.fb.array([], Validators.required),
      conditionLogic:  ['AND'],
      conditions:      this.fb.array([]),
      actions:         this.fb.array([]),
      priority:        [0],
      cooldownMinutes: [null],
      maxAwardsPerUser:[null]
    });
    this.addAction();
  }

  // ── Trigger Events ──────────────────────────────────────────────────────
  get triggerEvents(): FormArray { return this.form.get('triggerEvents') as FormArray; }

  addTriggerEvent(ev: string): void {
    if (!this.triggerEvents.value.includes(ev)) {
      this.triggerEvents.push(this.fb.control(ev, Validators.required));
    }
    this.dropdownOpen.set(false);
  }

  removeTriggerEvent(i: number): void { this.triggerEvents.removeAt(i); }

  // ── Conditions ──────────────────────────────────────────────────────────
  get conditions(): FormArray { return this.form.get('conditions') as FormArray; }

  addCondition(): void {
    this.conditions.push(this.fb.group({
      type:     ['DATA_FIELD', Validators.required],
      field:    [''],
      operator: ['EQUALS'],
      value:    ['']
    }));
  }

  removeCondition(i: number): void { this.conditions.removeAt(i); }

  isTimePeriod(i: number): boolean {
    return this.conditions.at(i).get('type')?.value === 'TIME_PERIOD';
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  get actions(): FormArray { return this.form.get('actions') as FormArray; }

  addAction(): void {
    this.actions.push(this.fb.group({
      type:        ['POINTS', Validators.required],
      value:       [100, Validators.required],
      description: ['']
    }));
  }

  removeAction(i: number): void {
    if (this.actions.length > 1) {
      this.actions.removeAt(i);
      // close badge dropdown for removed action and reindex
      const current = { ...this.badgeDropdowns() };
      delete current[i];
      this.badgeDropdowns.set(current);
    }
  }

  getActionType(i: number): string {
    return this.actions.at(i).get('type')?.value ?? 'POINTS';
  }

  // Called when action type select changes — reset value to sensible default
  onActionTypeChange(i: number): void {
    const type = this.getActionType(i);
    const defaultValue = type === 'POINTS' ? 100 : type === 'MULTIPLIER' ? 2.0 : null;
    this.actions.at(i).get('value')?.setValue(defaultValue);
    // close badge dropdown if switching away from BADGE
    if (type !== 'BADGE') {
      const current = { ...this.badgeDropdowns() };
      current[i] = false;
      this.badgeDropdowns.set(current);
    }
  }

  // ── Badge dropdown per action row ───────────────────────────────────────
  isBadgeDropdownOpen(i: number): boolean {
    return this.badgeDropdowns()[i] ?? false;
  }

  toggleBadgeDropdown(i: number): void {
    const current = { ...this.badgeDropdowns() };
    current[i] = !current[i];
    this.badgeDropdowns.set(current);
  }

  selectBadge(i: number, badge: BadgeOption): void {
    this.actions.at(i).get('value')?.setValue(badge.id);
    const current = { ...this.badgeDropdowns() };
    current[i] = false;
    this.badgeDropdowns.set(current);
  }

  getSelectedBadgeName(i: number): string {
    const id = this.actions.at(i).get('value')?.value;
    if (!id) return '— Choisir un badge —';
    return this.availableBadges().find(b => b.id === id)?.name ?? '— Choisir un badge —';
  }

  getSelectedBadgeImageUrl(i: number): string | null {
    const id = this.actions.at(i).get('value')?.value;
    if (!id) return null;
    return this.availableBadges().find(b => b.id === id)?.imageUrl ?? null;
  }

  // ── Data loading ────────────────────────────────────────────────────────
  private loadEvents(appId: number): void {
    this.eventService.getRegisteredEvents(appId).subscribe({
      next: e => this.availableEvents.set(e),
      error: () => this.error.set('Impossible de charger les événements')
    });
  }

  private loadBadges(appId: number): void {
    this.badgeService.getBadges(appId).subscribe({
      next: badges => this.availableBadges.set(
        badges.map(b => ({ id: b.id, name: b.name, imageUrl: b.imageUrl }))
      ),
      error: () => {} // non-blocking — badge dropdown will just be empty
    });
  }

  // ── Events dropdown ─────────────────────────────────────────────────────
  toggleDropdown(): void { this.dropdownOpen.update(v => !v); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    if (!t.closest('.custom-select'))     this.dropdownOpen.set(false);
    if (!t.closest('.action-badge-select')) {
      const closed: Record<number, boolean> = {};
      Object.keys(this.badgeDropdowns()).forEach(k => closed[+k] = false);
      this.badgeDropdowns.set(closed);
    }
  }

  // ── Templates ───────────────────────────────────────────────────────────
  applyTemplate(t: RuleTemplate): void {
    if (t.rule.conditionLogic) this.form.get('conditionLogic')?.setValue(t.rule.conditionLogic);
    if (t.rule.cooldownMinutes) this.form.get('cooldownMinutes')?.setValue(t.rule.cooldownMinutes);

    while (this.triggerEvents.length) this.triggerEvents.removeAt(0);
    (t.rule.triggerEvents ?? []).forEach((ev: string) =>
      this.triggerEvents.push(this.fb.control(ev, Validators.required))
    );

    while (this.conditions.length) this.conditions.removeAt(0);
    (t.rule.conditions ?? []).forEach((c: any) =>
      this.conditions.push(this.fb.group({
        type: [c.type], field: [c.field ?? ''],
        operator: [c.operator], value: [c.value]
      }))
    );

    while (this.actions.length) this.actions.removeAt(0);
    (t.rule.actions ?? []).forEach((a: any) =>
      this.actions.push(this.fb.group({
        type: [a.type], value: [a.value], description: [a.description ?? '']
      }))
    );

    this.badgeDropdowns.set({});
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid || this.triggerEvents.length === 0) {
      this.form.markAllAsTouched();
      if (this.triggerEvents.length === 0)
        this.error.set('Sélectionnez au moins un événement déclencheur');
      return;
    }
    const appId = this.appState.currentAppId();
    if (!appId) { this.error.set('Aucune application sélectionnée'); return; }

    this.loading.set(true);
    this.error.set(null);
    const v = this.form.value;

    const payload: CreateAdvancedRuleRequest = {
      name:             v.name,
      description:      v.description,
      triggerEvents:    v.triggerEvents,
      conditionLogic:   v.conditionLogic,
      conditions:       v.conditions,
      actions:          v.actions,
      priority:         v.priority ?? 0,
      cooldownMinutes:  v.cooldownMinutes ?? undefined,
      maxAwardsPerUser: v.maxAwardsPerUser ?? undefined
    };

    this.advancedRuleService.createRule(appId, payload).subscribe({
      next: () => this.router.navigate(['/dashboard/rules'], { queryParams: { appId, tab: 'advanced' } }),
      error: err => {
        this.error.set(err.error?.message || 'Erreur lors de la création');
        this.loading.set(false);
      }
    });
  }

  get appId(): number | null { return this.appState.currentAppId(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}