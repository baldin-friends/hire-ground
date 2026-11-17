import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { BugsContext, loadBugs } from './bugs';
import './styles.css';

// No StrictMode on purpose: its double effects would double the random teaching bugs in dev.
loadBugs().then((bugs) => {
    createRoot(document.getElementById('root')!).render(
        <BugsContext.Provider value={bugs}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </BugsContext.Provider>,
    );
});
