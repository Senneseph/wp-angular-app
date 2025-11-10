import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { MediaItem } from '../../models/media.model';
import { LoadMedia, LoadMediaItem, UploadMedia, UpdateMedia, DeleteMedia } from './media.actions';

export interface MediaStateModel {
  entities: MediaItem[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

@State<MediaStateModel>({
  name: 'media',
  defaults: {
    entities: [],
    selectedId: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class MediaState {
  @Selector()
  static getMedia(state: MediaStateModel): MediaItem[] {
    return state.entities;
  }

  @Selector()
  static getSelectedMedia(state: MediaStateModel): MediaItem | undefined {
    return state.entities.find(item => item.id === state.selectedId);
  }

  @Selector()
  static getLoading(state: MediaStateModel): boolean {
    return state.loading;
  }

  @Action(LoadMedia)
  loadMedia(ctx: StateContext<MediaStateModel>) {
    const state = ctx.getState();
    ctx.setState(
      patch({
        loading: true,
        error: null
      })
    );
    
    // TODO: Implement API call to load media
    setTimeout(() => {
      ctx.setState(
        patch({
          entities: [],
          loading: false
        })
      );
    }, 1000);
  }

  @Action(LoadMediaItem)
  loadMediaItem(ctx: StateContext<MediaStateModel>, action: LoadMediaItem) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });
    
    // TODO: Implement API call to load single media item
  }

  @Action(UploadMedia)
  uploadMedia(ctx: StateContext<MediaStateModel>, action: UploadMedia) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });
    
    // TODO: Implement file upload logic
    // This is a placeholder that will be replaced with actual API call
  }

  @Action(UpdateMedia)
  updateMedia(ctx: StateContext<MediaStateModel>, action: UpdateMedia) {
    const state = ctx.getState();
    ctx.setState(
      patch({
        entities: updateItem<MediaItem>(
          item => item.id === action.id,
          patch({
            ...action.changes,
            modifiedDate: new Date()
          })
        )
      })
    );
  }

  @Action(DeleteMedia)
  deleteMedia(ctx: StateContext<MediaStateModel>, action: DeleteMedia) {
    const state = ctx.getState();
    ctx.setState(
      patch({
        entities: removeItem<MediaItem>(item => item.id === action.id)
      })
    );
  }
}