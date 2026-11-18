import { Icon, type IconName } from './Icon';

type Props = {
    icon: IconName;
    onClick?: () => void;
    /** A toggle button: true or false. */
    pressed?: boolean;
    /**
     * The accessible name. It is optional, and the candidates table does not pass it:
     * a screen reader says "button", and getByRole('button', { name }) finds nothing.
     */
    label?: string;
    /** With href the control is a link (a download, for example). */
    href?: string;
    small?: boolean;
};

export function IconButton({ icon, onClick, pressed, label, href, small }: Props) {
    const className = `icon-btn${small ? ' small' : ''}${pressed ? ' is-active' : ''}`;
    if (href) {
        return (
            <a className={className} href={href} download aria-label={label}>
                <Icon name={icon} />
            </a>
        );
    }
    return (
        <button type="button" className={className} aria-pressed={pressed} aria-label={label} onClick={onClick}>
            <Icon name={icon} />
        </button>
    );
}
