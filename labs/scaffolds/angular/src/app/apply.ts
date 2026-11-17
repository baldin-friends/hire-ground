import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { jobs, workingModels } from './jobs';
import { Select } from './select';

@Component({
    selector: 'app-apply',
    imports: [RouterLink, Select],
    template: `
        @let job = this.job();
        @if (!job) {
            <h1>Position not found</h1>
        } @else if (sent()) {
            <h1>Thank you for applying</h1>
            <p>We will write to {{ email() }} about the {{ job.title }} position. Working model: {{ model() || 'not chosen' }}.</p>
            <a routerLink="/">Back to all positions</a>
        } @else {
            <h1>Apply: {{ job.title }}</h1>
            <form (submit)="submit($event)">
                <label for="email">Email</label>
                <input id="email" type="email" required [value]="email()" (input)="email.set($any($event.target).value)" />
                <app-select inputId="model" label="Working model" placeholder="Please choose" [options]="workingModels" [(value)]="model" />
                <button type="submit">Submit application</button>
            </form>
        }
    `,
})
export class Apply {
    // The router binds the :slug parameter to this input.
    readonly slug = input.required<string>();

    protected readonly workingModels = workingModels;
    protected readonly job = computed(() => jobs.find((j) => j.slug === this.slug()));
    protected readonly email = signal('');
    protected readonly model = signal('');
    protected readonly sent = signal(false);

    protected submit(event: Event) {
        event.preventDefault();
        this.sent.set(true);
    }
}
