import {
  Component, OnInit, OnDestroy,
  HostListener, ChangeDetectionStrategy, signal
} from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  isScrolled  = signal(false);
  menuOpen    = signal(false);

  readonly navLinks = [
    { label: 'Home',     path: '/home'     },
    { label: 'Features', path: '/features' },
    { label: 'Pricing',  path: '/pricing'  },
    { label: 'Contact',  path: '/contact'  },
  ] as const;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}