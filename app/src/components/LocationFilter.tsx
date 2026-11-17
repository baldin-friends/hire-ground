import { useEffect, useRef, useState } from 'react';
import { useBug } from '../bugs';

export const LOCATIONS = ['Berlin', 'Dresden', 'Hamburg', 'München'];

type Props = { value: string; onChange: (value: string) => void };

// Default: a native <select>. custom-select: an ARIA combobox that looks the
// same and is not a <select>, so selectOption() has nothing to work with.
export function LocationFilter({ value, onChange }: Props) {
    const custom = useBug('custom-select');
    if (!custom) {
        return (
            <div className="field inline">
                <label htmlFor="location">Location</label>
                <select id="location" value={value} onChange={(e) => onChange(e.target.value)}>
                    <option value="">All locations</option>
                    {LOCATIONS.map((l) => (
                        <option key={l} value={l}>
                            {l}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
    return <Combobox value={value} onChange={onChange} />;
}

function Combobox({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options = [{ value: '', label: 'All locations' }, ...LOCATIONS.map((l) => ({ value: l, label: l }))];
    const current = options.find((o) => o.value === value) ?? options[0];

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    const pick = (v: string) => {
        onChange(v);
        setOpen(false);
    };

    return (
        <div className="field inline combobox" ref={ref}>
            <span className="label" id="location-label">
                Location
            </span>
            <button
                type="button"
                role="combobox"
                aria-labelledby="location-label"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls="location-listbox"
                className="select-like"
                onClick={() => setOpen((o) => !o)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                    if (e.key === 'ArrowDown') setOpen(true);
                }}
            >
                {current.label}
            </button>
            {open && (
                <ul role="listbox" id="location-listbox" aria-labelledby="location-label" className="listbox">
                    {options.map((o) => (
                        <li
                            key={o.value}
                            role="option"
                            aria-selected={o.value === value}
                            tabIndex={-1}
                            onClick={() => pick(o.value)}
                            onKeyDown={(e) => e.key === 'Enter' && pick(o.value)}
                        >
                            {o.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
