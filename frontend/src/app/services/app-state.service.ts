import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppModelService, AppModel } from './app.service';
import { Observable, of, BehaviorSubject, filter, take } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // ── SIGNALS ──────────────────────────────────────────────────────────
  private readonly allApps       = signal<AppModel[]>([]);
  private readonly selectedAppId = signal<number | null>(null);
  private readonly loadingApps   = signal(false);
  private readonly appsError     = signal<string | null>(null);

  // ── PUBLIC READONLY ───────────────────────────────────────────────────
  readonly apps         = this.allApps.asReadonly();
  readonly currentAppId = this.selectedAppId.asReadonly();
  readonly loading      = this.loadingApps.asReadonly();
  readonly error        = this.appsError.asReadonly();

  readonly currentApp = computed(() =>
    this.allApps().find(a => a.id === this.selectedAppId()) ?? null
  );

  readonly hasMultipleApps = computed(() => this.allApps().length > 1);

  // ── PRIVATE ──────────────────────────────────────────────────────────
  private initialized = false;

  constructor(
    private appService: AppModelService,
    private router: Router
  ) {
    // ✅ Persist selected app to sessionStorage on change
    effect(() => {
      const appId = this.selectedAppId();
      if (appId) {
        sessionStorage.setItem('dashboard-app-id', appId.toString());
      }
    });
  }

  // ── INITIALIZE ────────────────────────────────────────────────────────
  /**
   * Load apps and restore selected app from URL or sessionStorage.
   * Safe to call multiple times — runs only once.
   */
  initialize(urlAppId?: number | null): Observable<AppModel[]> {
    // ✅ Don't reload if already initialized and apps are loaded
    if (this.initialized && this.allApps().length > 0) {
      if (urlAppId) this.selectApp(urlAppId);
      return of(this.allApps());
    }

    this.loadingApps.set(true);
    this.appsError.set(null);

    return this.appService.getMyApps().pipe(
      tap(apps => {
        this.allApps.set(apps);
        this.loadingApps.set(false);
        this.initialized = true;

        // Priority: URL param > sessionStorage > first app
        const savedId = sessionStorage.getItem('dashboard-app-id');
        const candidateId = urlAppId
          ?? (savedId ? Number(savedId) : null)
          ?? (apps.length > 0 ? apps[0].id : null);

        if (candidateId && apps.some(a => a.id === candidateId)) {
          // ✅ Set signal directly — don't navigate during init
          this.selectedAppId.set(candidateId);
          sessionStorage.setItem('dashboard-app-id', candidateId.toString());
        }
      }),
      catchError(err => {
        this.loadingApps.set(false);
        this.appsError.set('Impossible de charger les applications');
        return of([]);
      })
    );
  }

  // ── SELECT APP ────────────────────────────────────────────────────────
  /**
   * Select an app by ID and update URL query params.
   */
  selectApp(appId: number): void {
    if (!this.allApps().some(a => a.id === appId)) return;
    if (this.selectedAppId() === appId) return; // ✅ No-op if already selected

    this.selectedAppId.set(appId);

    // ✅ Update URL without full navigation
    this.router.navigate([], {
      queryParams: { appId },
      queryParamsHandling: 'merge',
      replaceUrl: true   // ✅ replaceUrl avoids polluting browser history
    });
  }

  // ── RELOAD ────────────────────────────────────────────────────────────
  /**
   * Force reload apps list (after create/delete).
   */
  reloadApps(): Observable<AppModel[]> {
    this.loadingApps.set(true);

    return this.appService.getMyApps().pipe(
      tap(apps => {
        this.allApps.set(apps);
        this.loadingApps.set(false);

        // If selected app was deleted, fallback to first
        const stillExists = apps.some(a => a.id === this.selectedAppId());
        if (!stillExists) {
          const fallback = apps[0]?.id ?? null;
          this.selectedAppId.set(fallback);
          if (fallback) {
            sessionStorage.setItem('dashboard-app-id', fallback.toString());
          } else {
            sessionStorage.removeItem('dashboard-app-id');
          }
        }
      }),
      catchError(() => {
        this.loadingApps.set(false);
        this.appsError.set('Erreur lors du rechargement des apps');
        return of([]);
      })
    );
  }

  // ── SYNC FROM URL ─────────────────────────────────────────────────────
  /**
   * Call this from any component that reads appId from URL params.
   * Only selects if the app exists and is different from current.
   */
  syncFromUrl(urlAppId: number | null): void {
    if (!urlAppId) return;
    if (urlAppId === this.selectedAppId()) return;
    if (!this.allApps().some(a => a.id === urlAppId)) return;
    this.selectedAppId.set(urlAppId); // ✅ No router.navigate — URL already has it
  }

  // ── CLEAR ─────────────────────────────────────────────────────────────
  /**
   * Call on logout.
   */
  clear(): void {
    this.allApps.set([]);
    this.selectedAppId.set(null);
    this.initialized = false;
    sessionStorage.removeItem('dashboard-app-id');
  }
}