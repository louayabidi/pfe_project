import { BadgeService } from './../../../../../services/badge.service';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStateService } from 'src/app/services/app-state.service';
import { Subject, takeUntil } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-badge',
  templateUrl: './create-badge.component.html',
  styleUrls: ['./create-badge.component.scss']
})
export class CreateBadgeComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = signal(false);
  error   = signal<string | null>(null);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
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

    toObservable(this.appState.currentAppId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((appId: number | null) => {
        if (!appId) this.error.set('Aucune application sélectionnée');
        else        this.error.set(null);
      });
  }

  buildForm(): void {
    this.form = this.fb.group({
      name:             ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description:      ['', [Validators.maxLength(500)]],
      imageUrl:         [''],
      hidden:           [false],
      maxAwardsPerUser: [null]
    });
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

    // ✅ appId en premier argument, payload en second
    this.badgeService.createBadge(appId, this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/badges'], {
          queryParams: { appId }
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création du badge');
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