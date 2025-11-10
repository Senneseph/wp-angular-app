import { MediaItem } from '../../models/media.model';

export class LoadMedia {
  static readonly type = '[Media] Load Media';
}

export class LoadMediaItem {
  static readonly type = '[Media] Load Media Item';
  constructor(public id: string) {}
}

export class UploadMedia {
  static readonly type = '[Media] Upload Media';
  constructor(public files: File[]) {}
}

export class UpdateMedia {
  static readonly type = '[Media] Update Media';
  constructor(public id: string, public changes: Partial<MediaItem>) {}
}

export class DeleteMedia {
  static readonly type = '[Media] Delete Media';
  constructor(public id: string) {}
}