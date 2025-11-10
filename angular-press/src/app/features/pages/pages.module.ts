import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./page-list/page-list.module').then(m => m.PageListModule)
  },
  {
    path: 'new',
    loadChildren: () => import('./page-form/page-form.module').then(m => m.PageFormModule)
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./page-form/page-form.module').then(m => m.PageFormModule)
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    SharedModule
  ]
})
export class PagesModule { }