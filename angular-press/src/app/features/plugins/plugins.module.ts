import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginService } from './plugin.service';
import { PLUGIN_CONFIG } from './plugin.config';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    PluginService,
    {
      provide: PLUGIN_CONFIG,
      useValue: {
        name: 'Core Plugin',
        version: '1.0.0',
        author: 'Angular Press',
        description: 'Core functionality plugin',
        hooks: {}
      }
    }
  ]
})
export class PluginsModule { }