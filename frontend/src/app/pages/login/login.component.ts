import {
  Component, ChangeDetectionStrategy, signal, OnDestroy ,HostListener
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
  loading  = signal(false);
  error    = signal<string | null>(null);
  showPass = signal(false);

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
      email:    ['', [Validators.required, Validators.email]],
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
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
  }

  get f() { return this.form.controls; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  //  Global Key Listener
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    
   
    if (event.altKey && event.key.toLowerCase() === 'a') {
      event.preventDefault(); // Prevent default browser behavior if any
      this.router.navigate(['/admin/login']);
    }
  }
}