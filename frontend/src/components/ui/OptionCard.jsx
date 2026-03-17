import { Check } from 'lucide-react';
import clsx from 'clsx';

export default function OptionCard({
  title,
  description,
  formula,
  selected = false,
  onClick,
  recommended = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full text-left border rounded-xl p-4 transition-all duration-150 relative',
        selected
          ? 'border-primary bg-primary-bg ring-1 ring-primary'
          : 'border-border bg-white hover:border-primary/40',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-pressed={selected}
      aria-label={`${title}${recommended ? ' (recommended)' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-dark">{title}</span>
            {recommended && (
              <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border border-primary/20">
                Recommended
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {description}
            </p>
          )}
          {formula && (
            <code className="block text-xs font-mono text-primary mt-2 bg-primary-bg/50 rounded px-2 py-1">
              {formula}
            </code>
          )}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
    </button>
  );
}
