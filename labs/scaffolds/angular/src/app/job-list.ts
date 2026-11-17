import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { jobs } from './jobs';

@Component({
    selector: 'app-job-list',
    imports: [RouterLink],
    template: `
        <h1>Open positions</h1>
        <ul class="jobs" role="list">
            @for (job of jobs; track job.slug) {
                <li>
                    <h2>{{ job.title }}</h2>
                    <p>{{ job.location }}</p>
                    <a [routerLink]="['/apply', job.slug]">Apply</a>
                </li>
            }
        </ul>
    `,
})
export class JobList {
    protected readonly jobs = jobs;
}
