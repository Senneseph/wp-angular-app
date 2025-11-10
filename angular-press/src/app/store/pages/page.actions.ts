import { Page } from '../../models/page.model';

export class LoadPages {
  static readonly type = '[Pages] Load Pages';
}

export class LoadPage {
  static readonly type = '[Pages] Load Page';
  constructor(public id: string) {}
}

export class CreatePage {
  static readonly type = '[Pages] Create Page';
  constructor(public page: Partial<Page>) {}
}

export class UpdatePage {
  static readonly type = '[Pages] Update Page';
  constructor(public id: string, public changes: Partial<Page>) {}
}

export class DeletePage {
  static readonly type = '[Pages] Delete Page';
  constructor(public id: string) {}
}

export class SetSelectedPage {
  static readonly type = '[Pages] Set Selected Page';
  constructor(public id: string) {}
}