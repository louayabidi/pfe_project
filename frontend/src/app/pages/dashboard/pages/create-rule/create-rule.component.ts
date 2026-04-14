import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, HostListener, inject, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RuleService, CreateRuleRequest } from 'src/app/services/rule.service';
import { EventService } from 'src/app/services/event.service';
import { BadgeService } from 'src/app/services/badge.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

export interface BadgeOption {
  id: number | null ;
  name: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-create-rule',
  templateUrl: './create-rule.component.html',
  styleUrls: ['./create-rule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateRuleComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  availableEvents = signal<string[]>([]);
  availableBadges = signal<BadgeOption[]>([]);
  loading         = signal(false);
  error           = signal<string | null>(null);
  dropdownOpen    = signal(false);
  badgeDropdownOpen = signal(false);

  private readonly destroy$ = new Subject<void>();
  private injector = inject(Injector);

  // ✅ Field initializer — injection context
  private readonly appId$ = toObservable(this.appState.currentAppId, { injector: this.injector });

  constructor(
    private fb: FormBuilder,
    private ruleService: RuleService,
    private eventService: EventService,
    private badgeService: BadgeService,
    private router: Router,
    private route: ActivatedRoute,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const urlAppId = params['appId'] ? Number(params['appId']) : null;
        if (urlAppId && !this.appState.currentAppId()) {
          this.appState.selectApp(urlAppId);
        }
      });

    // ✅ Use pre-built observable
    this.appId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((appId: number | null) => {
        if (appId) {
          this.loadRegisteredEvents(appId);
          this.loadBadges(appId);
        }
      });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name:          ['', [Validators.required, Validators.minLength(2)]],
      description:   [''],
      triggerEvent:  ['', Validators.required],
      actionType:    ['POINTS', Validators.required],
      pointsAmount:  [100],
      badgeId:       [null]
    });
  }

  private loadRegisteredEvents(appId: number): void {
    this.eventService.getRegisteredEvents(appId).subscribe({
      next: (events) => this.availableEvents.set(events),
      error: (err) => {
        console.error('Error loading events:', err);
        this.error.set('Impossible de charger les événements');
      }
    });
  }

  private loadBadges(appId: number): void {
    this.badgeService.getBadges(appId).subscribe({
      next: (badges) => {
        const badgeOptions: BadgeOption[] = badges.map(badge => ({
          id: badge.id,
          name: badge.name,
          imageUrl: badge.imageUrl
        }));
        this.availableBadges.set(badgeOptions);
      },
      error: (err) => {
        console.error('Error loading badges:', err);
        this.error.set('Impossible de charger les badges');
      }
    });
  }

  get isPoints(): boolean {
    return this.form.get('actionType')?.value === 'POINTS';
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  toggleBadgeDropdown(): void {
    this.badgeDropdownOpen.update(v => !v);
  }

  selectEvent(event: string): void {
    this.form.get('triggerEvent')?.setValue(event);
    this.form.get('triggerEvent')?.markAsTouched();
    this.dropdownOpen.set(false);
  }

  selectBadge(badge: BadgeOption): void {
    this.form.get('badgeId')?.setValue(badge.id);
    this.form.get('badgeId')?.markAsTouched();
    this.badgeDropdownOpen.set(false);
  }

  getSelectedBadgeName(): string {
    const badgeId = this.form.get('badgeId')?.value;
    if (!badgeId) return '— Choisir un badge —';
    const badge = this.availableBadges().find(b => b.id === badgeId);
    return badge?.name || '— Choisir un badge —';
  }

  getSelectedBadgeImageUrl(): string | null {
  const id = this.form.get('badgeId')?.value;
  if (!id) return null;
  return this.availableBadges().find(b => b.id === id)?.imageUrl ?? null;
}


clearBadge(): void {
  this.form.get('badgeId')?.setValue(null);
  this.form.get('badgeId')?.markAsTouched();
  this.badgeDropdownOpen.set(false);
}


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select') && !target.closest('.badge-select')) {
      this.dropdownOpen.set(false);
      this.badgeDropdownOpen.set(false);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const appId = this.appState.currentAppId();
    if (!appId) {
      this.error.set('Aucune application sélectionnée');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const v = this.form.value;
    const actionType = v.actionType as 'POINTS' | 'BADGE';

    const payload: CreateRuleRequest = {
      name:         v.name,
      description:  v.description,
      triggerEvent: v.triggerEvent,
      conditions:   [],
      actions: [
        actionType === 'POINTS'
          ? { type: 'POINTS' as const, pointsAmount: v.pointsAmount }
          : { type: 'BADGE'  as const, badgeId: v.badgeId }
      ],
      priority: 0
    };

    this.ruleService.createRule(appId, payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/rules'], {
          queryParams: { appId }
        });
      },
      error: (err) => {
        console.error('Error creating rule:', err);
        this.error.set(err.error?.message || 'Erreur lors de la création');
        this.loading.set(false);
      }
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