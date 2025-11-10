import { InjectionToken } from '@angular/core';
import { Type } from '@angular/core';

export interface PluginConfig {
  name: string;
  version: string;
  author: string;
  description: string;
  components?: Type<any>[];
  routes?: any[];
  services?: Type<any>[];
  hooks?: {
    [key: string]: Function[];
  };
  settings?: {
    [key: string]: any;
  };
  dependencies?: string[];
}

export const PLUGIN_CONFIG = new InjectionToken<PluginConfig>('PLUGIN_CONFIG');

export interface PluginHook {
  name: string;
  callback: Function;
  priority?: number;
}

export interface PluginMetadata {
  config: PluginConfig;
  enabled: boolean;
  loaded: boolean;
  error?: string;
}