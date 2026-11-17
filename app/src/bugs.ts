import { createContext, useContext } from 'react';

export type Bug =
    | 'dup-apply'
    | 'dynamic-ids'
    | 'nbsp-title'
    | 'slow-search'
    | 'cookie-banner'
    | 'toast-overlay'
    | 'custom-select'
    | 'icon-save'
    | 'flaky-503'
    | 'slow-analytics'
    | 'locale-dates'
    | 'mail-delay'
    | 'deadline-tz'
    | 'debounce-search'
    | 'pipeline-animation'
    | 'unique-email'
    | 'global-settings';

export const BugsContext = createContext<ReadonlySet<string>>(new Set());

/** True when the teaching bug is switched on for this browser context. */
export const useBug = (name: Bug) => useContext(BugsContext).has(name);

export async function loadBugs(): Promise<ReadonlySet<string>> {
    try {
        const res = await fetch('/api/config');
        const json = (await res.json()) as { bugs: string[] };
        return new Set(json.bugs);
    } catch {
        return new Set();
    }
}

/** A short random suffix, used by the dynamic-ids bug. */
export const randomSuffix = () => Math.random().toString(36).slice(2, 6);
