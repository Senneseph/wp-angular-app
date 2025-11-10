import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Page } from '../../../models/page.model';
import { PagesState } from '../../../store/pages/pages.state';
import { DeletePage, LoadPages } from '../../../store/pages/page.actions';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.scss']
})
export class PageListComponent implements OnInit {
  @Select(PagesState.getPages) pages$: Observable<Page[]>;
  @Select(PagesState.getLoading) loading$: Observable<boolean>;
  
  displayedColumns: string[] = ['title', 'status', 'author', 'modifiedDate', 'actions'];

  constructor(
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.store.dispatch(new LoadPages());
  }

  onCreatePage(): void {
    this.router.navigate(['/pages/new']);
  }

  onEditPage(pageId: string): void {
    this.router.navigate(['/pages/edit', pageId]);
  }

  onDeletePage(pageId: string): void {
    if (confirm('Are you sure you want to delete this page?')) {
      this.store.dispatch(new DeletePage(pageId));
    }
  }
}