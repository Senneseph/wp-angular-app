import { Injectable, Injector, Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PluginConfig, PluginHook, PluginMetadata } from './plugin.config';

@Injectable({
  providedIn: 'root'
})
export class PluginService {
  private plugins = new Map<string, PluginMetadata>();
  private hooks = new Map<string, PluginHook[]>();
  private pluginsSubject = new BehaviorSubject<Map<string, PluginMetadata>>(this.plugins);

  constructor(private injector: Injector) {}

  getPlugins(): Observable<Map<string, PluginMetadata>> {
    return this.pluginsSubject.asObservable();
  }

  async registerPlugin(config: PluginConfig): Promise<void> {
    if (this.plugins.has(config.name)) {
      throw new Error(`Plugin ${config.name} is already registered`);
    }

    // Check dependencies
    if (config.dependencies) {
      const missingDeps = this.checkDependencies(config.dependencies);
      if (missingDeps.length > 0) {
        throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
      }
    }

    try {
      // Register components
      if (config.components) {
        await this.registerComponents(config.components);
      }

      // Register services
      if (config.services) {
        this.registerServices(config.services);
      }

      // Register hooks
      if (config.hooks) {
        this.registerHooks(config.name, config.hooks);
      }

      // Store plugin metadata
      const metadata: PluginMetadata = {
        config,
        enabled: true,
        loaded: true
      };

      this.plugins.set(config.name, metadata);
      this.pluginsSubject.next(this.plugins);
    } catch (error) {
      const metadata: PluginMetadata = {
        config,
        enabled: false,
        loaded: false,
        error: error.message
      };
      this.plugins.set(config.name, metadata);
      throw error;
    }
  }

  async unregisterPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} is not registered`);
    }

    // Remove hooks
    if (plugin.config.hooks) {
      Object.keys(plugin.config.hooks).forEach(hookName => {
        const hooks = this.hooks.get(hookName) || [];
        this.hooks.set(
          hookName,
          hooks.filter(hook => !plugin.config.hooks[hookName].includes(hook.callback))
        );
      });
    }

    this.plugins.delete(name);
    this.pluginsSubject.next(this.plugins);
  }

  executeHook(name: string, ...args: any[]): any[] {
    const hooks = this.hooks.get(name) || [];
    return hooks
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .map(hook => hook.callback(...args));
  }

  private checkDependencies(dependencies: string[]): string[] {
    return dependencies.filter(dep => !this.plugins.has(dep));
  }

  private async registerComponents(components: Type<any>[]): Promise<void> {
    // Here you would register components with Angular's dynamic component loader
    // This is a placeholder for the actual implementation
  }

  private registerServices(services: Type<any>[]): void {
    services.forEach(service => {
      this.injector.get(service);
    });
  }

  private registerHooks(pluginName: string, hookConfig: { [key: string]: Function[] }): void {
    Object.entries(hookConfig).forEach(([hookName, callbacks]) => {
      const hooks = this.hooks.get(hookName) || [];
      const newHooks = callbacks.map(callback => ({
        name: pluginName,
        callback,
        priority: 10
      }));
      this.hooks.set(hookName, [...hooks, ...newHooks]);
    });
  }
}