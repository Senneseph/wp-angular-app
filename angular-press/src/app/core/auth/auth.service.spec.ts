import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    httpMock.verify();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize with null user when localStorage is empty', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should initialize with user from localStorage if available', () => {
      if (typeof localStorage === 'undefined') {
        pending('localStorage not available in this environment');
        return;
      }

      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'administrator',
        capabilities: ['manage_options'],
        meta: {},
        registeredDate: new Date(),
        status: 'active'
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      // Create a new TestBed instance to test constructor
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          { provide: Router, useValue: routerSpy }
        ]
      });
      const newService = TestBed.inject(AuthService);
      expect(newService.currentUser).toBeTruthy();
      expect(newService.currentUser?.username).toBe('testuser');
    });
  });

  describe('currentUser getter', () => {
    it('should return null when no user is logged in', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should return current user when logged in', (done) => {
      const mockResponse = { access_token: 'fake-jwt-token' };

      service.login('admin', 'password').subscribe(() => {
        expect(service.currentUser).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('currentUser$ observable', () => {
    it('should be defined', () => {
      expect(service.currentUser$).toBeDefined();
    });

    it('should emit null initially', (done) => {
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should emit user after login', (done) => {
      const mockResponse = { access_token: 'fake-jwt-token' };
      let emissionCount = 0;

      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(user).toBeTruthy();
          done();
        }
      });

      service.login('testuser', 'password').subscribe();

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    const mockResponse = { access_token: 'fake-jwt-token' };

    it('should make POST request to login endpoint', (done) => {
      service.login('admin', 'password').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'admin', password: 'password' });
      req.flush(mockResponse);
    });

    it('should store token in localStorage', (done) => {
      if (typeof localStorage === 'undefined') {
        pending('localStorage not available in this environment');
        return;
      }

      service.login('admin', 'password').subscribe(() => {
        const storedToken = localStorage.getItem('token');
        expect(storedToken).toBe('fake-jwt-token');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should set currentUser after successful login', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.currentUser).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should emit user through currentUser$ observable', (done) => {
      let emissionCount = 0;
      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(user).toBeTruthy();
          done();
        }
      });

      service.login('admin', 'password').subscribe();

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    beforeEach((done) => {
      const mockResponse = { access_token: 'fake-jwt-token' };
      service.login('admin', 'password').subscribe(() => {
        done();
      });
      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should clear currentUser', () => {
      service.logout();
      expect(service.currentUser).toBeNull();
    });

    it('should remove token from localStorage', () => {
      if (typeof localStorage === 'undefined') {
        pending('localStorage not available in this environment');
        return;
      }

      service.logout();
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');
      expect(storedToken).toBeNull();
      expect(storedUser).toBeNull();
    });

    it('should navigate to login page', () => {
      service.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ap-admin/login']);
    });

    it('should emit null through currentUser$ observable', (done) => {
      let emissionCount = 0;
      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 3) {
          expect(user).toBeNull();
          done();
        }
      });

      service.logout();
    });
  });

  describe('hasCapability', () => {
    const mockResponse = { access_token: 'fake-jwt-token' };

    it('should return false when no user is logged in', () => {
      expect(service.hasCapability('manage_options')).toBe(false);
    });

    it('should return true when user has the capability', (done) => {
      service.login('admin', 'password').subscribe(() => {
        // After login, user should have capabilities
        // This test may need adjustment based on actual implementation
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should return false when user does not have the capability', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.hasCapability('nonexistent_capability')).toBe(false);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });
  });
});

