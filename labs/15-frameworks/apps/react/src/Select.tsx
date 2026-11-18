import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

type Props = {
    id: string;
    label: string;
    placeholder: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
};

// A custom dropdown. The listbox is not a child of the form: a portal renders
// it at the end of <body>, the way component libraries do.
export function Select({ id, label, placeholder, options, value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0, minWidth: 0 });
    const button = useRef<HTMLButtonElement>(null);
    const listbox = useRef<HTMLUListElement>(null);

    // A click anywhere else closes the listbox.
    useEffect(() => {
        if (!open) {
            return;
        }
        function onPointerDown(event: PointerEvent) {
            const target = event.target as Node;
            if (!button.current?.contains(target) && !listbox.current?.contains(target)) {
                setOpen(false);
            }
        }
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    function show() {
        const rect = button.current!.getBoundingClientRect();
        setPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, minWidth: rect.width });
        setActive(Math.max(options.indexOf(value), 0));
        setOpen(true);
        // Safari does not focus a button on click, and the keys are handled on the button.
        button.current!.focus();
    }

    function choose(option: string) {
        onChange(option);
        setOpen(false);
        button.current?.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
                show();
            } else {
                const step = event.key === 'ArrowDown' ? 1 : -1;
                setActive(Math.min(Math.max(active + step, 0), options.length - 1));
            }
        } else if (event.key === 'Enter' && open) {
            event.preventDefault();
            choose(options[active]);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    return (
        <>
            <label id={`${id}-label`} htmlFor={id}>
                {label}
            </label>
            <button
                ref={button}
                id={id}
                type="button"
                className="select"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${id}-listbox`}
                aria-labelledby={`${id}-label`}
                aria-activedescendant={open ? `${id}-option-${active}` : undefined}
                onClick={() => (open ? setOpen(false) : show())}
                onKeyDown={onKeyDown}
            >
                {value || placeholder}
            </button>
            {open &&
                createPortal(
                    <ul
                        ref={listbox}
                        id={`${id}-listbox`}
                        className="listbox"
                        role="listbox"
                        aria-labelledby={`${id}-label`}
                        style={{ position: 'absolute', ...position }}
                    >
                        {options.map((option, index) => (
                            <li
                                key={option}
                                id={`${id}-option-${index}`}
                                className={index === active ? 'active' : undefined}
                                role="option"
                                aria-selected={option === value}
                                onClick={() => choose(option)}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>,
                    document.body,
                )}
        </>
    );
}
