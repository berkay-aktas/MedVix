import clsx from 'clsx';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  outline:
    'border border-border text-muted hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  danger:
    'bg-danger text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2',
  ghost:
    'text-muted hover:text-text-main hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className,
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-all duration-150',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
      {IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}
