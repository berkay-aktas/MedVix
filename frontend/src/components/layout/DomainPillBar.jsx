import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import DOMAINS from '../../utils/domains';
import usePipelineStore from '../../stores/usePipelineStore';
import useModalStore from '../../stores/useModalStore';

/**
 * Domain Pill Bar layout component for the MedVix application shell.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function DomainPillBar() {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const selectedDomain = usePipelineStore((s) => s.selectedDomain);
  const currentStep = usePipelineStore((s) => s.currentStep);
  const completedSteps = usePipelineStore((s) => s.completedSteps);
  const setDomain = usePipelineStore((s) => s.setDomain);
  const openDomainSwitch = useModalStore((s) => s.openDomainSwitch);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const handleDomainClick = (domainId) => {
    if (domainId === selectedDomain) return;

    // If user has progressed past step 1, show switch confirmation
    if (currentStep > 1 || completedSteps.size > 0) {
      openDomainSwitch(domainId);
    } else {
      setDomain(domainId);
    }
  };

  return (
    <div className="relative px-4 sm:px-8 py-3">
      {/* Left scroll indicator */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-card border border-border flex items-center justify-center text-muted hover:text-dark transition-colors"
          aria-label="Scroll domains left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable pills */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-thin"
        role="tablist"
        aria-label="Clinical domains"
      >
        {DOMAINS.map((domain) => {
          const isActive = selectedDomain === domain.id;
          return (
            <button
              key={domain.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${domain.name} (${domain.subtitle})`}
              onClick={() => handleDomainClick(domain.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-pill border whitespace-nowrap transition-all duration-150 flex-shrink-0',
                isActive
                  ? 'ring-2 ring-primary bg-primary-bg border-primary/30'
                  : 'border-border bg-white hover:border-primary/40 hover:text-primary'
              )}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                style={{
                  background: `linear-gradient(135deg, ${domain.gradient.from}, ${domain.gradient.to})`,
                }}
              >
                <span className="drop-shadow-sm">{domain.icon}</span>
              </span>
              <span
                className={clsx(
                  'text-xs font-medium',
                  isActive ? 'text-primary' : 'text-muted'
                )}
              >
                {domain.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right scroll indicator */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-card border border-border flex items-center justify-center text-muted hover:text-dark transition-colors"
          aria-label="Scroll domains right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
