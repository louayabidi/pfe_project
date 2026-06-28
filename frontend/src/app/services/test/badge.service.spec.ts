import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BadgeService, Badge, CreateBadgeRequest } from '../badge.service';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/api/badges`;

const mockBadge: Badge = {
  id: 1, name: 'First Login', description: 'Awarded on first login',
  imageUrl: 'https://example.com/badge.png', hidden: false,
  maxAwardsPerUser: 1, createdAt: '2024-01-01', appId: 42
};

describe('BadgeService', () => {
  let service: BadgeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BadgeService]
    });
    service = TestBed.inject(BadgeService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    service.clearCache();
  });

  // ── getBadges ────────────────────────────────────────────────────────
  describe('getBadges()', () => {
    it('should GET badges with appId as query param', () => {
      service.getBadges(42).subscribe(badges => {
        expect(badges.length).toBe(1);
        expect(badges[0].name).toBe('First Login');
      });

      const req = http.expectOne(r => r.url === API && r.params.get('appId') === '42');
      expect(req.request.method).toBe('GET');
      req.flush([mockBadge]);
    });

    it('should return cached result on second call without new HTTP request', () => {
      // First call — hits the network
      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockBadge]);

      // Second call — should come from cache, no HTTP request
      service.getBadges(42).subscribe(badges => {
        expect(badges[0].id).toBe(1);
      });
      http.expectNone(API);
    });

    it('should return empty array on HTTP error', () => {
      service.getBadges(42).subscribe(badges => expect(badges).toEqual([]));
      http.expectOne(r => r.url === API).flush(
        'Server Error', { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  // ── createBadge ──────────────────────────────────────────────────────
  describe('createBadge()', () => {
    it('should POST a new badge with appId query param', () => {
      const request: CreateBadgeRequest = { name: 'New Badge', hidden: false };

      service.createBadge(42, request).subscribe(badge => {
        expect(badge.id).toBe(1);
        expect(badge.name).toBe('First Login');
      });

      const req = http.expectOne(r => r.url === API && r.params.get('appId') === '42');
      expect(req.request.method).toBe('POST');
      req.flush(mockBadge);
    });

    it('should invalidate cache after creating a badge', () => {
      // Populate cache first
      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockBadge]);

      // Create badge — should clear cache
      service.createBadge(42, { name: 'New' }).subscribe();
     http.expectOne(r => r.url === API && r.method === 'POST').flush(mockBadge);

      // Next getBadges call should hit the network again
      service.getBadges(42).subscribe();
http.expectOne(r => r.url === API && r.method === 'GET').flush([mockBadge]);    });
  });

  // ── deleteBadge ──────────────────────────────────────────────────────
  describe('deleteBadge()', () => {
    it('should DELETE a badge with appId query param', () => {
      service.deleteBadge(1, 42).subscribe(res => expect(res).toBeNull());

      const req = http.expectOne(r => r.url === `${API}/1` && r.params.get('appId') === '42');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should invalidate cache after deleting a badge', () => {
      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockBadge]);

      service.deleteBadge(1, 42).subscribe();
      http.expectOne(r => r.url === `${API}/1`).flush(null);

      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([]);
    });
  });

  // ── cache management ─────────────────────────────────────────────────
  describe('cache management', () => {
    it('invalidateCache() should clear only the specified appId', () => {
      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockBadge]);

      service.invalidateCache(42);

      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockBadge]);
    });

    it('clearCache() should clear all cached entries', () => {
      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockBadge]);

      service.clearCache();

      service.getBadges(42).subscribe();
      http.expectOne(r => r.url === API).flush([mockBadge]);
    });
  });

  // ── uploadImage ──────────────────────────────────────────────────────
  describe('uploadImage()', () => {
    it('should POST file and return image URL', () => {
      const file = new File(['img'], 'badge.png', { type: 'image/png' });

      service.uploadImage(file).subscribe(url => {
        expect(url).toBe('https://cdn.example.com/badge.png');
      });

      const req = http.expectOne(`${environment.apiUrl}/api/badges/upload-image`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush({ url: 'https://cdn.example.com/badge.png' });
    });
  });
});