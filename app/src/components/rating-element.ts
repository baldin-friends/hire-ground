// <hg-rating>: a web component with a shadow root, the way a component library ships a widget
// that works in React, Angular and Vue alike.
//
//   const el = document.createElement('hg-rating');
//   el.value = 4;                                  // a property, not an attribute
//   el.addEventListener('change', (e) => e.detail.value);
//
// Inside the shadow root: a radiogroup "Rating" with five radios, "1 star" to "5 stars".
// Clicking the checked star again clears the rating.

const STYLE = `
:host { display: inline-block; }
div { display: inline-flex; gap: 2px; }
button { all: unset; cursor: pointer; font-size: 20px; line-height: 1; color: #c5c9da; padding: 2px; border-radius: 4px; }
button.on { color: #e0a100; }
button:focus-visible { outline: 2px solid #f0b400; }
:host([readonly]) button { cursor: default; }
`;

export class HgRating extends HTMLElement {
    #value = 0;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.#render();
    }

    get value() {
        return this.#value;
    }

    set value(v: number) {
        this.#value = Math.min(Math.max(Math.round(Number(v) || 0), 0), 5);
        this.#render();
    }

    #render() {
        const root = this.shadowRoot!;
        root.innerHTML =
            `<style>${STYLE}</style><div role="radiogroup" aria-label="Rating">` +
            [1, 2, 3, 4, 5]
                .map(
                    (n) =>
                        `<button type="button" role="radio" data-value="${n}" aria-checked="${n === this.#value}" ` +
                        `aria-label="${n} star${n === 1 ? '' : 's'}" class="${n <= this.#value ? 'on' : ''}">★</button>`,
                )
                .join('') +
            '</div>';
        root.querySelectorAll('button').forEach((button) =>
            button.addEventListener('click', () => {
                if (this.hasAttribute('readonly')) return;
                const n = Number(button.dataset.value);
                this.value = n === this.#value ? 0 : n;
                this.dispatchEvent(new CustomEvent('change', { detail: { value: this.#value }, bubbles: true }));
            }),
        );
    }
}

if (!customElements.get('hg-rating')) customElements.define('hg-rating', HgRating);
