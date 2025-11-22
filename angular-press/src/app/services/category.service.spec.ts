import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);

    // Flush the initial loadCategories() call from constructor
    const initialReq = httpMock.expectOne(req => req.url.includes('/categories'));
    initialReq.flush({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should return an observable of categories', (done) => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Tech', slug: 'tech', description: 'Technology', count: 5 }
      ];

      service.getCategories().subscribe(categories => {
        expect(categories).toBeDefined();
        expect(Array.isArray(categories)).toBe(true);
        done();
      });
    });

    it('should return categories with correct structure', (done) => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Tech', slug: 'tech', description: 'Technology', count: 5 }
      ];

      // Trigger a reload
      service['loadCategories']();

      const req = httpMock.expectOne(request => request.url.includes('/categories'));
      req.flush({ data: mockCategories, total: 1, page: 1, limit: 100, totalPages: 1 });

      service.getCategories().subscribe(categories => {
        if (categories.length > 0) {
          const category = categories[0];
          expect(category.id).toBeDefined();
          expect(category.name).toBeDefined();
          expect(category.slug).toBeDefined();
        }
        done();
      });
    });
  });

  describe('getCategoryById', () => {
    it('should make GET request to fetch category by id', (done) => {
      const mockCategory: Category = { id: 1, name: 'Tech', slug: 'tech', description: 'Technology', count: 5 };

      service.getCategoryById(1).subscribe(category => {
        expect(category).toBeDefined();
        expect(category.id).toBe(1);
        expect(category.name).toBe('Tech');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/categories/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });

    it('should handle error when category not found', (done) => {
      service.getCategoryById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(request => request.url.includes('/categories/999'));
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createCategory', () => {
    it('should create a new category', (done) => {
      const newCategory = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description'
      };

      const mockResponse: Category = {
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description',
        count: 0
      };

      service.createCategory(newCategory).subscribe(createdCategory => {
        expect(createdCategory).toBeDefined();
        expect(createdCategory.id).toBe(1);
        expect(createdCategory.name).toBe('Test Category');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/categories') && request.method === 'POST');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('Test Category');
      req.flush(mockResponse);

      // Flush the reload request
      const reloadReq = httpMock.expectOne(request => request.url.includes('/categories') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });

    it('should trigger reload after creating category', (done) => {
      const newCategory = {
        name: 'Another Category',
        slug: 'another-category',
        description: 'Another description'
      };

      const mockResponse: Category = {
        id: 2,
        name: 'Another Category',
        slug: 'another-category',
        description: 'Another description',
        count: 0
      };

      service.createCategory(newCategory).subscribe(() => {
        done();
      });

      const createReq = httpMock.expectOne(request => request.url.includes('/categories') && request.method === 'POST');
      createReq.flush(mockResponse);

      // Verify reload is triggered
      const reloadReq = httpMock.expectOne(request => request.url.includes('/categories') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', (done) => {
      const updateData = {
        name: 'Updated Technology',
        description: 'Updated description',
        slug: 'updated-tech'
      };

      const mockResponse: Category = {
        id: 1,
        name: 'Updated Technology',
        slug: 'updated-tech',
        description: 'Updated description',
        count: 5
      };

      service.updateCategory(1, updateData).subscribe(result => {
        expect(result.name).toBe('Updated Technology');
        expect(result.description).toBe('Updated description');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/categories/1') && request.method === 'PATCH');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.name).toBe('Updated Technology');
      req.flush(mockResponse);

      // Flush the reload request
      const reloadReq = httpMock.expectOne(request => request.url.includes('/categories') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });

    it('should trigger reload after updating category', (done) => {
      const updateData = {
        slug: 'new-slug'
      };

      const mockResponse: Category = {
        id: 1,
        name: 'Tech',
        slug: 'new-slug',
        description: 'Technology',
        count: 5
      };

      service.updateCategory(1, updateData).subscribe(() => {
        done();
      });

      const updateReq = httpMock.expectOne(request => request.url.includes('/categories/1') && request.method === 'PATCH');
      updateReq.flush(mockResponse);

      // Verify reload is triggered
      const reloadReq = httpMock.expectOne(request => request.url.includes('/categories') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category by id', (done) => {
      let initialCount = 0;
      service.getCategories().subscribe(categories => {
        initialCount = categories.length;
      });

      service.deleteCategory(1).subscribe(() => {
        service.getCategories().subscribe(categories => {
          expect(categories.length).toBe(initialCount - 1);
          const deletedCategory = categories.find(c => c.id === 1);
          expect(deletedCategory).toBeUndefined();
          done();
        });
      });
    });

    it('should emit updated categories list after deletion', (done) => {
      service.deleteCategory(2).subscribe(() => {
        service.getCategories().subscribe(categories => {
          const category = categories.find(c => c.id === 2);
          expect(category).toBeUndefined();
          done();
        });
      });
    });

    it('should handle deleting non-existent category', (done) => {
      let initialCount = 0;
      service.getCategories().subscribe(categories => {
        initialCount = categories.length;
      });

      service.deleteCategory(999).subscribe(() => {
        service.getCategories().subscribe(categories => {
          expect(categories.length).toBe(initialCount);
          done();
        });
      });
    });
  });

  describe('categories$ observable', () => {
    it('should be defined', () => {
      expect(service.categories$).toBeDefined();
    });

    it('should emit current categories', (done) => {
      service.categories$.subscribe(categories => {
        expect(categories).toBeDefined();
        expect(Array.isArray(categories)).toBe(true);
        done();
      });
    });
  });
});

