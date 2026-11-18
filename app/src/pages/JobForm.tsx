import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, HttpError, LOCATIONS, TEAMS, type Job } from '../api';
import { IconButton } from '../components/IconButton';
import { useToast } from '../components/Toasts';

type Errors = Partial<Record<'title' | 'team' | 'location' | 'salary' | 'deadline' | 'description', string>>;

export function JobForm() {
    const navigate = useNavigate();
    const notify = useToast();
    const editor = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState('');
    const [team, setTeam] = useState('');
    const [location, setLocation] = useState('');
    const [remote, setRemote] = useState(false);
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [deadline, setDeadline] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skill, setSkill] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState('');
    const [busy, setBusy] = useState(false);

    function addSkill() {
        const value = skill.trim();
        if (value && !skills.includes(value)) setSkills([...skills, value]);
        setSkill('');
    }

    async function save(status: Job['status']) {
        setBusy(true);
        setFormError('');
        try {
            const job = await api.createJob({
                title,
                team,
                location,
                remote,
                salaryMin: Number(salaryMin),
                salaryMax: Number(salaryMax),
                deadline,
                description: editor.current?.innerText ?? '',
                skills,
                status,
            });
            notify(status === 'published' ? `${job.title} is published.` : 'Draft saved.');
            navigate('/recruiter/jobs');
        } catch (e) {
            if (e instanceof HttpError && e.status === 422) setErrors(e.body.errors ?? {});
            else if (e instanceof HttpError && e.body?.message) setFormError(e.body.message);
            else setFormError('The job could not be saved. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    const field = (name: keyof Errors) =>
        errors[name] ? { 'aria-invalid': true as const, 'aria-describedby': `job-${name}-error` } : {};
    const error = (name: keyof Errors) =>
        errors[name] && (
            <p className="field-error" id={`job-${name}-error`}>
                {errors[name]}
            </p>
        );

    return (
        <section className="page narrow">
            <p className="back">
                <Link to="/recruiter/jobs">Jobs</Link>
            </p>
            <h1>New job</h1>
            {formError && (
                <p className="form-error" role="alert">
                    {formError}
                </p>
            )}
            <form
                className="apply-form"
                noValidate
                onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    save('published');
                }}
            >
                <div className="field">
                    <label htmlFor="job-title">Job title</label>
                    <input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} {...field('title')} />
                    {error('title')}
                </div>

                <div className="row two">
                    <div className="field">
                        <label htmlFor="job-team">Team</label>
                        <select id="job-team" value={team} onChange={(e) => setTeam(e.target.value)} {...field('team')}>
                            <option value="">Please choose</option>
                            {TEAMS.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                        {error('team')}
                    </div>
                    <div className="field">
                        <label htmlFor="job-location">Location</label>
                        <select id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} {...field('location')}>
                            <option value="">Please choose</option>
                            {LOCATIONS.map((l) => (
                                <option key={l}>{l}</option>
                            ))}
                        </select>
                        {error('location')}
                    </div>
                </div>

                <div className="field">
                    <label className="checkbox">
                        <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
                        Remote possible
                    </label>
                </div>

                <fieldset className="salary-range">
                    <legend>Salary per year in €</legend>
                    <div className="row two">
                        <div className="field">
                            <label htmlFor="job-salary-min">From</label>
                            <input id="job-salary-min" type="number" min="0" step="1000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} {...field('salary')} />
                        </div>
                        <div className="field">
                            <label htmlFor="job-salary-max">To</label>
                            <input id="job-salary-max" type="number" min="0" step="1000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} {...field('salary')} />
                        </div>
                    </div>
                    {error('salary')}
                </fieldset>

                <div className="field">
                    <label htmlFor="job-deadline">Application deadline</label>
                    <input id="job-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} {...field('deadline')} />
                    {error('deadline')}
                </div>

                <div className="field">
                    <span className="label" id="job-description-label">
                        Description
                    </span>
                    {/* a rich-text field: a <div contenteditable>, not a <textarea> */}
                    <div
                        ref={editor}
                        className="editor"
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        aria-labelledby="job-description-label"
                        {...field('description')}
                    />
                    {error('description')}
                </div>

                <div className="field">
                    <label htmlFor="job-skill">Skills</label>
                    <div className="tags">
                        {skills.map((s) => (
                            <span key={s} className="tag" data-qa="skill">
                                {s}
                                <IconButton icon="close" small onClick={() => setSkills(skills.filter((x) => x !== s))} />
                            </span>
                        ))}
                        <input
                            id="job-skill"
                            placeholder="Type a skill, press Enter"
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault(); // Enter adds the skill; it must not submit the form
                                    addSkill();
                                }
                            }}
                            onBlur={addSkill}
                        />
                    </div>
                </div>

                <div className="actions">
                    <button type="button" className="button" disabled={busy} onClick={() => save('draft')}>
                        Save draft
                    </button>
                    <button type="submit" className="button primary" disabled={busy}>
                        Publish
                    </button>
                </div>
            </form>
        </section>
    );
}
