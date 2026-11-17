import { Link, useLocation, useParams } from 'react-router-dom';

export function Applied() {
    const { reference } = useParams();
    const state = useLocation().state as { email?: string; title?: string } | null;
    return (
        <section className="page narrow">
            <h1>Thank you for applying</h1>
            {state?.title && (
                <p>
                    Your application for <strong>{state.title}</strong> has arrived.
                </p>
            )}
            <p>
                Your reference: <strong data-testid="application-reference">{reference}</strong>
            </p>
            <p>{state?.email ? `We have sent a confirmation to ${state.email}.` : 'We have sent you a confirmation by email.'}</p>
            <p>
                <Link to="/jobs">Back to all jobs</Link>
            </p>
        </section>
    );
}
