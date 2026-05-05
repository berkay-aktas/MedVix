import { useEffect, useState } from 'react';
import clsx from 'clsx';

/**
 * Sticky model switcher that appears ONLY after the user has scrolled
 * past the inline switcher row at the top of Step 5.
 *
 * Uses IntersectionObserver on `targetRef` (the inline switcher's wrapper)
 * to decide when to slide in. Renders as a fixed strip below the navbar
 * with a backdrop-blur so charts underneath remain partially visible —
 * the "always-there-but-not-shouting" feel.
 */
export default function StickyModelBar({ targetRef, trainedModels, activeId, onSelect }) {
  const [isAnchorVisible, setIsAnchorVisible] = useState(true);

  useEffect(() => {
    const node = targetRef?.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsAnchorVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' } // 56px = navbar h-14
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [targetRef]);

  if (!trainedModels || trainedModels.length < 2) return null;

  const visible = !isAnchorVisible;

  return (
    <div
      aria-hidden={!visible}
      className={clsx(
        'fixed left-0 right-0 top-14 z-20 border-b border-border',
        'bg-white/80 backdrop-blur-md',
        'transition-all duration-300 ease-out',
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted shrink-0">
          Showing
        </span>
        {trainedModels.map((m) => {
          const isActive = m.model_id === activeId;
          return (
            <button
              key={m.model_id}
              type="button"
              onClick={() => onSelect(m)}
              aria-pressed={isActive}
              tabIndex={visible ? 0 : -1}
              className={clsx(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-muted hover:bg-slate-200 hover:text-dark'
              )}
            >
              {m.model_name || m.model_type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
