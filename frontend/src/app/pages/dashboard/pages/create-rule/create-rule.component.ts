import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RuleService, CreateRuleRequest } from 'src/app/services/rule.service';
import { EventService } from 'src/app/services/event.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-create-rule',
  templateUrl: './create-rule.component.html',
  styleUrls: ['./create-rule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateRuleComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  availableEvents = signal<string[]>([]);
  loading         = signal(false);
  error           = signal<string | null>(null);
  dropdownOpen    = signal(false);

  private readonly destroy$ = new Subject<void>();

  // ✅ Field initializer — injection context
  private readonly appId$ = toObservable(this.appState.currentAppId);

  constructor(
    private fb: FormBuilder,
    private ruleService: RuleService,
    private eventService: EventService,
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
        if (appId) this.loadRegisteredEvents(appId);
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

  get isPoints(): boolean {
    return this.form.get('actionType')?.value === 'POINTS';
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  selectEvent(event: string): void {
    this.form.get('triggerEvent')?.setValue(event);
    this.form.get('triggerEvent')?.markAsTouched();
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.dropdownOpen.set(false);
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