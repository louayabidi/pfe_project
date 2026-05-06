import {
  Component, OnInit, OnDestroy, signal, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, catchError, of } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { AppStateService } from 'src/app/services/app-state.service';
import { IncomingEvent, EventFilters, EventPage } from 'src/app/core/models/event.model';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit, OnDestroy {
  // ── SIGNALS ──────────────────────────────────────────────────────
  events = signal<IncomingEvent[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  users = signal<string[]>([]);
  eventNames = signal<string[]>([]);
  expandedId = signal<number | null>(null);

  // ── FORM & CONFIG ────────────────────────────────────────────────
  filterForm!: FormGroup;
  readonly pageSize = 20;
  readonly objectKeys = Object.keys;
  readonly min = Math.min;

  // ── COMPUTED ─────────────────────────────────────────────────────
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: number[] = [];
    const start = Math.max(0, Math.min(current - 3, total - 7));
    for (let i = start; i < Math.min(start + 7, total); i++) pages.push(i);
    return pages;
  });

  // ── APP STATE ────────────────────────────────────────────────────
  readonly selectedAppId = this.appState.currentAppId;
  readonly apps = this.appState.apps;

  // ── toObservable as field initializer (injection context ✓) ──────
  private readonly appId$ = toObservable(this.appState.currentAppId);

  // ── PRIVATE ──────────────────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    readonly appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.initializeFilterForm();

    // Initialize from URL if needed
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const urlAppId = params['appId'] ? Number(params['appId']) : null;
        if (urlAppId && !this.appState.currentAppId()) {
          this.appState.selectApp(urlAppId);
        }
      });

    // ✅ Use pre-built observable instead of calling toObservable() here
    this.appId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((appId: number | null) => {
        if (appId) {
          this.loadMetadata(appId);
          this.loadEvents();
        }
      });

    // React to filter changes with debounce
this.filterForm.valueChanges
  .pipe(
    debounceTime(400),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    takeUntil(this.destroy$)
  )
  .subscribe(() => {
    if (!this.appState.currentAppId()) return;
    this.currentPage.set(0);  
    this.loadEvents();
  });
  }

  selectApp(appId: number): void {
    this.appState.selectApp(appId);
  }

  onAppChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (id) this.appState.selectApp(id);
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      userId: [''],
      eventName: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

private loadMetadata(appId: number): void {
  this.eventService.getDistinctDisplayNames(appId)  // ← NEW method
    .pipe(
      takeUntil(this.destroy$),
      catchError(() => of([]))
    )
    .subscribe(names => this.users.set(names));  // ← reuse users signal

  this.eventService.getDistinctEventNames(appId)
    .pipe(
      takeUntil(this.destroy$),
      catchError(() => of([]))
    )
    .subscribe(names => this.eventNames.set(names));
}

loadEvents(): void {
  const appId = this.appState.currentAppId();
  if (!appId) return;

  this.loading.set(true);
  this.error.set(null);

  const f = this.filterForm.value;
  const page = this.currentPage(); 

  const filters: EventFilters = {
    userId: f.userId || undefined,
    eventName: f.eventName || undefined,
    dateFrom: f.dateFrom || undefined,
    dateTo: f.dateTo || undefined,
    page: page,           
    size: this.pageSize
  };

  this.eventService.getIncomingEvents(appId, filters)
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

 // events.component.ts

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
   
  }

  hasActiveFilters(): boolean {
    const v = this.filterForm.value;
    return !!(v.userId || v.eventName || v.dateFrom || v.dateTo);
  }

  trackById(_: number, e: IncomingEvent): number {
    return e.id;
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatRelative(d: string): string {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  }

  get appId(): number | null {
    return this.appState.currentAppId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}