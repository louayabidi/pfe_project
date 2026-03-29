import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss']
})
export class DashboardShellComponent implements OnInit, OnDestroy {

  collapsed = false;

  ngOnInit(): void {
    // Restore collapse preference across sessions
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) this.collapsed = saved === 'true';

    // Auto-collapse on small screens
    this.checkBreakpoint();
  }

  ngOnDestroy(): void {}

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem('sidebar-collapsed', String(this.collapsed));
  }

  @HostListener('window:resize')
  checkBreakpoint(): void {
    if (window.innerWidth < 1024) {
      this.collapsed = true;
    }
  }
}