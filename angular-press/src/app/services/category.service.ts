import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Category } from '../models/category.model';
import { getApiUrl } from '../core/utils/api-url.util';

interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = getApiUrl();
    this.loadCategories();
  }

  private loadCategories(page: number = 1, limit: number = 100): void {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    this.http.get<CategoriesResponse>(`${this.apiUrl}/categories`, { params })
      .subscribe(response => {
        this.categoriesSubject.next(response.data);
      });
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId || 0
    }).pipe(
      tap(() => this.loadCategories())
    );
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}`, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId
    }).pipe(
      tap(() => this.loadCategories())
    );
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/categories/${id}`).pipe(
      tap(() => this.loadCategories())
    );
  }
}