import clsx from 'clsx';

/**
 * Slider Control reusable UI primitive component.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function SliderControl({
  label,
  labelSuffix,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  displayFormat,
  className,
}) {
  const displayValue = displayFormat
    ? displayFormat(value)
    : `${value}`;

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-dark">{label}</label>
          {labelSuffix}
        </div>
        <span className="text-sm font-mono font-semibold text-primary bg-primary-bg rounded-full px-3 py-0.5">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-white
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-primary
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:border-2
          [&::-moz-range-thumb]:border-white"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted">{min}</span>
        <span className="text-[10px] text-muted">{max}</span>
      </div>
    </div>
  );
}
