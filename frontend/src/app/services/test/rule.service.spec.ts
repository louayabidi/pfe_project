import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RuleService, Rule, CreateRuleRequest } from '../rule.service';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/api/rules`;

const mockRule: Rule = {
  id: 1, name: 'Login Rule', description: 'Award on login',
  triggerEvent: 'USER_LOGIN', conditions: [], actions: [],
  active: true, createdAt: '2024-01-01', appId: 42
};

const mockCreateRequest: CreateRuleRequest = {
  name: 'Login Rule', triggerEvent: 'USER_LOGIN',
  conditions: [], actions: []
};

describe('RuleService', () => {
  let service: RuleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RuleService]
    });
    service = TestBed.inject(RuleService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    service.clearCache();
  });

  // ── getRules ─────────────────────────────────────────────────────────
  describe('getRules()', () => {
    it('should GET rules with appId query param', () => {
      service.getRules(42).subscribe(rules => {
        expect(rules.length).toBe(1);
        expect(rules[0].triggerEvent).toBe('USER_LOGIN');
      });

      const req = http.expectOne(r => r.url === API && r.params.get('appId') === '42');
      expect(req.request.method).toBe('GET');
      req.flush([mockRule]);
    });

    it('should serve cached rules on second call', () => {
      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockRule]);

      service.getRules(42).subscribe(rules => expect(rules[0].id).toBe(1));
      http.expectNone(API);
    });

    it('should return empty array on HTTP error', () => {
      service.getRules(42).subscribe(rules => expect(rules).toEqual([]));
      http.expectOne(r => r.url === API).flush(
        'Error', { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  // ── getRule ──────────────────────────────────────────────────────────
  describe('getRule()', () => {
    it('should GET a single rule by id', () => {
      service.getRule(1, 42).subscribe(rule => expect(rule.name).toBe('Login Rule'));

      const req = http.expectOne(r => r.url === `${API}/1` && r.params.get('appId') === '42');
      expect(req.request.method).toBe('GET');
      req.flush(mockRule);
    });
  });

  // ── createRule ───────────────────────────────────────────────────────
  describe('createRule()', () => {
    it('should POST a new rule and return it', () => {
      service.createRule(42, mockCreateRequest).subscribe(rule => {
        expect(rule.name).toBe('Login Rule');
      });

      const req = http.expectOne(r => r.url === API && r.params.get('appId') === '42');
      expect(req.request.method).toBe('POST');
      req.flush(mockRule);
    });

    it('should invalidate cache after creating a rule', () => {
      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API && r.method === 'GET').flush([mockRule]);
      service.createRule(42, mockCreateRequest).subscribe();
     http.expectOne(r => r.url === API && r.method === 'POST').flush(mockRule);

      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API && r.method === 'GET').flush([mockRule]);    });
  });

  // ── toggleRule ───────────────────────────────────────────────────────
  describe('toggleRule()', () => {
    it('should PATCH toggle endpoint with active status', () => {
      service.toggleRule(1, false, 42).subscribe(rule => expect(rule.active).toBeFalse());

      const req = http.expectOne(r =>
        r.url === `${API}/1/toggle` && r.params.get('appId') === '42'
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ active: false });
      req.flush({ ...mockRule, active: false });
    });

    it('should invalidate cache after toggling', () => {
      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockRule]);

      service.toggleRule(1, false, 42).subscribe();
      http.expectOne(r => r.url === `${API}/1/toggle`).flush({ ...mockRule, active: false });

      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API).flush([{ ...mockRule, active: false }]);
    });
  });

  // ── deleteRule ───────────────────────────────────────────────────────
  describe('deleteRule()', () => {
    it('should DELETE a rule with appId query param', () => {
      service.deleteRule(1, 42).subscribe(res => expect(res).toBeNull());

      const req = http.expectOne(r => r.url === `${API}/1` && r.params.get('appId') === '42');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should invalidate cache after deletion', () => {
      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockRule]);

      service.deleteRule(1, 42).subscribe();
      http.expectOne(r => r.url === `${API}/1`).flush(null);

      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API).flush([]);
    });
  });

  // ── invalidateCache / clearCache ─────────────────────────────────────
  describe('cache management', () => {
    it('invalidateCache() should force a new HTTP call for that appId', () => {
      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockRule]);

      service.invalidateCache(42);

      service.getRules(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockRule]);
    });
  });
});