import {
  Component, ChangeDetectionStrategy, signal, computed, OnInit  ,ViewEncapsulation
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
   encapsulation: ViewEncapsulation.None 
})
export class AdminShellComponent implements OnInit {

  theme            = signal<'dark' | 'light'>(
    (localStorage.getItem('admin-theme') as 'dark' | 'light') ?? 'dark'
  );
  sidebarCollapsed = signal(false);
  pageTitle        = signal('Overview');

  private user = signal<any>(null);

  adminName    = computed(() => this.user()?.fullName  ?? 'Admin');
  adminEmail   = computed(() => this.user()?.email     ?? '');
  adminInitial = computed(() => (this.user()?.fullName ?? 'A').charAt(0).toUpperCase());
  isSuperAdmin = computed(() => this.user()?.role === 'SUPER_ADMIN');

  private readonly TITLES: Record<string, string> = {
    overview: 'Overview',
    owners:   'App Owners',
    admins:   'Admin Team',
  };

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user.set(this.tokenService.getUser());

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const segment = (e.urlAfterRedirects as string).split('/').pop() ?? '';
        this.pageTitle.set(this.TITLES[segment] ?? 'Admin Panel');
      });

    const segment = this.router.url.split('/').pop() ?? '';
    this.pageTitle.set(this.TITLES[segment] ?? 'Admin Panel');
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem('admin-theme', next);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}