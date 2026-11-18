import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './IconButton';
import { overlayRoot } from './StageSelect';

type Toast = { id: number; text: string; kind: 'ok' | 'error' };
type Notify = (text: string, kind?: Toast['kind']) => void;

const ToastContext = createContext<Notify>(() => {});

/** notify('Saved.') shows a message for four seconds. */
export const useToast = () => useContext(ToastContext);

const VISIBLE_FOR = 4000;
let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
    const notify = useCallback<Notify>(
        (text, kind = 'ok') => {
            const id = ++seq;
            setToasts((list) => [...list, { id, text, kind }]);
            setTimeout(() => dismiss(id), VISIBLE_FOR);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={notify}>
            {children}
            {createPortal(
                <div className="toaster">
                    {toasts.map((t) => (
                        <div key={t.id} className={`toast-item ${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
                            <span>{t.text}</span>
                            <IconButton icon="close" small onClick={() => dismiss(t.id)} />
                        </div>
                    ))}
                </div>,
                overlayRoot(),
            )}
        </ToastContext.Provider>
    );
}
