import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TagService } from './tag.service';
import { Tag } from '../models/tag.model';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TagService]
    });
    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);

    // Flush the initial loadTags() call from constructor
    const initialReq = httpMock.expectOne(req => req.url.includes('/tags'));
    initialReq.flush({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTags', () => {
    it('should return an observable of tags', (done) => {
      service.getTags().subscribe(tags => {
        expect(tags).toBeDefined();
        expect(Array.isArray(tags)).toBe(true);
        done();
      });
    });

    it('should return tags with correct structure', (done) => {
      const mockTags: Tag[] = [
        { id: 1, name: 'angular', slug: 'angular', description: 'Angular framework', count: 5 }
      ];

      // Trigger a reload
      service['loadTags']();

      const req = httpMock.expectOne(request => request.url.includes('/tags'));
      req.flush({ data: mockTags, total: 1, page: 1, limit: 100, totalPages: 1 });

      service.getTags().subscribe(tags => {
        if (tags.length > 0) {
          const tag = tags[0];
          expect(tag.id).toBeDefined();
          expect(tag.name).toBeDefined();
          expect(tag.slug).toBeDefined();
        }
        done();
      });
    });
  });

  describe('getTagById', () => {
    it('should make GET request to fetch tag by id', (done) => {
      const mockTag: Tag = { id: 1, name: 'angular', slug: 'angular', description: 'Angular framework', count: 5 };

      service.getTagById(1).subscribe(tag => {
        expect(tag).toBeDefined();
        expect(tag.id).toBe(1);
        expect(tag.name).toBe('angular');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/tags/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockTag);
    });

    it('should handle error when tag not found', (done) => {
      service.getTagById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(request => request.url.includes('/tags/999'));
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createTag', () => {
    it('should create a new tag', (done) => {
      const newTag = {
        name: 'test',
        slug: 'test',
        description: 'Test tag'
      };

      const mockResponse: Tag = {
        id: 1,
        name: 'test',
        slug: 'test',
        description: 'Test tag',
        count: 0
      };

      service.createTag(newTag).subscribe(createdTag => {
        expect(createdTag).toBeDefined();
        expect(createdTag.id).toBe(1);
        expect(createdTag.name).toBe('test');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'POST');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('test');
      req.flush(mockResponse);

      // Flush the reload request
      const reloadReq = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });

    it('should trigger reload after creating tag', (done) => {
      const newTag = {
        name: 'another',
        slug: 'another',
        description: 'Another tag'
      };

      const mockResponse: Tag = {
        id: 2,
        name: 'another',
        slug: 'another',
        description: 'Another tag',
        count: 0
      };

      service.createTag(newTag).subscribe(() => {
        done();
      });

      const createReq = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'POST');
      createReq.flush(mockResponse);

      // Verify reload is triggered
      const reloadReq = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', (done) => {
      const updateData = {
        name: 'updated-angular',
        description: 'Updated description',
        slug: 'updated-angular'
      };

      const mockResponse: Tag = {
        id: 1,
        name: 'updated-angular',
        slug: 'updated-angular',
        description: 'Updated description',
        count: 5
      };

      service.updateTag(1, updateData).subscribe(result => {
        expect(result.name).toBe('updated-angular');
        expect(result.description).toBe('Updated description');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/tags/1') && request.method === 'PATCH');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.name).toBe('updated-angular');
      req.flush(mockResponse);

      // Flush the reload request
      const reloadReq = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });

    it('should trigger reload after updating tag', (done) => {
      const updateData = {
        slug: 'new-slug'
      };

      const mockResponse: Tag = {
        id: 1,
        name: 'angular',
        slug: 'new-slug',
        description: 'Angular framework',
        count: 5
      };

      service.updateTag(1, updateData).subscribe(() => {
        done();
      });

      const updateReq = httpMock.expectOne(request => request.url.includes('/tags/1') && request.method === 'PATCH');
      updateReq.flush(mockResponse);

      // Verify reload is triggered
      const reloadReq = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag by id', (done) => {
      const mockResponse = { message: 'Tag deleted successfully' };

      service.deleteTag(1).subscribe(response => {
        expect(response).toBeDefined();
        expect(response.message).toBe('Tag deleted successfully');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/tags/1') && request.method === 'DELETE');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      // Flush the reload request
      const reloadReq = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'GET');
      reloadReq.flush({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
    });

    it('should trigger reload after deletion', (done) => {
      const mockResponse = { message: 'Tag deleted successfully' };

      service.deleteTag(2).subscribe(() => {
        done();
      });

      const deleteReq = httpMock.expectOne(request => request.url.includes('/tags/2') && request.method === 'DELETE');
      deleteReq.flush(mockResponse);

      // Verify reload is triggered
      const reloadReq = httpMock.expectOne(request => request.url.includes('/tags') && request.method === 'GET');
      reloadReq.flush({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
    });
  });

  describe('tags$ observable', () => {
    it('should be defined', () => {
      expect(service.tags$).toBeDefined();
    });

    it('should emit current tags', (done) => {
      service.tags$.subscribe(tags => {
        expect(tags).toBeDefined();
        expect(Array.isArray(tags)).toBe(true);
        done();
      });
    });
  });
});

