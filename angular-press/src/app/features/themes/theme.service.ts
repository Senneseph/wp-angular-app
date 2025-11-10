import { Injectable, Inject } from '@angular/core';
import { THEME_CONFIG, ThemeConfig, DEFAULT_THEME_CONFIG } from './theme.config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private activeTheme = new BehaviorSubject<ThemeConfig>(this.config);
  private loadedStyles: HTMLLinkElement[] = [];
  private loadedScripts: HTMLScriptElement[] = [];

  constructor(@Inject(THEME_CONFIG) private config: ThemeConfig = DEFAULT_THEME_CONFIG) {}

  getActiveTheme(): Observable<ThemeConfig> {
    return this.activeTheme.asObservable();
  }

  async activateTheme(theme: ThemeConfig): Promise<void> {
    // Remove current theme resources
    this.removeCurrentThemeResources();

    // Load new theme resources
    await this.loadThemeResources(theme);

    // Update active theme
    this.activeTheme.next(theme);
  }

  private removeCurrentThemeResources(): void {
    // Remove styles
    this.loadedStyles.forEach(style => {
      document.head.removeChild(style);
    });
    this.loadedStyles = [];

    // Remove scripts
    this.loadedScripts.forEach(script => {
      document.body.removeChild(script);
    });
    this.loadedScripts = [];
  }

  private async loadThemeResources(theme: ThemeConfig): Promise<void> {
    // Load styles
    const stylePromises = theme.styles.map(styleUrl => this.loadStyle(styleUrl));
    await Promise.all(stylePromises);

    // Load scripts
    const scriptPromises = theme.scripts.map(scriptUrl => this.loadScript(scriptUrl));
    await Promise.all(scriptPromises);
  }

  private loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => {
        this.loadedStyles.push(link);
        resolve();
      };
      link.onerror = () => reject(new Error(`Failed to load style: ${url}`));
      document.head.appendChild(link);
    });
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        this.loadedScripts.push(script);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.body.appendChild(script);
    });
  }
}