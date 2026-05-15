import { BadgeService } from './../../../../../services/badge.service';
import { Component, OnInit, OnDestroy, signal, inject, Injector } from '@angular/core';
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
  loading        = signal(false);
  uploading      = signal(false);       // ← file upload in progress
  error          = signal<string | null>(null);
  uploadError    = signal<string | null>(null);
  previewUrl     = signal<string | null>(null);  // ← local preview

  private readonly destroy$ = new Subject<void>();
  private injector = inject(Injector);

  constructor(
    private fb: FormBuilder,
    private badgeService: BadgeService,
    private router: Router,
    private route: ActivatedRoute,
    readonly appState: AppStateService
  ) {
    this.setupAppIdObservable();
  }

  private setupAppIdObservable(): void {
    toObservable(this.appState.currentAppId, { injector: this.injector })
      .pipe(takeUntil(this.destroy$))
      .subscribe((appId: number | null) => {
        if (!appId) this.error.set('Aucune application sélectionnée');
        else        this.error.set(null);
      });
  }

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
  }

  buildForm(): void {
    this.form = this.fb.group({
      name:             ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description:      ['', [Validators.maxLength(500)]],
      imageUrl:         [''],
      hidden:           [false],
      maxAwardsPerUser: [null]
    });

    // When user types a URL manually, update the preview
    this.form.get('imageUrl')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        this.previewUrl.set(url || null);
        this.uploadError.set(null);
      });
  }

  // ── File picker trigger ───────────────────────────────────────────────
  triggerFilePicker(input: HTMLInputElement): void {
    input.value = '';   // allow re-selecting same file
    input.click();
  }

  // ── File selected from device ─────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.uploadError.set('Type non supporté. Utilisez PNG, JPG, GIF ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.uploadError.set('Fichier trop volumineux (max 2 Mo).');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to backend
    this.uploading.set(true);
    this.uploadError.set(null);

    this.badgeService.uploadImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (url) => {
          this.form.get('imageUrl')!.setValue(url, { emitEvent: false });
          this.uploading.set(false);
        },
        error: (err) => {
          this.uploadError.set(err.error?.message || 'Échec du téléchargement.');
          this.previewUrl.set(null);
          this.uploading.set(false);
        }
      });
  }

  clearImage(): void {
    this.form.get('imageUrl')!.setValue('');
    this.previewUrl.set(null);
    this.uploadError.set(null);
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

    this.badgeService.createBadge(appId, this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/badges'], { queryParams: { appId } });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création du badge');
        this.loading.set(false);
      }
    });
  }

  get appId(): number | null { return this.appState.currentAppId(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}