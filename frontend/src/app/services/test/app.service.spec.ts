import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppModelService, AppModel, CreateAppRequest } from '../app.service';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/api/apps`;

const mockApp: AppModel = {
  id: 1, name: 'Test App', description: 'A test app',
  apiKey: 'key-abc', active: true, createdAt: '2024-01-01'
};

describe('AppModelService', () => {
  let service: AppModelService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppModelService]
    });
    service = TestBed.inject(AppModelService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // ── getMyApps ────────────────────────────────────────────────────────
  describe('getMyApps()', () => {
    it('should GET all apps', () => {
      service.getMyApps().subscribe(apps => {
        expect(apps.length).toBe(2);
        expect(apps[0].name).toBe('Test App');
      });
      const req = http.expectOne(API);
      expect(req.request.method).toBe('GET');
      req.flush([mockApp, { ...mockApp, id: 2, name: 'App 2' }]);
    });

    it('should return an empty array when no apps exist', () => {
      service.getMyApps().subscribe(apps => expect(apps).toEqual([]));
      http.expectOne(API).flush([]);
    });
  });

  // ── createApp ────────────────────────────────────────────────────────
  describe('createApp()', () => {
    it('should POST a new app and return it', () => {
      const payload: CreateAppRequest = { name: 'New App', description: 'Desc' };

      service.createApp(payload).subscribe(app => {
        expect(app.id).toBe(1);
        expect(app.name).toBe('Test App');
      });

      const req = http.expectOne(API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockApp);
    });
  });

  // ── deleteApp ────────────────────────────────────────────────────────
  describe('deleteApp()', () => {
    it('should DELETE the app with the given id', () => {
      service.deleteApp(1).subscribe(res => expect(res).toBeUndefined());

      const req = http.expectOne(`${API}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ── updateApp ────────────────────────────────────────────────────────
  describe('updateApp()', () => {
    it('should PUT updated fields and return the updated app', () => {
      const update = { name: 'Updated', description: 'New desc' };
      const updated = { ...mockApp, ...update };

      service.updateApp(1, update).subscribe(app => {
        expect(app.name).toBe('Updated');
        expect(app.description).toBe('New desc');
      });

      const req = http.expectOne(`${API}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      req.flush(updated);
    });
  });
});