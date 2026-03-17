import { useState } from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import STEPS from '../../utils/steps';
import usePipelineStore from '../../stores/usePipelineStore';
import useDataStore from '../../stores/useDataStore';
import Banner from '../ui/Banner';

export default function Stepper() {
  const { currentStep, completedSteps, setStep, isStepAccessible } =
    usePipelineStore();
  const schemaOK = useDataStore((s) => s.schemaOK);
  const [blockedBanner, setBlockedBanner] = useState(false);

  const handleStepClick = (stepNumber) => {
    // Special gate: Step 3 requires schemaOK
    if (stepNumber === 3 && !schemaOK && !completedSteps.has(3)) {
      setBlockedBanner(true);
      setTimeout(() => setBlockedBanner(false), 5000);
      return;
    }

    if (isStepAccessible(stepNumber)) {
      setStep(stepNumber);
      setBlockedBanner(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 pt-3">
      <nav
        role="navigation"
        aria-label="Pipeline steps"
        className="bg-white rounded-xl border border-border shadow-card p-3"
      >
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((step, idx) => {
            const isDone = completedSteps.has(step.number);
            const isActive = currentStep === step.number;
            const isAccessible = isStepAccessible(step.number);
            const isLocked =
              step.number === 3
                ? !schemaOK && !completedSteps.has(3) && !completedSteps.has(2)
                : !isAccessible && !isDone;

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step button */}
                <button
                  onClick={() => handleStepClick(step.number)}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-2 py-2 transition-all duration-150 min-w-0 w-full',
                    isActive && 'bg-primary-bg border border-primary/20',
                    isDone && !isActive && 'hover:bg-slate-50',
                    isLocked && 'cursor-not-allowed',
                    !isLocked && !isActive && 'hover:bg-slate-50 cursor-pointer'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${step.number}: ${step.label}${isDone ? ' (completed)' : ''}${isLocked ? ' (locked)' : ''}`}
                  disabled={isLocked && !isActive && step.number !== 3}
                >
                  {/* Step number circle */}
                  <div
                    className={clsx(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                      isActive && 'bg-primary text-white',
                      isDone && !isActive && 'bg-primary-bg border border-primary-light text-primary',
                      !isActive && !isDone && 'bg-slate-100 border border-slate-300 text-muted'
                    )}
                  >
                    {isDone && !isActive ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Labels - hidden on small screens */}
                  <div className="hidden lg:block min-w-0 text-left">
                    <div
                      className={clsx(
                        'text-xs font-semibold truncate',
                        isActive ? 'text-primary' : isDone ? 'text-dark' : 'text-muted'
                      )}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] text-muted truncate">
                      {step.sublabel}
                    </div>
                  </div>
                </button>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={clsx(
                      'hidden sm:block h-0.5 w-4 flex-shrink-0 mx-0.5 rounded-full',
                      completedSteps.has(step.number)
                        ? 'bg-primary-light'
                        : 'bg-slate-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Blocked banner for Step 3 access without schema validation */}
      {blockedBanner && (
        <div className="mt-3">
          <Banner
            variant="error"
            title="Step 3 is locked"
            message="You must complete the Column Mapper in Step 2 and validate the schema before accessing Data Preparation."
            onDismiss={() => setBlockedBanner(false)}
          />
        </div>
      )}
    </div>
  );
}
