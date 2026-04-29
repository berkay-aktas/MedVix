import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Info } from 'lucide-react';
import Button from '../ui/Button';
import usePipelineStore from '../../stores/usePipelineStore';
import useDataStore from '../../stores/useDataStore';
import usePreparationStore from '../../stores/usePreparationStore';
import useMLStore from '../../stores/useMLStore';
import useExplainabilityStore from '../../stores/useExplainabilityStore';

function getBlockingReason(currentStep, { completedSteps, schemaOK, isApplied, activeModelResult, featureImportance }) {
  switch (currentStep) {
    case 1:
      if (!completedSteps.has(1))
        return 'Select a clinical domain to continue.';
      return null;
    case 2:
      if (!schemaOK)
        return 'Load a dataset and confirm the column mapping to continue.';
      return null;
    case 3:
      if (!isApplied)
        return 'Apply data preparation settings (train/test split, missing values, normalisation) to continue.';
      return null;
    case 4:
      if (!completedSteps.has(4))
        return 'Select and train at least one ML model to continue.';
      return null;
    case 5:
      if (!activeModelResult)
        return 'Train a model in Step 4 to view results and continue.';
      return null;
    case 6:
      if (!featureImportance)
        return 'SHAP feature importance is being computed. Please wait for the analysis to finish.';
      return null;
    case 7:
      return null;
    default:
      return null;
  }
}

/**
 * Footer Nav layout component for the MedVix application shell.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function FooterNav() {
  const { currentStep, completedSteps, setStep, isStepAccessible } =
    usePipelineStore();
  const schemaOK = useDataStore((s) => s.schemaOK);
  const isApplied = usePreparationStore((s) => s.isApplied);
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const featureImportance = useExplainabilityStore((s) => s.featureImportance);

  const [showHint, setShowHint] = useState(false);

  const canGoBack = currentStep > 1;
  const canGoForward = (() => {
    if (currentStep >= 7) return false;
    if (currentStep === 1 && completedSteps.has(1)) return true;
    if (currentStep === 2 && schemaOK) return true;
    if (currentStep === 3 && isApplied) return true;
    // Step 5 is view-only — if a model is trained, user can proceed
    if (currentStep === 5 && activeModelResult) return true;
    // Step 6 — SHAP loaded means user can proceed to ethics
    if (currentStep === 6 && featureImportance) return true;
    if (completedSteps.has(currentStep)) return true;
    return false;
  })();

  const blockingReason = !canGoForward
    ? getBlockingReason(currentStep, { completedSteps, schemaOK, isApplied, activeModelResult, featureImportance })
    : null;

  const handlePrevious = () => {
    if (canGoBack) {
      setStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      const nextStep = currentStep + 1;
      if (nextStep === 3 && !schemaOK) return;
      setStep(nextStep);
      setShowHint(false);
    }
  };

  const handleDisabledClick = () => {
    if (!canGoForward && blockingReason) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 4000);
    }
  };

  return (
    <footer className="border-t border-border bg-white py-3 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoBack}
          icon={ChevronLeft}
          aria-label="Go to previous step"
        >
          Previous
        </Button>

        <span className="text-xs font-medium text-muted">
          Step {currentStep} of 7
        </span>

        <div className="relative">
          {/* Hint tooltip */}
          {showHint && blockingReason && (
            <div className="absolute bottom-full right-0 mb-2 w-72 animate-fade-in">
              <div className="bg-dark text-white text-[12px] leading-relaxed rounded-lg px-3.5 py-2.5 shadow-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary-light" />
                  <span>{blockingReason}</span>
                </div>
              </div>
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-dark rotate-45" />
            </div>
          )}

          {canGoForward ? (
            <Button
              variant="primary"
              onClick={handleNext}
              iconRight={ChevronRight}
              aria-label="Go to next step"
            >
              Continue
            </Button>
          ) : currentStep >= 7 ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary-bg text-primary border border-primary/20">
              <Check className="w-4 h-4" />
              Pipeline Complete
            </span>
          ) : (
            <button
              onClick={handleDisabledClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 transition-colors hover:bg-slate-150"
              aria-label="Continue unavailable"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
