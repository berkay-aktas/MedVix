import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import usePipelineStore from '../../stores/usePipelineStore';
import useDataStore from '../../stores/useDataStore';
import usePreparationStore from '../../stores/usePreparationStore';

export default function FooterNav() {
  const { currentStep, completedSteps, setStep, isStepAccessible } =
    usePipelineStore();
  const schemaOK = useDataStore((s) => s.schemaOK);
  const isApplied = usePreparationStore((s) => s.isApplied);

  const canGoBack = currentStep > 1;
  const canGoForward = (() => {
    if (currentStep >= 7) return false;
    // Step-specific completion checks
    if (currentStep === 1 && completedSteps.has(1)) return true;
    if (currentStep === 2 && schemaOK) return true;
    if (currentStep === 3 && isApplied) return true;
    // For future steps
    if (completedSteps.has(currentStep)) return true;
    return false;
  })();

  const handlePrevious = () => {
    if (canGoBack) {
      setStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      const nextStep = currentStep + 1;
      // Check if next step is accessible (special gate for step 3)
      if (nextStep === 3 && !schemaOK) return;
      setStep(nextStep);
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

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canGoForward}
          iconRight={ChevronRight}
          aria-label="Go to next step"
        >
          {currentStep < 7 ? 'Continue' : 'Finish'}
        </Button>
      </div>
    </footer>
  );
}
