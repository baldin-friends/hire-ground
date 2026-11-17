import { useState } from 'react';
import { useBug } from '../bugs';

// icon-save: the same button without aria-label. Screen readers announce
// "button", getByRole('button', { name: 'Save job' }) finds nothing.
export function SaveButton({ jobTitle }: { jobTitle: string }) {
    const nameless = useBug('icon-save');
    const [saved, setSaved] = useState(false);
    return (
        <button
            type="button"
            className="icon-button"
            aria-pressed={saved}
            aria-label={nameless ? undefined : 'Save job'}
            title={nameless ? undefined : `Save ${jobTitle}`}
            onClick={() => setSaved((s) => !s)}
        >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                    d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
                    fill={saved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
