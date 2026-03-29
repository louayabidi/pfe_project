import {
  Component, OnInit, OnDestroy, signal,
  computed, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject, debounceTime, distinctUntilChanged,
  takeUntil, catchError, of
} from 'rxjs';
import { EventService } from '../../../../services/event.service';
import { AppModelService, AppModel } from '../../../../services/app.service';
import { IncomingEvent, EventFilters, EventPage } from '../../../../core/models/event.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit, OnDestroy {

  appId!: number;
  apps          = signal<AppModel[]>([]);
  selectedAppId = signal<number | null>(null);
  events        = signal<IncomingEvent[]>([]);
  loading       = signal(true);
  error         = signal<string | null>(null);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);
  users         = signal<string[]>([]);
  eventNames    = signal<string[]>([]);
  expandedId    = signal<number | null>(null);

  filterForm!: FormGroup;
  readonly pageSize   = 20;
  readonly objectKeys = Object.keys;
  readonly min        = Math.min;

  private readonly destroy$ = new Subject<void>();

  readonly pageNumbers = computed(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: number[] = [];
    const start = Math.max(0, Math.min(current - 3, total - 7));
    for (let i = start; i < Math.min(start + 7, total); i++) pages.push(i);
    return pages;
  });

  constructor(
    private readonly route:        ActivatedRoute,
    private readonly router:       Router,
    private readonly eventService: EventService,
    private readonly appService:   AppModelService,
    private readonly fb:           FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      userId:    [''],
      eventName: [''],
      dateFrom:  [''],
      dateTo:    ['']
    });

    this.appService.getMyApps().pipe(
      takeUntil(this.destroy$),
      catchError(() => of([]))
    ).subscribe(apps => {
      this.apps.set(apps);

      if (apps.length === 0) {
        this.loading.set(false);
        this.error.set('Aucune application trouvée. Créez une application d\'abord.');
        return;
      }

      this.route.queryParams
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          const paramAppId = Number(params['appId']);

          if (paramAppId && apps.some(a => a.id === paramAppId)) {
            // appId valide dans l'URL → charger directement
            this.appId = paramAppId;
            this.selectedAppId.set(paramAppId);
            this.loadMeta();
            this.loadEvents();

          } else if (apps.length === 1) {
            // Une seule app → charger directement sans demander
            this.appId = apps[0].id;
            this.selectedAppId.set(apps[0].id);
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { appId: this.appId },
              replaceUrl: true
            });
            this.loadMeta();
            this.loadEvents();

          } else {
            // Plusieurs apps → afficher le sélecteur
            this.loading.set(false);
            this.selectedAppId.set(null);
          }
        });
    });

    // Debounced filter changes
    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (!this.selectedAppId()) return;
      this.currentPage.set(0);
      this.loadEvents();
    });
  }

  selectApp(appId: number): void {
    this.appId = appId;
    this.selectedAppId.set(appId);
    this.currentPage.set(0);
    this.filterForm.reset({ userId: '', eventName: '', dateFrom: '', dateTo: '' });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { appId },
      replaceUrl: true
    });
    this.loadMeta();
    this.loadEvents();
  }

  onAppChange(event: Event): void {
    const appId = Number((event.target as HTMLSelectElement).value);
    this.selectApp(appId);
  }

  private loadMeta(): void {
    this.eventService.getDistinctUsers(this.appId)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe(u => this.users.set(u));

    this.eventService.getDistinctEventNames(this.appId)
      .pipe(takeUntil(this.destroy$), catchError(() => of([])))
      .subscribe(n => this.eventNames.set(n));
  }

  loadEvents(): void {
    this.loading.set(true);
    this.error.set(null);

    const f = this.filterForm.value;
    const filters: EventFilters = {
      userId:    f.userId    || undefined,
      eventName: f.eventName || undefined,
      dateFrom:  f.dateFrom  || undefined,
      dateTo:    f.dateTo    || undefined,
      page:      this.currentPage(),
      size:      this.pageSize
    };

    this.eventService.getIncomingEvents(this.appId, filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Events error:', err);
          this.error.set('Erreur lors du chargement des événements');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((page: EventPage | null) => {
        if (!page) return;
        this.events.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadEvents();
  }

  toggleExpand(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  resetFilters(): void {
    this.filterForm.reset({ userId: '', eventName: '', dateFrom: '', dateTo: '' });
    this.currentPage.set(0);
  }

  hasActiveFilters(): boolean {
    const v = this.filterForm.value;
    return !!(v.userId || v.eventName || v.dateFrom || v.dateTo);
  }

  trackById(_: number, e: IncomingEvent): number { return e.id; }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatRelative(d: string): string {
    if (!d) return '—';
    const diff  = Date.now() - new Date(d).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return 'À l\'instant';
    if (mins  < 60) return `Il y a ${mins}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}