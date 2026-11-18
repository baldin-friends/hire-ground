import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { Analytics } from './components/Analytics';
import { CookieBanner } from './components/CookieBanner';
import { IconSprite } from './components/Icon';
import { ToastProvider } from './components/Toasts';
import { Applied } from './pages/Applied';
import { Apply } from './pages/Apply';
import { Candidate } from './pages/Candidate';
import { Candidates } from './pages/Candidates';
import { JobForm } from './pages/JobForm';
import { JobsAdmin } from './pages/JobsAdmin';
import { JobDetail } from './pages/JobDetail';
import { Jobs } from './pages/Jobs';
import { Login } from './pages/Login';
import { Mailbox } from './pages/Mailbox';
import { Pipeline } from './pages/Pipeline';
import { RecruiterLayout } from './pages/RecruiterLayout';
import { Settings } from './pages/Settings';
import { Status } from './pages/Status';

export function App() {
    return (
        <ToastProvider>
            <a className="skip-link" href="#main">
                Skip to content
            </a>
            <header className="site-header">
                <div className="wrap header-inner">
                    <Link to="/jobs" className="brand">
                        <span className="brand-mark" aria-hidden="true">
                            H
                        </span>
                        Hire Ground
                    </Link>
                    <nav aria-label="Main">
                        <NavLink to="/jobs">Jobs</NavLink>
                        <NavLink to="/recruiter">For recruiters</NavLink>
                        <NavLink to="/mailbox">Test mailbox</NavLink>
                    </nav>
                </div>
            </header>
            <main id="main" className="wrap">
                <Routes>
                    <Route path="/" element={<Navigate to="/jobs" replace />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:slug" element={<JobDetail />} />
                    <Route path="/jobs/:slug/apply" element={<Apply />} />
                    <Route path="/applied/:reference" element={<Applied />} />
                    <Route path="/status/:reference" element={<Status />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/recruiter" element={<RecruiterLayout />}>
                        <Route index element={<Pipeline />} />
                        <Route path="candidates" element={<Candidates />} />
                        <Route path="applications/:id" element={<Candidate />} />
                        <Route path="jobs" element={<JobsAdmin />} />
                        <Route path="jobs/new" element={<JobForm />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="/mailbox" element={<Mailbox />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <footer className="site-footer wrap">
                Hire Ground is a course app for the Playwright training. All people and jobs are fictional.
            </footer>
            <CookieBanner />
            <Analytics />
            <IconSprite />
        </ToastProvider>
    );
}

function NotFound() {
    return (
        <section className="page">
            <h1>Page not found</h1>
            <p>
                <Link to="/jobs">Back to all jobs</Link>
            </p>
        </section>
    );
}
