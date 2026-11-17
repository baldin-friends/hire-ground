// Teaching bugs. All off by default.
//
// Switch them on for the whole server with BUGS=a,b (or BUGS=all), or per
// browser context with ?bugs=a,b on any URL (stored in the hg_bugs cookie;
// ?bugs=none clears it). The effective set is the union of both.

export const FLAGS = {
    'dup-apply': 'second Apply link in a sticky bar on the job page',
    'dynamic-ids': 'element ids regenerate on every load',
    'nbsp-title': 'job titles use non-breaking spaces',
    'slow-search': 'job search API answers after 300–1500 ms',
    'cookie-banner': 'consent banner on about 30 % of page loads, after up to 800 ms',
    'toast-overlay': 'the "Draft saved" toast covers Submit for 800 ms',
    'custom-select': 'location filter is an ARIA combobox instead of a <select>',
    'icon-save': '"Save job" icon button has no accessible name',
    'flaky-503': '5 % of application submits return 503',
    'slow-analytics': 'third-party analytics script hangs for 10 s and keeps beaconing',
    'locale-dates': 'dates follow the browser locale instead of de-DE',
    'mail-delay': 'confirmation mail arrives after 2–8 s',
    'deadline-tz': 'deadline status computed in UTC instead of Europe/Berlin',
    'debounce-search': 'search runs while typing, debounced by 400 ms',
    'pipeline-animation': 'pipeline cards animate for 600 ms',
    'unique-email': 'an e-mail address may apply only once across all jobs',
    'global-settings': 'notification setting is shared by all recruiters',
};

export function parseBugs(value) {
    const set = new Set();
    for (const raw of String(value ?? '').split(',')) {
        const name = raw.trim();
        if (name === 'all') Object.keys(FLAGS).forEach((f) => set.add(f));
        else if (name in FLAGS) set.add(name);
    }
    return set;
}

const fromEnv = parseBugs(process.env.BUGS);

export function bugsMiddleware(req, res, next) {
    let fromCookie = parseBugs(req.cookies.hg_bugs);
    if (typeof req.query.bugs === 'string') {
        fromCookie = parseBugs(req.query.bugs);
        const value = [...fromCookie].join(',');
        res.append('Set-Cookie', `hg_bugs=${value}; Path=/; SameSite=Lax${value ? '' : '; Max-Age=0'}`);
    }
    req.bugs = new Set([...fromEnv, ...fromCookie]);
    next();
}
