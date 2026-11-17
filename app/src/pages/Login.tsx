import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, HttpError } from '../api';

export function Login() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            await api.login(email, password);
            navigate(params.get('next') ?? '/recruiter', { replace: true });
        } catch (err) {
            setError(err instanceof HttpError && err.status === 401 ? 'Email or password is wrong.' : 'Sign-in failed. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="page narrow">
            <h1>Recruiter sign-in</h1>
            {params.get('expired') && (
                <p role="status" className="notice">
                    Your session expired. Please sign in again.
                </p>
            )}
            <form onSubmit={submit} noValidate>
                <div className="field">
                    <label htmlFor="login-email">Email</label>
                    <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="field">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && (
                    <p role="alert" className="form-error">
                        {error}
                    </p>
                )}
                <button type="submit" className="button primary" disabled={busy}>
                    Sign in
                </button>
            </form>
            <p className="hint">
                Demo account: <code>rita.recruiter@hireground.test</code>, password <code>hire-ground</code>. More in the README.
            </p>
        </section>
    );
}
