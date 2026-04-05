/**
 * ============================================================================
 * DASHBOARD SHELL COMPONENT (UPDATED)
 * ============================================================================
 * Main layout component that initializes AppStateService.
 * Manages sidebar collapse state.
 * 
 * Location: src/app/pages/dashboard/dashboard-shell/dashboard-shell.component.ts
 */

import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { AppStateService } from 'src/app/services/app-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss']
})
export class DashboardShellComponent implements OnInit, OnDestroy {
  // ── SIGNALS ──────────────────────────────────────────────────────
  collapsed = signal(false);
  appInitError = signal<string | null>(null);

  // ── PRIVATE ──────────────────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  constructor(private appState: AppStateService) {}

  ngOnInit(): void {
    // Restore collapse preference from localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      this.collapsed.set(saved === 'true');
    }

    // Auto-collapse on small screens
    this.checkBreakpoint();

    // Initialize app state (load apps and select one if needed)
    this.appState.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // App state initialized successfully
          this.appInitError.set(null);
        },
        error: (err) => {
          console.error('Failed to initialize app state:', err);
          this.appInitError.set('Impossible de charger les applications');
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
      // Restore saved state on larger screens
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === null) this.collapsed.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}