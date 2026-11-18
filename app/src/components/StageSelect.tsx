import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { STAGES, type Stage } from '../api';
import { Icon } from './Icon';

type Props = {
    value: Stage | '';
    onChange: (value: Stage | '') => void;
    /** Adds "All stages" as the first option (for the filter). */
    allowAll?: boolean;
    qa?: string;
};

/** The place where panels, dialogs and toasts are rendered: the end of <body>, outside of the page content. */
export function overlayRoot() {
    let el = document.getElementById('overlays');
    if (!el) {
        el = document.createElement('div');
        el.id = 'overlays';
        document.body.appendChild(el);
    }
    return el;
}

// The dropdown of the Hire Ground component library. It is built from <div>s:
// no <select>, no ARIA role, no label. The panel with the options is rendered in
// the overlay container at the end of <body>, not inside the component.
export function StageSelect({ value, onChange, allowAll = false, qa }: Props) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const trigger = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const options: { id: Stage | ''; label: string }[] = [...(allowAll ? [{ id: '' as const, label: 'All stages' }] : []), ...STAGES];
    const current = options.find((o) => o.id === value) ?? options[0];

    useLayoutEffect(() => {
        if (!open || !trigger.current) return;
        const r = trigger.current.getBoundingClientRect();
        setPosition({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!trigger.current?.contains(target) && !panel.current?.contains(target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    return (
        <div className="hg-select" data-qa={qa}>
            <div
                ref={trigger}
                className={`hg-select__trigger${open ? ' is-open' : ''}`}
                tabIndex={0}
                onClick={() => setOpen((o) => !o)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpen((o) => !o);
                    }
                    if (e.key === 'Escape') setOpen(false);
                }}
            >
                <span className="hg-select__value">{current.label}</span>
                <Icon name="chevron" />
            </div>
            {open &&
                createPortal(
                    <div ref={panel} className="hg-select__panel" style={{ top: position.top, left: position.left, minWidth: position.width }}>
                        {options.map((o) => (
                            <div
                                key={o.id}
                                className={`hg-select__option${o.id === value ? ' is-selected' : ''}`}
                                onClick={() => {
                                    setOpen(false);
                                    if (o.id !== value) onChange(o.id);
                                }}
                            >
                                {o.label}
                            </div>
                        ))}
                    </div>,
                    overlayRoot(),
                )}
        </div>
    );
}
