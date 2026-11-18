import { createElement, useEffect, useRef } from 'react';
import './rating-element';
import type { HgRating } from './rating-element';

/** React wrapper around <hg-rating>: sets the value as a property and listens to its change event. */
export function Rating({ value, onChange, readOnly }: { value: number; onChange?: (value: number) => void; readOnly?: boolean }) {
    const ref = useRef<HgRating>(null);

    useEffect(() => {
        if (ref.current && ref.current.value !== value) ref.current.value = value;
    }, [value]);

    useEffect(() => {
        const el = ref.current;
        if (!el || !onChange) return;
        const handler = (e: Event) => onChange((e as CustomEvent<{ value: number }>).detail.value);
        el.addEventListener('change', handler);
        return () => el.removeEventListener('change', handler);
    }, [onChange]);

    return createElement('hg-rating', { ref, readonly: readOnly ? '' : undefined });
}
