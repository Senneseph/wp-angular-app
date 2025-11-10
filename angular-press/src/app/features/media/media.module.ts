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
    loadChildren: () => import('./media-list/media-list.module').then(m => m.MediaListModule)
  },
  {
    path: 'upload',
    loadChildren: () => import('./media-upload/media-upload.module').then(m => m.MediaUploadModule)
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
export class MediaModule { }