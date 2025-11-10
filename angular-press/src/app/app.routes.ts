import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'posts', loadComponent: () => import('./components/posts/posts.component').then(m => m.PostsComponent) },
  { path: 'posts/new', loadComponent: () => import('./components/posts/post-form/post-form.component').then(m => m.PostFormComponent) },
  { path: 'posts/:id', loadComponent: () => import('./components/posts/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
  { path: 'users', loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent) },
  { path: 'categories', loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent) },
  { path: 'tags', loadComponent: () => import('./components/tags/tags.component').then(m => m.TagsComponent) },
  { path: '**', redirectTo: '/login' }
];
