import { TestBed } from '@angular/core/testing';
import { TokenService } from '../token.service';
import { AuthResponse } from '../../core/models/auth.models';

const mockUser: AuthResponse = {
  id: 1,
  email: 'user@test.com',
  fullName: 'Test User',
  companyName: 'Acme',
  message: 'ok',
  verified: true,
  token: 'abc123',
  role: 'OWNER'
};

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  // ── saveToken / getToken ─────────────────────────────────────────────
  it('should save and retrieve a token', () => {
    service.saveToken('my-token');
    expect(service.getToken()).toBe('my-token');
  });

  it('should return null when no token is stored', () => {
    expect(service.getToken()).toBeNull();
  });

  // ── saveUser / getUser ───────────────────────────────────────────────
  it('should save and retrieve a user', () => {
    service.saveUser(mockUser);
    const retrieved = service.getUser();
    expect(retrieved).toEqual(mockUser);
    expect(retrieved?.email).toBe('user@test.com');
  });

  it('should return null when no user is stored', () => {
    expect(service.getUser()).toBeNull();
  });

  // ── isLoggedIn ───────────────────────────────────────────────────────
  it('should return false when no token exists', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return true when a token is stored', () => {
    service.saveToken('valid-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  // ── clear ────────────────────────────────────────────────────────────
  it('should remove both token and user on clear()', () => {
    service.saveToken('my-token');
    service.saveUser(mockUser);
    service.clear();
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });
});