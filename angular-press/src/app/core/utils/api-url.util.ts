import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Get the correct API URL based on whether we're running in the browser or on the server (SSR).
 * In the browser, use localhost. On the server, use the Docker service name.
 */
export function getApiUrl(): string {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  
  return isBrowser ? environment.apiUrl : environment.ssrApiUrl;
}

