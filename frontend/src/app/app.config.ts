import { ApplicationConfig, APP_INITIALIZER, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        // Convert the Observable to a Promise — APP_INITIALIZER requires a function
        // that returns a Promise (or void). Angular waits for it to resolve before
        // rendering anything, so the navbar already knows the user on first paint.
        return () => firstValueFrom(authService.initialize());
      },
      multi: true
    }
  ]
};
