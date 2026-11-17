import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, ElementRef, input, model, signal, viewChild } from '@angular/core';

// A custom dropdown. The listbox is not a child of the form: the CDK overlay
// renders it in .cdk-overlay-container at the end of <body>, the way Angular
// Material does.
@Component({
    selector: 'app-select',
    imports: [CdkConnectedOverlay, CdkOverlayOrigin],
    host: { style: 'display: contents' },
    template: `
        <label [id]="inputId() + '-label'" [for]="inputId()">{{ label() }}</label>
        <button
            #button
            #origin="cdkOverlayOrigin"
            cdkOverlayOrigin
            [id]="inputId()"
            type="button"
            class="select"
            role="combobox"
            aria-haspopup="listbox"
            [attr.aria-expanded]="open()"
            [attr.aria-controls]="inputId() + '-listbox'"
            [attr.aria-labelledby]="inputId() + '-label'"
            [attr.aria-activedescendant]="open() ? inputId() + '-option-' + active() : null"
            (click)="open() ? open.set(false) : show()"
            (keydown)="onKeyDown($event)"
        >
            {{ value() || placeholder() }}
        </button>
        <ng-template
            cdkConnectedOverlay
            [cdkConnectedOverlayOrigin]="origin"
            [cdkConnectedOverlayOpen]="open()"
            [cdkConnectedOverlayOffsetY]="4"
            [cdkConnectedOverlayMatchWidth]="true"
            (overlayOutsideClick)="open.set(false)"
            (detach)="open.set(false)"
        >
            <ul [id]="inputId() + '-listbox'" class="listbox" role="listbox" [attr.aria-labelledby]="inputId() + '-label'">
                @for (option of options(); track option; let index = $index) {
                    <li
                        [id]="inputId() + '-option-' + index"
                        [class.active]="index === active()"
                        role="option"
                        [attr.aria-selected]="option === value()"
                        (click)="choose(option)"
                    >
                        {{ option }}
                    </li>
                }
            </ul>
        </ng-template>
    `,
})
export class Select {
    readonly inputId = input.required<string>();
    readonly label = input.required<string>();
    readonly placeholder = input.required<string>();
    readonly options = input.required<string[]>();
    readonly value = model.required<string>();

    protected readonly open = signal(false);
    protected readonly active = signal(0);
    private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');

    protected show() {
        this.active.set(Math.max(this.options().indexOf(this.value()), 0));
        this.open.set(true);
        // Safari does not focus a button on click, and the keys are handled on the button.
        this.button().nativeElement.focus();
    }

    protected choose(option: string) {
        this.value.set(option);
        this.open.set(false);
        this.button().nativeElement.focus();
    }

    protected onKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!this.open()) {
                this.show();
            } else {
                const step = event.key === 'ArrowDown' ? 1 : -1;
                this.active.set(Math.min(Math.max(this.active() + step, 0), this.options().length - 1));
            }
        } else if (event.key === 'Enter' && this.open()) {
            event.preventDefault();
            this.choose(this.options()[this.active()]);
        } else if (event.key === 'Escape') {
            this.open.set(false);
        }
    }
}
