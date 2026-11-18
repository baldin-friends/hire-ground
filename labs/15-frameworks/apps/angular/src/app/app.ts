import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, type Routes } from '@angular/router';
import { Apply } from './apply';
import { JobList } from './job-list';

@Component({
    template: `<h1>Page not found</h1>`,
})
class NotFound {}

export const routes: Routes = [
    { path: '', component: JobList },
    { path: 'apply/:slug', component: Apply },
    { path: '**', component: NotFound },
];

@Component({
    selector: 'app-root',
    imports: [RouterLink, RouterOutlet],
    template: `
        <header class="banner">
            <a routerLink="/">Hire Ground careers</a>
        </header>
        <main>
            <router-outlet />
        </main>
        <footer>Built with Angular</footer>
    `,
})
export class App {}
