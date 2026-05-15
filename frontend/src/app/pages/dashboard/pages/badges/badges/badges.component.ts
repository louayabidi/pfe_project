import { BadgeService } from './../../../../../services/badge.service';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Badge } from 'src/app/core/models/badge.models';
import { AppStateService } from 'src/app/services/app-state.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
// badges.component.ts — line 8
import { BADGE_TEMPLATES, TEMPLATE_CATEGORIES, BadgeTemplate } from './badge-templates';
@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent implements OnInit, OnDestroy {
  badges  = signal<Badge[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  // ── Template state ───────────────────────────────────────────────────
  showTemplates     = signal(false);
  activeCategory    = signal('All');
  creatingFromTpl   = signal<string | null>(null); // template name being created
  tplSuccess        = signal<string | null>(null);  // success flash message

  readonly templates      = BADGE_TEMPLATES;
  readonly allCategories  = ['All', ...TEMPLATE_CATEGORIES];

  private readonly destroy$ = new Subject<void>();
  private readonly appId$   = toObservable(this.appState.currentAppId);

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

    this.appId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((appId: number | null) => {
        if (appId) this.loadBadges(appId);
        else {
          this.error.set('Aucune application sélectionnée');
          this.loading.set(false);
        }
      });
  }

  // ── Filtered templates ───────────────────────────────────────────────
  get filteredTemplates(): BadgeTemplate[] {
    const cat = this.activeCategory();
    return cat === 'All'
      ? this.templates
      : this.templates.filter(t => t.category === cat);
  }

  // ── Already added? ───────────────────────────────────────────────────
  isAlreadyAdded(template: BadgeTemplate): boolean {
    return this.badges().some(
      b => b.name.toLowerCase() === template.name.toLowerCase()
    );
  }

  // ── Create from template ─────────────────────────────────────────────
  createFromTemplate(template: BadgeTemplate): void {
    const appId = this.appState.currentAppId();
    if (!appId || this.creatingFromTpl()) return;

    this.creatingFromTpl.set(template.name);

    this.badgeService.createBadge(appId, {
      name:             template.name,
      description:      template.description,
      imageUrl:         template.imageUrl,
      hidden:           false,
      maxAwardsPerUser: undefined  
    }).subscribe({
      next: (badge) => {
        this.badges.update(b => [...b, badge]);
        this.creatingFromTpl.set(null);
        this.tplSuccess.set(`"${badge.name}" ajouté avec succès !`);
        setTimeout(() => this.tplSuccess.set(null), 3000);
      },
      error: (err) => {
        this.creatingFromTpl.set(null);
        this.error.set(err.error?.message || 'Erreur lors de la création');
      }
    });
  }

  loadBadges(appId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.badgeService.getBadges(appId).subscribe({
      next:  (badges) => { this.badges.set(badges);  this.loading.set(false); },
      error: ()       => { this.error.set('Impossible de charger les badges'); this.loading.set(false); }
    });
  }

  deleteBadge(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) return;
    const appId = this.appState.currentAppId();
    if (!appId) return;
    this.badgeService.deleteBadge(id, appId).subscribe({
      next:  ()  => { this.badges.update(b => b.filter(badge => badge.id !== id)); },
      error: ()  => { this.error.set('Erreur lors de la suppression du badge'); }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/badges/new'], {
      queryParams: { appId: this.appState.currentAppId() }
    });
  }

  get appId(): number | null { return this.appState.currentAppId(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}