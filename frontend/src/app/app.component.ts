import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showShell   = false;
  isDashboard = false;
  isDark      = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Restore saved theme preference on load
    const saved = localStorage.getItem('gamify-theme');
    this.isDark = saved ? saved === 'dark' : true;
    this.applyTheme();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url        = e.urlAfterRedirects;
      this.showShell   = !url.includes('/splash');
      this.isDashboard =  url.includes('/dashboard');
    });
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('gamify-theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isDark ? 'dark' : 'light'
    );
  }
}