import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { AppStateService } from 'src/app/services/app-state.service';
import { ProfileService } from 'src/app/services/profile.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss']
})
export class DashboardShellComponent implements OnInit, OnDestroy {

  // ── Signals ───────────────────────────────────────────────────────────────
  collapsed    = signal(false);
  appInitError = signal<string | null>(null);

  // ── User signals (replaces hardcoded "Jamie Liu") ─────────────────────────
  userName     = signal('…');
  userInitials = signal('?');
  userRole     = signal('Admin');

  get currentApp() { return this.appState.currentApp(); }

  private readonly destroy$ = new Subject<void>();

  constructor(
    private appState: AppStateService,
    private profileService: ProfileService,   // ← NEW
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) this.collapsed.set(saved === 'true');
    this.checkBreakpoint();

    this.appState.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => this.appInitError.set(null),
        error: (err) => {
          console.error('Failed to initialize app state:', err);
          this.appInitError.set('Impossible de charger les applications');
        }
      });

    // ── Load real user profile ──────────────────────────────────────────────
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p) => {
          const name = p.fullName?.trim() || p.email || 'User';
          this.userName.set(name);
          this.userInitials.set(
            name.split(' ')
                .map((w: string) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
          );
        },
        error: () => {
          // Keep placeholder on error — non-critical
        }
      });
  }

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
    localStorage.setItem('sidebar-collapsed', String(this.collapsed()));
  }

  @HostListener('window:resize')
  checkBreakpoint(): void {
    if (window.innerWidth < 1024) {
      this.collapsed.set(true);
    } else {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === null) this.collapsed.set(false);
    }
  }

  isDark = signal(
    (localStorage.getItem('gamify-theme') ?? 'dark') === 'dark'
  );

  toggleTheme(): void {
    this.isDark.update(v => !v);
    localStorage.setItem('gamify-theme', this.isDark() ? 'dark' : 'light');
    document.documentElement.setAttribute(
      'data-theme', this.isDark() ? 'dark' : 'light'
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}