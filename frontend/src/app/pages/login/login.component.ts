import {
  Component, ChangeDetectionStrategy, signal, OnDestroy, HostListener
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnDestroy {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  showPass = signal(false);
  
  // Lockout tracking
  isLockedOut = signal(false);
  lockoutTimeRemaining = signal<number | null>(null);
  private lockoutTimer: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    if (this.isLockedOut()) {
      this.error.set('Account is temporarily locked. Please try again later.');
      return;
    }
    
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err: Error) => {
          this.loading.set(false);
          const errorMessage = err.message;
          
          // Check if it's an account lockout error
          if (errorMessage && errorMessage.includes('Account is locked')) {
            // Extract remaining time from error message if available
            const match = errorMessage.match(/(\d+)\s*(?:minutes?|mins?)/i);
            if (match) {
              const minutes = parseInt(match[1], 10);
              this.startLockoutTimer(minutes * 60);
            } else {
              // Default to 10 minutes if we can't extract the time
              this.startLockoutTimer(600);
            }
          }
          
          this.error.set(errorMessage);
        }
      });
  }
  
  /**
   * Start countdown timer for account lockout
   */
  private startLockoutTimer(seconds: number): void {
    this.isLockedOut.set(true);
    this.lockoutTimeRemaining.set(seconds);
    
    // Clear any existing timer
    if (this.lockoutTimer) {
      clearInterval(this.lockoutTimer);
    }
    
    // Update every second
    this.lockoutTimer = setInterval(() => {
      const remaining = this.lockoutTimeRemaining() || 0;
      if (remaining > 1) {
        this.lockoutTimeRemaining.set(remaining - 1);
      } else {
        this.lockoutTimeRemaining.set(null);
        this.isLockedOut.set(false);
        this.error.set(null);
        clearInterval(this.lockoutTimer);
      }
    }, 1000);
  }
  
  /**
   * Get formatted lockout time (MM:SS)
   */
  getLockoutTimeFormatted(): string {
    const seconds = this.lockoutTimeRemaining() || 0;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  get f() { 
    return this.form.controls; 
  }

  ngOnDestroy(): void {
    if (this.lockoutTimer) {
      clearInterval(this.lockoutTimer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Global Key Listener
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      this.router.navigate(['/admin/login']);
    }
  }
}