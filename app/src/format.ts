// Dates and money. The career site is German: de-DE and Europe/Berlin,
// unless the locale-dates or deadline-tz teaching bugs say otherwise.

const TZ = 'Europe/Berlin';

export function formatDate(isoDate: string, followBrowserLocale = false) {
    const locale = followBrowserLocale ? navigator.language : 'de-DE';
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${isoDate}T00:00:00Z`),
    );
}

export function formatDateTime(iso: string) {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short', timeZone: TZ }).format(new Date(iso));
}

export function formatSalary(min: number, max: number) {
    const f = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
    return `${f.format(min)}–${f.format(max)} € per year`;
}

export function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Today as YYYY-MM-DD, in Berlin (correct) or in UTC (the deadline-tz bug). */
export function today(useUtc = false) {
    if (useUtc) return new Date().toISOString().slice(0, 10);
    return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

export type DeadlineStatus = 'open' | 'today' | 'closed';

export function deadlineStatus(deadline: string, useUtc = false): DeadlineStatus {
    const t = today(useUtc);
    if (deadline < t) return 'closed';
    if (deadline === t) return 'today';
    return 'open';
}

/** Whole days between an instant and now. */
export function daysSince(iso: string) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/** The time zone of this browser, for example Europe/Berlin. */
export const localTimeZone = () => new Intl.DateTimeFormat().resolvedOptions().timeZone;

/** An instant in the time zone of this browser: "Thu, 26 Nov 2026, 10:00". Built from parts, so every engine prints the same. */
export function formatLocalDateTime(iso: string) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date(iso));
    const p = (type: string) => parts.find((x) => x.type === type)?.value ?? '';
    return `${p('weekday')}, ${p('day')} ${p('month')} ${p('year')}, ${p('hour')}:${p('minute')}`;
}

/**
 * The day of an interview for the candidates table.
 * It cuts the day out of the UTC instant. That is the day in Greenwich, not the day in the recruiter's office.
 */
export function formatInterviewDay(iso: string) {
    return formatDate(iso.slice(0, 10));
}
