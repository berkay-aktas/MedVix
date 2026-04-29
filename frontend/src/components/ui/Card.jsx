import clsx from 'clsx';

/**
 * Card reusable UI primitive component.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Card({ children, title, className, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-card border border-border p-5',
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
