import {
  Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  EngagementService, StreakConfig, LevelConfig,
  StreakMilestone, LevelReward
} from 'src/app/services/engagement.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';

export type Tab = 'streaks' | 'levels';

@Component({
  selector: 'app-engagement',
  templateUrl: './engagement.component.html',
  styleUrls: ['./engagement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EngagementComponent implements OnInit, OnDestroy {

  activeTab      = signal<Tab>('streaks');
  loading        = signal(true);
  saving         = signal(false);
  error          = signal<string | null>(null);
  saved          = signal(false);

  streakConfigs  = signal<StreakConfig[]>([]);
  levelConfigs   = signal<LevelConfig[]>([]);
  availableEvents = signal<string[]>([]);

  showStreakForm  = signal(false);
  showLevelForm  = signal(false);
  editingStreak  = signal<StreakConfig | null>(null);
  editingLevel   = signal<LevelConfig | null>(null);

  streakMilestones: StreakMilestone[] = [];
  levelRewards:     LevelReward[]     = [];
  levelTitles:      string[]          = ['Rookie', 'Explorer', 'Veteran', 'Legend', 'Champion'];
  cardStyleChoice: 'crystal' | 'inferno' | 'phantom' = 'crystal';
 

  customThresholds: number[] = [];
  streakForm!: FormGroup;
  levelForm!:  FormGroup;

  private readonly destroy$ = new Subject<void>();
  private readonly appId$   = toObservable(this.appState.currentAppId);

  constructor(
    private fb: FormBuilder,
    private svc: EngagementService,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.appId$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      if (id) this.loadAll(id);
    });
  }

  loadAll(appId: number): void {
    this.loading.set(true);

    this.svc.getStreakConfigs(appId).pipe(takeUntil(this.destroy$)).subscribe({
      next: c => { this.streakConfigs.set(c); this.loading.set(false); },
      error: () => { this.error.set('Could not load streak configs'); this.loading.set(false); }
    });

    this.svc.getLevelConfigs(appId).pipe(takeUntil(this.destroy$)).subscribe({
      next: c => this.levelConfigs.set(c),
      error: () => {}
    });

    // ✅ Charge les vrais noms d'events depuis le backend
    this.svc.getEventNames(appId).pipe(takeUntil(this.destroy$)).subscribe({
      next: names => this.availableEvents.set(names),
      error: () => {}
    });
  }

  // ── Streak CRUD ────────────────────────────────────────────────────────────

  openNewStreak(): void {
    this.editingStreak.set(null);
    this.streakMilestones = [];
    this.streakForm.reset({
      name: '', windowType: 'CALENDAR_DAY', graceHours: 0,
      maxFreezeTokens: 1, comebackAfterDays: null,
      comebackBonusPoints: null, qualifyingEvents: []
    });
    this.showStreakForm.set(true);
  }

  editStreak(cfg: StreakConfig): void {
    this.editingStreak.set(cfg);
    this.streakMilestones = this.svc.parseMilestones(cfg.milestonesJson);
    this.streakForm.patchValue({
      name:                cfg.name,
      windowType:          cfg.windowType,
      graceHours:          cfg.graceHours,
      maxFreezeTokens:     cfg.maxFreezeTokens,
      comebackAfterDays:   cfg.comebackAfterDays,
      comebackBonusPoints: cfg.comebackBonusPoints,
      qualifyingEvents:    this.svc.parseQualifyingEvents(cfg.qualifyingEventsJson) // ✅
    });
    this.showStreakForm.set(true);
  }

  saveStreak(): void {
    if (this.streakForm.invalid) { this.streakForm.markAllAsTouched(); return; }
    const appId = this.appState.currentAppId();
    if (!appId) return;

    const v = this.streakForm.value;
    const payload: StreakConfig = {
      name:                 v.name,
      windowType:           v.windowType,
      graceHours:           v.graceHours ?? 0,
      maxFreezeTokens:      v.maxFreezeTokens ?? 1,
      qualifyingEventsJson: JSON.stringify(v.qualifyingEvents ?? []), // ✅ plus de '[]' hardcodé
      milestonesJson:       JSON.stringify(this.streakMilestones),
      multipliersJson:      '[]',
      comebackAfterDays:    v.comebackAfterDays || null,
      comebackBonusPoints:  v.comebackBonusPoints || null,
      active:               true
    };

    this.saving.set(true);
    const existing = this.editingStreak();
    const req = existing?.id
        ? this.svc.updateStreakConfig(existing.id, payload)
        : this.svc.createStreakConfig(appId, payload);

    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: saved => {
        this.streakConfigs.update(list =>
            existing?.id
                ? list.map(c => c.id === saved.id ? saved : c)
                : [...list, saved]);
        this.saving.set(false);
        this.showStreakForm.set(false);
        this.flashSaved();
      },
      error: () => { this.saving.set(false); this.error.set('Save failed'); }
    });
  }

  deleteStreak(id: number): void {
    if (!confirm('Delete this streak config?')) return;
    this.svc.deleteStreakConfig(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.streakConfigs.update(l => l.filter(c => c.id !== id))
    });
  }

  toggleStreak(id: number): void {
    this.svc.toggleStreakConfig(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: updated => this.streakConfigs.update(l =>
          l.map(c => c.id === updated.id ? updated : c))
    });
  }

  // ── Level CRUD ─────────────────────────────────────────────────────────────

  openNewLevel(): void {
    this.editingLevel.set(null);
    this.levelRewards = [];
    this.levelTitles  = ['Rookie', 'Explorer', 'Veteran', 'Legend', 'Champion'];
    this.customThresholds = [];   
    this.levelForm.reset({ name: '', thresholdType: 'FLAT', flatThreshold: 1000,
                            headStartPct: 15, maxLevel: 100 });
    this.showLevelForm.set(true);
    this.cardStyleChoice = 'crystal';
  }

  editLevel(cfg: LevelConfig): void {
    this.editingLevel.set(cfg);
    this.levelRewards = this.svc.parseLevelRewards(cfg.levelRewardsJson);
    this.levelTitles  = this.svc.parseTitles(cfg.levelTitlesJson);
    this.customThresholds = this.parseIntList(cfg.customThresholdsJson);
    if (!this.levelTitles.length) {
      this.levelTitles = ['Rookie', 'Explorer', 'Veteran', 'Legend', 'Champion'];
    }
    this.levelForm.patchValue({
      name:          cfg.name,
      thresholdType: cfg.thresholdType,
      flatThreshold: cfg.flatThreshold,
      headStartPct:  cfg.headStartPct,
      maxLevel:      cfg.maxLevel
    });
    this.showLevelForm.set(true);
    this.cardStyleChoice = (cfg.cardStyle as any) ?? 'crystal';
  }

  saveLevel(): void {
    if (this.levelForm.invalid) { this.levelForm.markAllAsTouched(); return; }
    const appId = this.appState.currentAppId();
    if (!appId) return;

    const v = this.levelForm.value;
    const payload: LevelConfig = {
      name:                 v.name,
      thresholdType:        v.thresholdType,
      flatThreshold:        v.flatThreshold ?? 1000,
     customThresholdsJson: JSON.stringify(this.customThresholds),
      headStartPct:         v.headStartPct ?? 15,
      levelTitlesJson:      JSON.stringify(this.levelTitles.filter(t => t.trim())),
      levelRewardsJson:     JSON.stringify(this.levelRewards),
      maxLevel:             v.maxLevel ?? 100,
      active:               true,
      cardStyle: this.cardStyleChoice,
    };

    this.saving.set(true);
    const existing = this.editingLevel();
    const req = existing?.id
        ? this.svc.updateLevelConfig(existing.id, payload)
        : this.svc.createLevelConfig(appId, payload);

    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: saved => {
        this.levelConfigs.update(list =>
            existing?.id
                ? list.map(c => c.id === saved.id ? saved : c)
                : [...list, saved]);
        this.saving.set(false);
        this.showLevelForm.set(false);
        this.flashSaved();
      },
      error: () => { this.saving.set(false); this.error.set('Save failed'); }
    });
  }

  deleteLevel(id: number): void {
    if (!confirm('Delete this level config?')) return;
    this.svc.deleteLevelConfig(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.levelConfigs.update(l => l.filter(c => c.id !== id))
    });
  }

 setCardStyle(s: 'crystal' | 'inferno' | 'phantom'): void {
    this.cardStyleChoice = s;
  }
  
  addThreshold(): void {
  const last = this.customThresholds.length
    ? this.customThresholds[this.customThresholds.length - 1]
    : 500;
  this.customThresholds = [...this.customThresholds, Math.round(last * 1.5)];
}

