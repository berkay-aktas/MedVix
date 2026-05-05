import { BookOpen, HelpCircle } from 'lucide-react';
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
  const setStep = usePipelineStore((s) => s.setStep);
  const openGlossary = useModalStore((s) => s.openGlossary);
  const openUserGuide = useModalStore((s) => s.openUserGuide);

  const domain = selectedDomain ? getDomainById(selectedDomain) : null;

  return (
    <header className="h-14 bg-white border-b border-border sticky top-0 z-50 px-4 sm:px-6">
      <div className="h-full max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand — click to go back to Step 1 */}
        <button
          type="button"
          onClick={() => setStep(1)}
          aria-label="MedVix home — go to Step 1"
          className="flex items-center gap-2.5 -ml-1 px-1 py-1 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <img
            src="/logo.png"
            alt="MedVix"
            className="w-11 h-11 flex-shrink-0"
            width={44}
            height={44}
          />
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-dark leading-tight">
              MedVix
            </div>
            <div className="text-[11px] text-muted leading-tight">
              ML Visualization Tool
            </div>
          </div>
        </button>

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

        {/* Right: How it works + Glossary */}
        <div className="flex items-center gap-2">
          <button
            onClick={openUserGuide}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-primary hover:border-primary transition-colors"
            aria-label="Open user guide"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">How it works</span>
          </button>
          <button
            onClick={openGlossary}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-primary hover:border-primary transition-colors"
            aria-label="Open glossary of ML and clinical terms"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
}
