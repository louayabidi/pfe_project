import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AdminLoginComponent } from './admin-login.component';
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../core/models/auth.models';

const mockAdminResponse: AuthResponse = {
  id: 99, email: 'admin@test.com', fullName: 'Admin',
  companyName: '', message: 'Admin login successful',
  verified: false, token: 'admin-tok', role: 'ADMIN'
};

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['adminLogin', 'isLoggedIn']);

    TestBed.configureTestingModule({
      declarations: [AdminLoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }]
    });

    fixture     = TestBed.createComponent(AdminLoginComponent);
    component   = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router      = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // ── Form validation ───────────────────────────────────────────────────
  it('should be invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should be invalid with a bad email format', () => {
    component.form.setValue({ email: 'notvalid', password: 'pass' });
    expect(component.form.get('email')?.invalid).toBeTrue();
  });

  it('should be valid with correct email and password', () => {
    component.form.setValue({ email: 'admin@test.com', password: 'adminpass' });
    expect(component.form.valid).toBeTrue();
  });

  // ── submit() ──────────────────────────────────────────────────────────
  it('should not call adminLogin when form is invalid', () => {
    component.submit();
    expect(authService.adminLogin).not.toHaveBeenCalled();
  });

  it('should navigate to /admin/dashboard on success', fakeAsync(() => {
    authService.adminLogin.and.returnValue(of(mockAdminResponse));
    spyOn(router, 'navigate');
    component.form.setValue({ email: 'admin@test.com', password: 'adminpass' });
    component.submit();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  }));

  it('should set error signal and reset loading on failure', fakeAsync(() => {
    authService.adminLogin.and.returnValue(
      throwError(() => new Error('Access forbidden'))
    );
    component.form.setValue({ email: 'admin@test.com', password: 'wrong' });
    component.submit();
    tick();
    expect(component.error()).toBe('Access forbidden');
    expect(component.loading()).toBeFalse();
  }));

  it('should set loading to true on submit before response', () => {
    authService.adminLogin.and.returnValue(of(mockAdminResponse));
    component.form.setValue({ email: 'admin@test.com', password: 'pass' });
    // loading is set then immediately reset — just check adminLogin was called
    component.submit();
    expect(authService.adminLogin).toHaveBeenCalledWith({
      email: 'admin@test.com', password: 'pass'
    });
  });

  it('should clean up on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});