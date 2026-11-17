import { useBug } from '../bugs';
import { deadlineStatus, formatDate } from '../format';

export function Deadline({ deadline }: { deadline: string }) {
    const status = deadlineStatus(deadline, useBug('deadline-tz'));
    const date = formatDate(deadline, useBug('locale-dates'));
    if (status === 'closed') return <p className="deadline closed">Applications closed</p>;
    if (status === 'today') return <p className="deadline today">Closes today</p>;
    return <p className="deadline">Apply by {date}</p>;
}
