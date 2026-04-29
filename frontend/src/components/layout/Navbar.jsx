import { BookOpen } from 'lucide-react';
import usePipelineStore from '../../stores/usePipelineStore';
import useModalStore from '../../stores/useModalStore';
import { getDomainById } from '../../utils/domains';

/**
 * Navbar layout component for the MedVix application shell.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Navbar() {
  const selectedDomain = usePipelineStore((s) => s.selectedDomain);
  const openGlossary = useModalStore((s) => s.openGlossary);

  const domain = selectedDomain ? getDomainById(selectedDomain) : null;

  return (
    <header className="h-14 bg-white border-b border-border sticky top-0 z-50 px-4 sm:px-6">
      <div className="h-full max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-dark leading-tight">
              MedVix
            </div>
            <div className="text-[11px] text-muted leading-tight">
              ML Visualization Tool
            </div>
          </div>
        </div>

        {/* Center: Domain badge */}
        {domain && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-border">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              style={{
                background: `linear-gradient(135deg, ${domain.gradient.from}, ${domain.gradient.to})`,
              }}
            >
              <span className="drop-shadow-sm">{domain.icon}</span>
            </span>
            <span className="text-xs font-medium text-dark">
              {domain.name}
            </span>
          </div>
        )}

        {/* Right: Glossary */}
        <button
          onClick={openGlossary}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-primary hover:border-primary transition-colors"
          aria-label="Open glossary of ML and clinical terms"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Glossary</span>
        </button>
      </div>
    </header>
  );
}
