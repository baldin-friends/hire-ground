import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api, type User } from '../api';
import { SessionTimeout } from '../components/SessionTimeout';

export function RecruiterLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [state, setState] = useState<'loading' | 'ok' | 'anonymous'>('loading');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        api.me()
            .then((u) => {
                setUser(u);
                setState('ok');
            })
            .catch(() => setState('anonymous'));
    }, []);

    if (state === 'loading') return <p className="page" role="status">Loading…</p>;
    if (state === 'anonymous') return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;

    return (
        <div className="recruiter">
            <nav aria-label="Recruiter" className="subnav">
                <NavLink end to="/recruiter">
                    Pipeline
                </NavLink>
                <NavLink to="/recruiter/settings">Settings</NavLink>
                <span className="spacer" />
                <span className="user">Signed in as {user!.name}</span>
                <button
                    type="button"
                    className="link-button"
                    onClick={async () => {
                        await api.logout();
                        navigate('/login');
                    }}
                >
                    Sign out
                </button>
            </nav>
            <SessionTimeout />
            <Outlet context={user} />
        </div>
    );
}