removeThreshold(i: number): void {
  this.customThresholds = this.customThresholds.filter((_, idx) => idx !== i);
}

updateThreshold(i: number, value: number): void {
  const copy = [...this.customThresholds]; copy[i] = value; this.customThresholds = copy;
}

private parseIntList(json: string | null | undefined): number[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

  toggleLevel(id: number): void {
    this.svc.toggleLevelConfig(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: updated => this.levelConfigs.update(l =>
          l.map(c => c.id === updated.id ? updated : c))
    });
  }

  // ── Event picker helpers ───────────────────────────────────────────────────

  isStreakEventSelected(ev: string): boolean {
    const current: string[] = this.streakForm.get('qualifyingEvents')?.value ?? [];
    return current.includes(ev);
  }

  toggleStreakEvent(ev: string): void {
    const ctrl = this.streakForm.get('qualifyingEvents')!;
    const current: string[] = [...(ctrl.value ?? [])];
    const idx = current.indexOf(ev);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(ev);
    ctrl.setValue(current);
  }

  // ── Milestone builder ──────────────────────────────────────────────────────

  addMilestone(): void {
    this.streakMilestones = [
      ...this.streakMilestones,
      { day: this.nextMilestoneDay(), points: 100, badgeId: null, freezeToken: false }
    ];
  }

  removeMilestone(i: number): void {
    this.streakMilestones = this.streakMilestones.filter((_, idx) => idx !== i);
  }

  private nextMilestoneDay(): number {
    if (!this.streakMilestones.length) return 3;
    return Math.max(...this.streakMilestones.map(m => m.day)) + 7;
  }

  // ── Level reward builder ───────────────────────────────────────────────────

  addLevelReward(): void {
    const nextLevel = this.levelRewards.length
        ? Math.max(...this.levelRewards.map(r => r.level)) + 1
        : 2;
    this.levelRewards = [...this.levelRewards, { level: nextLevel, points: 200, badgeId: null }];
  }

  removeLevelReward(i: number): void {
    this.levelRewards = this.levelRewards.filter((_, idx) => idx !== i);
  }

  // ── Level titles ───────────────────────────────────────────────────────────

  addTitle(): void { this.levelTitles = [...this.levelTitles, '']; }

  removeTitle(i: number): void {
    this.levelTitles = this.levelTitles.filter((_, idx) => idx !== i);
  }

  updateTitle(i: number, value: string): void {
    const copy = [...this.levelTitles]; copy[i] = value; this.levelTitles = copy;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  parseMilestones(json: string): StreakMilestone[] { return this.svc.parseMilestones(json); }
  parseLevelRewards(json: string): LevelReward[]   { return this.svc.parseLevelRewards(json); }
  parseTitles(json: string): string[]              { return this.svc.parseTitles(json); }

  parseQualifyingEvents(json: string): string[] {
    return this.svc.parseQualifyingEvents(json);
  }

  private buildForms(): void {
    this.streakForm = this.fb.group({
      name:                ['', [Validators.required, Validators.minLength(2)]],
      windowType:          ['CALENDAR_DAY'],
      graceHours:          [0],
      maxFreezeTokens:     [1],
      comebackAfterDays:   [null],
      comebackBonusPoints: [null],
      qualifyingEvents:    [[]]  // ✅ tableau vide par défaut
    });

    this.levelForm = this.fb.group({
      name:          ['', [Validators.required, Validators.minLength(2)]],
      thresholdType: ['FLAT'],
      flatThreshold: [1000, [Validators.min(1)]],
      headStartPct:  [15,   [Validators.min(0), Validators.max(25)]],
      maxLevel:      [100,  [Validators.min(2)]]
    });
  }

  private flashSaved(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}