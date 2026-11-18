import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
    title: string;
    children?: ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
};

/** A modal <dialog>: role "dialog", named by its heading. Escape cancels. */
export function ConfirmDialog({ title, children, confirmLabel, onConfirm, onCancel }: Props) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog ref={ref} className="confirm" aria-labelledby="confirm-title" onCancel={onCancel}>
            <h2 id="confirm-title">{title}</h2>
            {children}
            <div className="confirm-actions">
                <button type="button" className="button" onClick={onCancel}>
                    Cancel
                </button>
                <button type="button" className="button danger" onClick={onConfirm}>
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
