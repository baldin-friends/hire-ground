// Icons come from one SVG sprite, the way most design systems ship them:
// <svg class="icon"><use href="#icon-star" /></svg>

const PATHS: Record<string, string> = {
    star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z',
    download: 'M12 4v10m0 0l-4-4m4 4l4-4M5 19h14',
    reject: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6m0-6l-6 6',
    trash: 'M5 7h14M10 7V4h4v3m-7 0l1 13h8l1-13M10 11v6m4-6v6',
    close: 'M6 6l12 12M18 6L6 18',
    chevron: 'M6 9l6 6 6-6',
};

export type IconName = 'star' | 'download' | 'reject' | 'trash' | 'close' | 'chevron';

/** Rendered once, at the end of the page. */
export function IconSprite() {
    return (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            {Object.entries(PATHS).map(([name, d]) => (
                <symbol key={name} id={`icon-${name}`} viewBox="0 0 24 24">
                    <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </symbol>
            ))}
        </svg>
    );
}

export function Icon({ name }: { name: IconName }) {
    return (
        <svg className="icon" width="20" height="20" aria-hidden="true" focusable="false">
            <use href={`#icon-${name}`} />
        </svg>
    );
}
