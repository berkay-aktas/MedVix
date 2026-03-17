import clsx from 'clsx';

const variantStyles = {
  numeric: 'bg-blue-100 text-blue-800',
  categorical: 'bg-purple-100 text-purple-800',
  binary: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  identifier: 'bg-slate-100 text-slate-700',
  ml: 'bg-indigo-100 text-indigo-800',
  clinical: 'bg-teal-100 text-teal-800',
  both: 'bg-violet-100 text-violet-800',
  default: 'bg-slate-100 text-slate-700',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
