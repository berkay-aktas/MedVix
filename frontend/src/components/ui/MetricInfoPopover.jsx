import { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import clsx from 'clsx';

export default function MetricInfoPopover({ value, explanation, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  if (!explanation) return null;

  const { title, clinical, technical, why, thresholds } = explanation;
  const v = value ?? 0;
  const clinicalText = typeof clinical === 'function' ? clinical(v) : clinical;
  const technicalText = typeof technical === 'function' ? technical(v) : technical;

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label={`What is ${title}?`}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted hover:text-primary transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={title}
          className={clsx(
            'absolute z-30 top-6 w-[320px] max-w-[90vw] bg-white rounded-xl shadow-lg border border-border p-4 animate-scale-in',
            align === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
          )}
        >
          <div className="flex items-start justify-between mb-3 gap-2">
            <h4 className="text-sm font-semibold text-dark">{title}</h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-muted hover:text-dark transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bilingual framings — staggered reveal: clinical headline first, technical caption follows */}
          <div className="space-y-1.5 mb-3">
            <p
              className="text-[14px] text-dark leading-relaxed animate-slide-up"
              style={{ animationDelay: '0ms', animationFillMode: 'both' }}
            >
              {clinicalText}
            </p>
            <p
              className="text-[11px] font-mono text-muted animate-slide-up"
              style={{ animationDelay: '180ms', animationFillMode: 'both' }}
            >
              {technicalText}
            </p>
          </div>

          {why && (
            <p
              className="text-[12px] text-slate-700 leading-relaxed border-t border-border pt-3 mb-3 animate-fade-in"
              style={{ animationDelay: '320ms', animationFillMode: 'both' }}
            >
              <span className="font-semibold text-slate-900">Why it matters: </span>{why}
            </p>
          )}

          {thresholds && thresholds.length > 0 && (
            <div
              className="flex gap-1.5 flex-wrap animate-fade-in"
              style={{ animationDelay: '420ms', animationFillMode: 'both' }}
            >
              {thresholds.map((t) => (
                <span
                  key={t.label}
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                    t.color === 'success' && 'bg-emerald-50 text-emerald-700',
                    t.color === 'warning' && 'bg-amber-50 text-amber-700',
                    t.color === 'danger' && 'bg-red-50 text-red-700'
                  )}
                >
                  <span>{t.label}</span>
                  <span className="font-mono font-normal opacity-75">{t.range}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
