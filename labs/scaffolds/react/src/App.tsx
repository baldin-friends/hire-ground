import { useState, type FormEvent } from 'react';
import { Link, Route, Routes, useParams } from 'react-router';
import { jobs, workingModels } from './jobs';
import { Select } from './Select';

export function App() {
    return (
        <>
            <header className="banner">
                <Link to="/">Hire Ground careers</Link>
            </header>
            <main>
                <Routes>
                    <Route path="/" element={<JobList />} />
                    <Route path="/apply/:slug" element={<Apply />} />
                    <Route path="*" element={<h1>Page not found</h1>} />
                </Routes>
            </main>
            <footer>Built with React</footer>
        </>
    );
}

function JobList() {
    return (
        <>
            <h1>Open positions</h1>
            <ul className="jobs" role="list">
                {jobs.map((job) => (
                    <li key={job.slug}>
                        <h2>{job.title}</h2>
                        <p>{job.location}</p>
                        <Link to={`/apply/${job.slug}`}>Apply</Link>
                    </li>
                ))}
            </ul>
        </>
    );
}

function Apply() {
    const { slug } = useParams();
    const job = jobs.find((j) => j.slug === slug);
    const [email, setEmail] = useState('');
    const [model, setModel] = useState('');
    const [sent, setSent] = useState(false);

    if (!job) {
        return <h1>Position not found</h1>;
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        setSent(true);
    }

    if (sent) {
        return (
            <>
                <h1>Thank you for applying</h1>
                <p>
                    We will write to {email} about the {job.title} position. Working model: {model || 'not chosen'}.
                </p>
                <Link to="/">Back to all positions</Link>
            </>
        );
    }

    return (
        <>
            <h1>Apply: {job.title}</h1>
            <form onSubmit={submit}>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                <Select id="model" label="Working model" placeholder="Please choose" options={workingModels} value={model} onChange={setModel} />
                <button type="submit">Submit application</button>
            </form>
        </>
    );
}
