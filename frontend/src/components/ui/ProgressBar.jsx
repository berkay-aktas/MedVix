import clsx from 'clsx';

const colorMap = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  primary: 'bg-primary',
  slate: 'bg-slate-400',
};

/**
 * Progress Bar reusable UI primitive component.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function ProgressBar({
  value = 0,
  color = 'green',
  label,
  showValue = false,
  className,
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-medium text-muted">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-mono font-medium text-text-main">
              {clamped.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorMap[color] || colorMap.green
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || `Progress: ${clamped}%`}
        />
      </div>
    </div>
  );
}
