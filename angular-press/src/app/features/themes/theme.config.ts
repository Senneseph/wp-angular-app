import { InjectionToken } from '@angular/core';

export interface ThemeConfig {
  name: string;
  author: string;
  version: string;
  description: string;
  templates: {
    [key: string]: {
      component: any;
      meta: {
        name: string;
        description: string;
      };
    };
  };
  styles: string[];
  scripts: string[];
  settings?: {
    [key: string]: any;
  };
}

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Default Theme',
  author: 'Angular Press',
  version: '1.0.0',
  description: 'Default theme for Angular Press',
  templates: {},
  styles: [],
  scripts: [],
  settings: {}
};