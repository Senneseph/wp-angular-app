export interface MediaItem {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  alt?: string;
  caption?: string;
  meta: {
    [key: string]: any;
  };
  uploadedBy: string;
  uploadedDate: Date;
  modifiedDate: Date;
}