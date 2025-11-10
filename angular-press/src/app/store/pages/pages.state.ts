import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { Page } from '../../models/page.model';
import { CreatePage, DeletePage, LoadPage, LoadPages, SetSelectedPage, UpdatePage } from './page.actions';

export interface PagesStateModel {
  entities: Page[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

@State<PagesStateModel>({
  name: 'pages',
  defaults: {
    entities: [],
    selectedId: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class PagesState {
  @Selector()
  static getPages(state: PagesStateModel): Page[] {
    return state.entities;
  }

  @Selector()
  static getSelectedPage(state: PagesStateModel): Page | undefined {
    return state.entities.find(page => page.id === state.selectedId);
  }

  @Selector()
  static getLoading(state: PagesStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: PagesStateModel): string | null {
    return state.error;
  }

  @Action(LoadPages)
  loadPages(ctx: StateContext<PagesStateModel>) {
    const state = ctx.getState();
    ctx.setState(
      patch({
        loading: true,
        error: null
      })
    );
    
    // TODO: Implement API call to load pages
    // This is a placeholder that will be replaced with actual API call
    setTimeout(() => {
      ctx.setState(
        patch({
          entities: [],
          loading: false
        })
      );
    }, 1000);
  }

  @Action(LoadPage)
  loadPage(ctx: StateContext<PagesStateModel>, action: LoadPage) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });
    
    // TODO: Implement API call to load single page
    // This is a placeholder that will be replaced with actual API call
  }

  @Action(CreatePage)
  createPage(ctx: StateContext<PagesStateModel>, action: CreatePage) {
    const state = ctx.getState();
    ctx.setState(
      patch({
        entities: append([{
          ...action.page,
          id: Date.now().toString(), // Temporary ID generation
          createdDate: new Date(),
          modifiedDate: new Date()
        } as Page])
      })
    );
  }

  @Action(UpdatePage)
  updatePage(ctx: StateContext<PagesStateModel>, action: UpdatePage) {
    const state = ctx.getState();
    ctx.setState(
      patch({
        entities: updateItem<Page>(
          page => page.id === action.id,
          patch({
            ...action.changes,
            modifiedDate: new Date()
          })
        )
      })
    );
  }

  @Action(DeletePage)
  deletePage(ctx: StateContext<PagesStateModel>, action: DeletePage) {
    const state = ctx.getState();
    ctx.setState(
      patch({
        entities: removeItem<Page>(page => page.id === action.id)
      })
    );
  }

  @Action(SetSelectedPage)
  setSelectedPage(ctx: StateContext<PagesStateModel>, action: SetSelectedPage) {
    const state = ctx.getState();
    ctx.patchState({
      selectedId: action.id
    });
  }
}