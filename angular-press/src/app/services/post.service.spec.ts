import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { Post } from '../core/models/post.interface';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostService]
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);

    // Flush the initial loadPosts() call from constructor
    const initialReq = httpMock.expectOne(req => req.url.includes('/posts'));
    initialReq.flush({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPosts', () => {
    it('should return an observable of posts', (done) => {
      service.getPosts().subscribe(posts => {
        expect(posts).toBeDefined();
        expect(Array.isArray(posts)).toBe(true);
        done();
      });
    });

    it('should return posts with correct structure', (done) => {
      const mockPosts: Post[] = [{
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        status: 'published',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'test-post',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      }];

      // Trigger a reload
      service['loadPosts']();

      const req = httpMock.expectOne(request => request.url.includes('/posts'));
      req.flush({ data: mockPosts, total: 1, page: 1, limit: 100, totalPages: 1 });

      service.getPosts().subscribe(posts => {
        if (posts.length > 0) {
          const post = posts[0];
          expect(post.id).toBeDefined();
          expect(post.title).toBeDefined();
          expect(post.content).toBeDefined();
          expect(post.status).toBeDefined();
        }
        done();
      });
    });
  });

  describe('getPostById', () => {
    it('should make GET request to fetch post by id', (done) => {
      const mockPost: Post = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        status: 'published',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'test-post',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      service.getPostById('1').subscribe(post => {
        expect(post).toBeDefined();
        expect(post.id).toBe('1');
        expect(post.title).toBe('Test Post');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/posts/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });

    it('should handle error when post not found', (done) => {
      service.getPostById('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(request => request.url.includes('/posts/999'));
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createPost', () => {
    it('should create a new post', (done) => {
      const newPost: Post = {
        id: '0',
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        status: 'draft',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'test-post',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      const mockResponse: Post = {
        ...newPost,
        id: '1'
      };

      service.createPost(newPost).subscribe(createdPost => {
        expect(createdPost).toBeDefined();
        expect(createdPost.id).toBe('1');
        expect(createdPost.title).toBe('Test Post');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/posts') && request.method === 'POST');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe('Test Post');
      req.flush(mockResponse);

      // Flush the reload request
      const reloadReq = httpMock.expectOne(request => request.url.includes('/posts') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });

    it('should trigger reload after creating post', (done) => {
      const newPost: Post = {
        id: '0',
        title: 'Another Test Post',
        content: 'Another test content',
        excerpt: 'Another test excerpt',
        status: 'published',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'another-test-post',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      const mockResponse: Post = {
        ...newPost,
        id: '2'
      };

      service.createPost(newPost).subscribe(() => {
        done();
      });

      const createReq = httpMock.expectOne(request => request.url.includes('/posts') && request.method === 'POST');
      createReq.flush(mockResponse);

      // Verify reload is triggered
      const reloadReq = httpMock.expectOne(request => request.url.includes('/posts') && request.method === 'GET');
      reloadReq.flush({ data: [mockResponse], total: 1, page: 1, limit: 100, totalPages: 1 });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', (done) => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const mockResponse: Post = {
        id: '1',
        title: 'Updated Title',
        content: 'Updated content',
        excerpt: 'Test excerpt',
        status: 'published',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'test-post',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      service.createPost(post1).subscribe(created1 => {
        service.createPost(post2).subscribe(created2 => {
          expect(created1.id).not.toBe(created2.id);
          expect(Number(created2.id)).toBeGreaterThan(Number(created1.id));
          done();
        });
      });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', (done) => {
      const existingPost = service.getPostById('1');
      expect(existingPost).toBeDefined();

      const updatedPost: Post = {
        ...existingPost!,
        title: 'Updated Title',
        content: 'Updated content'
      };

      service.updatePost(updatedPost).subscribe(result => {
        expect(result.title).toBe('Updated Title');
        expect(result.content).toBe('Updated content');

        const retrievedPost = service.getPostById('1');
        expect(retrievedPost?.title).toBe('Updated Title');
        done();
      });
    });

    it('should emit updated posts list', (done) => {
      const existingPost = service.getPostById('1');
      const updatedPost: Post = {
        ...existingPost!,
        title: 'New Title'
      };

      service.updatePost(updatedPost).subscribe(() => {
        service.getPosts().subscribe(posts => {
          const post = posts.find(p => p.id === '1');
          expect(post?.title).toBe('New Title');
          done();
        });
      });
    });

    it('should handle updating non-existent post', (done) => {
      const nonExistentPost: Post = {
        id: '999',
        title: 'Non-existent',
        content: 'Content',
        excerpt: 'Excerpt',
        status: 'draft',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'non-existent',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      service.updatePost(nonExistentPost).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe('999');
        done();
      });
    });
  });

  describe('deletePost', () => {
    it('should delete a post by id', (done) => {
      let initialCount = 0;
      service.getPosts().subscribe(posts => {
        initialCount = posts.length;
      });

      service.deletePost('1').subscribe(() => {
        service.getPosts().subscribe(posts => {
          expect(posts.length).toBe(initialCount - 1);
          const deletedPost = posts.find(p => p.id === '1');
          expect(deletedPost).toBeUndefined();
          done();
        });
      });
    });

    it('should emit updated posts list after deletion', (done) => {
      service.deletePost('2').subscribe(() => {
        service.getPosts().subscribe(posts => {
          const post = posts.find(p => p.id === '2');
          expect(post).toBeUndefined();
          done();
        });
      });
    });

    it('should handle deleting non-existent post', (done) => {
      let initialCount = 0;
      service.getPosts().subscribe(posts => {
        initialCount = posts.length;
      });

      service.deletePost('999').subscribe(() => {
        service.getPosts().subscribe(posts => {
          expect(posts.length).toBe(initialCount);
          done();
        });
      });
    });
  });

  describe('posts$ observable', () => {
    it('should be defined', () => {
      expect(service.posts$).toBeDefined();
    });

    it('should emit current posts', (done) => {
      service.posts$.subscribe(posts => {
        expect(posts).toBeDefined();
        expect(Array.isArray(posts)).toBe(true);
        done();
      });
    });
  });
});

