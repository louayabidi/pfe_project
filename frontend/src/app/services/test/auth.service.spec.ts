import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import { AuthResponse } from '../../core/models/auth.models';
import { environment } from '../../../environments/environment';

const mockAuthResponse: AuthResponse = {
  id: 1,
  email: 'user@test.com',
  fullName: 'Test User',
  companyName: 'Acme',
  message: 'Login successful',
  verified: true,
  token: 'jwt-token-xyz',
  role: 'OWNER'
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let tokenService: TokenService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, TokenService]
    });
    service      = TestBed.inject(AuthService);
    http         = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
    router       = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // ── login ────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should POST credentials and save token on success', () => {
      spyOn(tokenService, 'saveToken').and.callThrough();
      spyOn(tokenService, 'saveUser').and.callThrough();

      service.login({ email: 'user@test.com', password: 'pass' }).subscribe(res => {
        expect(res.token).toBe('jwt-token-xyz');
      });

      const req = http.expectOne(`${environment.apiUrl}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);

      expect(tokenService.saveToken).toHaveBeenCalledWith('jwt-token-xyz');
      expect(tokenService.saveUser).toHaveBeenCalledWith(mockAuthResponse);
    });

    it('should update currentUser$ on successful login', () => {
      service.login({ email: 'user@test.com', password: 'pass' }).subscribe();
      http.expectOne(`${environment.apiUrl}/api/auth/login`).flush(mockAuthResponse);

      service.currentUser$.subscribe(user => {
        expect(user?.email).toBe('user@test.com');
      });
    });

    it('should return a friendly error message on 401', (done) => {
      service.login({ email: 'bad@test.com', password: 'wrong' }).subscribe({
        error: (err: Error) => {
          expect(err.message).toBe('Invalid email or password');
          done();
        }
      });
      http.expectOne(`${environment.apiUrl}/api/auth/login`).flush(
        { message: '' }, { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('should use the backend error message when provided', (done) => {
      service.login({ email: 'locked@test.com', password: 'pass' }).subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Account is locked');
          done();
        }
      });
      http.expectOne(`${environment.apiUrl}/api/auth/login`).flush(
        { message: 'Account is locked for 10 minutes' },
        { status: 403, statusText: 'Forbidden' }
      );
    });

    it('should return a connection error message on status 0', (done) => {
      service.login({ email: 'user@test.com', password: 'pass' }).subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Unable to connect');
          done();
        }
      });
      http.expectOne(`${environment.apiUrl}/api/auth/login`).error(
        new ProgressEvent('error'), { status: 0 }
      );
    });
  });

  // ── register ─────────────────────────────────────────────────────────
  describe('register()', () => {
    it('should POST to register endpoint and save token', () => {
      spyOn(tokenService, 'saveToken').and.callThrough();

service.register({ email: 'new@test.com', password: 'pass', fullName: 'New' }).subscribe();
      const req = http.expectOne(`${environment.apiUrl}/api/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);

      expect(tokenService.saveToken).toHaveBeenCalledWith('jwt-token-xyz');
    });
  });

  // ── logout ────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should clear token, nullify currentUser and navigate to /login', () => {
      tokenService.saveToken('jwt-token-xyz');
      tokenService.saveUser(mockAuthResponse);

      spyOn(router, 'navigate');
      service.logout();

      expect(tokenService.getToken()).toBeNull();
      expect(service.currentUser).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // ── isLoggedIn ────────────────────────────────────────────────────────
  describe('isLoggedIn()', () => {
    it('should return false when no token exists', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return true when token exists', () => {
      tokenService.saveToken('jwt-token-xyz');
      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  // ── adminLogin ────────────────────────────────────────────────────────
  describe('adminLogin()', () => {
    it('should POST to admin endpoint and map response to AuthResponse', () => {
      const adminResponse = {
        id: 99, email: 'admin@test.com', fullName: 'Admin',
        role: 'ADMIN', token: 'admin-token'
      };

      service.adminLogin({ email: 'admin@test.com', password: 'adminpass' }).subscribe(res => {
        expect(res.token).toBe('admin-token');
        expect(res.role).toBe('ADMIN');
        expect(res.companyName).toBe('');
      });

      http.expectOne(`${environment.apiUrl}/api/admin/auth/login`).flush(adminResponse);
    });
  });
});