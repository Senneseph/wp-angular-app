import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Post } from '../core/models/post.interface';
import { environment } from '../../environments/environment';

interface PostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  slug?: string;
}

interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  slug?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load initial posts
    this.loadPosts();
  }

  private loadPosts(page: number = 1, limit: number = 100): void {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    this.http.get<PostsResponse>(`${environment.apiUrl}/posts`, { params })
      .subscribe(response => {
        this.postsSubject.next(response.data);
      });
  }

  getPosts(): Observable<Post[]> {
    return this.posts$;
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${environment.apiUrl}/posts/${id}`);
  }

  createPost(post: Post): Observable<Post> {
    const createDto: CreatePostDto = {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      slug: post.slug
    };

    return this.http.post<Post>(`${environment.apiUrl}/posts`, createDto)
      .pipe(
        tap(newPost => {
          // Add to local cache
          const currentPosts = this.postsSubject.value;
          this.postsSubject.next([newPost, ...currentPosts]);
        })
      );
  }

  updatePost(post: Post): Observable<Post> {
    const updateDto: UpdatePostDto = {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      slug: post.slug
    };

    return this.http.patch<Post>(`${environment.apiUrl}/posts/${post.id}`, updateDto)
      .pipe(
        tap(updatedPost => {
          // Update local cache
          const currentPosts = this.postsSubject.value;
          const index = currentPosts.findIndex(p => p.id === post.id);
          if (index !== -1) {
            currentPosts[index] = updatedPost;
            this.postsSubject.next([...currentPosts]);
          }
        })
      );
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${id}`)
      .pipe(
        tap(() => {
          // Remove from local cache
          const currentPosts = this.postsSubject.value;
          this.postsSubject.next(currentPosts.filter(p => p.id !== id));
        })
      );
  }

  refreshPosts(): void {
    this.loadPosts();
  }
}