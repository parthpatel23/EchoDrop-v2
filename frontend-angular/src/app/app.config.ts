// AngularApp\echodrop\frontend-angular\src\app\app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideServerRendering } from '@angular/platform-server';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideServerRendering(), // ✅ SSR mode
    provideHttpClient(
      withInterceptors([AuthInterceptor]),
      withFetch()
    )
  ]
};
