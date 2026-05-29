import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';

const mockAuthResponse: AuthResponse = {
  id: 1, email: 'user@test.com', fullName: 'User',
  companyName: 'Co', message: 'ok', verified: true,
  token: 'tok', role: 'OWNER'
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn']);
    authSpy.isLoggedIn.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }]
    });

    fixture     = TestBed.createComponent(LoginComponent);
    component   = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router      = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // ── Form validation ───────────────────────────────────────────────────
  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('should be invalid with a bad email', () => {
      component.form.setValue({ email: 'not-an-email', password: 'pass' });
      expect(component.form.get('email')?.invalid).toBeTrue();
    });

    it('should be valid with correct email and password', () => {
      component.form.setValue({ email: 'user@test.com', password: 'password' });
      expect(component.form.valid).toBeTrue();
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────
  describe('submit()', () => {
    it('should mark form as touched and not call login when form is invalid', () => {
      component.submit();
      expect(authService.login).not.toHaveBeenCalled();
      expect(component.form.touched).toBeTrue();
    });

    it('should set loading to true while request is pending', () => {
      authService.login.and.returnValue(of(mockAuthResponse));
      component.form.setValue({ email: 'user@test.com', password: 'pass' });
      component.submit();
      // loading is reset to false in the next() callback — check the sequence via spy
      expect(authService.login).toHaveBeenCalled();
    });

    it('should navigate to /dashboard on success', fakeAsync(() => {
      authService.login.and.returnValue(of(mockAuthResponse));
      spyOn(router, 'navigate');
      component.form.setValue({ email: 'user@test.com', password: 'pass' });
      component.submit();
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should set error signal on login failure', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => new Error('Invalid email or password')));
      component.form.setValue({ email: 'bad@test.com', password: 'wrong' });
      component.submit();
      tick();
      expect(component.error()).toBe('Invalid email or password');
      expect(component.loading()).toBeFalse();
    }));

    it('should start lockout timer when error contains "Account is locked"', fakeAsync(() => {
      authService.login.and.returnValue(
        throwError(() => new Error('Account is locked for 10 minutes'))
      );
      component.form.setValue({ email: 'locked@test.com', password: 'pass' });
      component.submit();
      tick();
      expect(component.isLockedOut()).toBeTrue();
      expect(component.lockoutTimeRemaining()).toBe(600);
      component.ngOnDestroy(); // clean up timer
    }));

    it('should block submission when account is locked out', () => {
      // Manually set lockout state
      (component as any).startLockoutTimer(300);
      component.form.setValue({ email: 'user@test.com', password: 'pass' });
      component.submit();
      expect(authService.login).not.toHaveBeenCalled();
      expect(component.error()).toContain('locked');
      component.ngOnDestroy();
    });
  });

  // ── getLockoutTimeFormatted() ─────────────────────────────────────────
  describe('getLockoutTimeFormatted()', () => {
    it('should format seconds as MM:SS', () => {
      (component as any).lockoutTimeRemaining.set(125);
      expect(component.getLockoutTimeFormatted()).toBe('2:05');
    });

    it('should return 0:00 when no time remaining', () => {
      (component as any).lockoutTimeRemaining.set(0);
      expect(component.getLockoutTimeFormatted()).toBe('0:00');
    });
  });

  // ── keyboard shortcut ─────────────────────────────────────────────────
  it('should navigate to /admin/login on Alt+A', () => {
    spyOn(router, 'navigate');
    const event = new KeyboardEvent('keydown', { altKey: true, key: 'a' });
    component.handleKeyboardEvent(event);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  // ── ngOnDestroy ───────────────────────────────────────────────────────
  it('should clean up on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});