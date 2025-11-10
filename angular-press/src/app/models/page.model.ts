export interface Page {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'private';
  author: string;
  parentId?: string;
  order: number;
  template: string;
  featuredImage?: string;
  meta: {
    [key: string]: any;
  };
  createdDate: Date;
  modifiedDate: Date;
}