import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Tag } from '../models/tag.model';
import { getApiUrl } from '../core/utils/api-url.util';

interface TagsResponse {
  data: Tag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private tagsSubject = new BehaviorSubject<Tag[]>([]);
  public tags$ = this.tagsSubject.asObservable();
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = getApiUrl();
    this.loadTags();
  }

  private loadTags(page: number = 1, limit: number = 100): void {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    this.http.get<TagsResponse>(`${this.apiUrl}/tags`, { params })
      .subscribe(response => {
        this.tagsSubject.next(response.data);
      });
  }

  getTags(): Observable<Tag[]> {
    return this.tags$;
  }

  getTagById(id: number): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/tags/${id}`);
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/tags`, {
      name: tag.name,
      slug: tag.slug,
      description: tag.description
    }).pipe(
      tap(() => this.loadTags())
    );
  }

  updateTag(id: number, tag: Partial<Tag>): Observable<Tag> {
    return this.http.patch<Tag>(`${this.apiUrl}/tags/${id}`, {
      name: tag.name,
      slug: tag.slug,
      description: tag.description
    }).pipe(
      tap(() => this.loadTags())
    );
  }

  deleteTag(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/tags/${id}`).pipe(
      tap(() => this.loadTags())
    );
  }
}