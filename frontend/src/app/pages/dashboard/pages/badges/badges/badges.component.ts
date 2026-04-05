import { BadgeService } from './../../../../../services/badge.service';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Badge } from 'src/app/core/models/badge.models';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent implements OnInit, OnDestroy {
  badges  = signal<Badge[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  private readonly destroy$ = new Subject<void>();

  // ✅ Field initializer — runs in injection context
  private readonly appId$ = toObservable(this.appState.currentAppId);

  constructor(
    private badgeService: BadgeService,
    private router: Router,
    private route: ActivatedRoute,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
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
          this.loadBadges(appId);
        } else {
          this.error.set('Aucune application sélectionnée');
          this.loading.set(false);
        }
      });
  }

  loadBadges(appId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.badgeService.getBadges(appId).subscribe({
      next: (badges) => {
        this.badges.set(badges);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les badges');
        this.loading.set(false);
      }
    });
  }

  deleteBadge(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) return;
    const appId = this.appState.currentAppId();
    if (!appId) return;

    this.badgeService.deleteBadge(id, appId).subscribe({
      next: () => {
        this.badges.update(b => b.filter(badge => badge.id !== id));
      },
      error: () => {
        this.error.set('Erreur lors de la suppression du badge');
      }
    });
  }

  goToCreate(): void {
    const appId = this.appState.currentAppId();
    this.router.navigate(['/dashboard/badges/new'], {
      queryParams: { appId }
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