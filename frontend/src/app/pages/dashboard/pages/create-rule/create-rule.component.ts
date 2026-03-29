import { Component, OnInit, signal, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleService, CreateRuleRequest } from '../../../../services/rule.service';
import { EventService } from '../../../../services/event.service';

@Component({
  selector: 'app-create-rule',
  templateUrl: './create-rule.component.html',
  styleUrls: ['./create-rule.component.scss']
})
export class CreateRuleComponent implements OnInit {
  form!: FormGroup;
  availableEvents = signal<string[]>([]);
  loading         = signal(false);
  error           = signal<string | null>(null);
  dropdownOpen    = signal(false);
  appId!: number;

  readonly pointsPresets = [10, 25, 50, 100, 250, 500];

  constructor(
    private fb:           FormBuilder,
    private ruleService:  RuleService,
    private eventService: EventService,
    private router:       Router,
    private route:        ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.route.queryParams.subscribe((params: any) => {
      this.appId = Number(params['appId']);
      if (this.appId) {
        this.loadEvents(this.appId);
      } else {
        this.error.set('Aucune application sélectionnée');
      }
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(2)]],
      description:  [''],
      triggerEvent: ['', Validators.required],
      actionType:   ['POINTS', Validators.required],
      pointsAmount: [100],
      badgeId:      [null],
    });
  }

  loadEvents(appId: number): void {
    this.eventService.getRegisteredEvents(appId).subscribe({
      next:  (events) => this.availableEvents.set(events),
      error: ()       => this.error.set('Impossible de charger les événements')
    });
  }

  get isPoints(): boolean {
    return this.form.get('actionType')?.value === 'POINTS';
  }

  // ── CUSTOM SELECT METHODS ──────────────────────────────────────────────
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
    const isClickInsideDropdown = target.closest('.custom-select');
    if (!isClickInsideDropdown) {
      this.dropdownOpen.set(false);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const v          = this.form.value;
    const actionType = v.actionType as 'POINTS' | 'BADGE';

    const payload: CreateRuleRequest = {
      name:         v.name,
      description:  v.description,
      triggerEvent: v.triggerEvent,
      conditions:   [],
      actions: [
        actionType === 'POINTS'
          ? { type: 'POINTS' as const, pointsAmount: v.pointsAmount }
          : { type: 'BADGE'  as const, badgeId:      v.badgeId      }
      ],
      priority: 0
    };

    this.ruleService.createRule(this.appId, payload).subscribe({
      next: () => this.router.navigate(['/dashboard/rules'], {
        queryParams: { appId: this.appId }
      }),
      error: (err) => {
        this.error.set(err.message || 'Erreur lors de la création');
        this.loading.set(false);
      }
    });
  }
}