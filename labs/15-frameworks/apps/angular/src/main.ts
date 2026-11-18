import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { App, routes } from './app/app';

bootstrapApplication(App, {
    providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes, withComponentInputBinding())],
}).catch((err) => console.error(err));
