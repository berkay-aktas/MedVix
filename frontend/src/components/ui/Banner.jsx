import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const variantConfig = {
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    Icon: AlertCircle,
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    Icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    Icon: Info,
  },
};

export default function Banner({
  variant = 'info',
  title,
  message,
  icon: CustomIcon,
  onDismiss,
  className,
  children,
}) {
  const config = variantConfig[variant] || variantConfig.info;
  const IconComponent = CustomIcon || config.Icon;

  return (
    <div
      className={clsx(
        'rounded-xl p-4 flex gap-3 border animate-fade-in',
        config.bg,
        className
      )}
      role="alert"
    >
      <IconComponent
        className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)}
      />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx('text-sm font-semibold', config.text)}>{title}</p>
        )}
        {message && (
          <p className={clsx('text-sm mt-0.5', config.text)}>{message}</p>
        )}
        {children}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={clsx(
            'p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0',
            config.text
          )}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
