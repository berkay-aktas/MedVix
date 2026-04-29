import { useEffect } from 'react';
import { BarChart3, ArrowLeft } from 'lucide-react';
import Banner from '../../components/ui/Banner';
import Button from '../../components/ui/Button';
import useMLStore from '../../stores/useMLStore';
import usePipelineStore from '../../stores/usePipelineStore';
import MetricsGrid from './MetricsGrid';
import ConfusionMatrix from './ConfusionMatrix';
import ROCCurve from './ROCCurve';
import PRCurve from './PRCurve';
import CrossValidation from './CrossValidation';
import OverfitDetector from './OverfitDetector';
import ModelComparison from './ModelComparison';

/**
 * Step5 Results component for Step 5 (Results) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Step5Results() {
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const trainedModels = useMLStore((s) => s.trainedModels);
  const comparison = useMLStore((s) => s.comparison);
  const setStep = usePipelineStore((s) => s.setStep);
  const completeStep = usePipelineStore((s) => s.completeStep);

  // Mark step 5 complete when results are available
  useEffect(() => {
    if (activeModelResult) {
      completeStep(5);
    }
  }, [activeModelResult, completeStep]);

  // No results yet
  if (!activeModelResult) {
    return (
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
              Step 5
            </span>
          </div>
          <h1 className="text-xl font-semibold text-dark">Results</h1>
          <p className="text-sm text-muted mt-1">
            View model performance metrics, curves, and diagnostics.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-dark mb-2">
            No Results Yet
          </h2>
          <p className="text-sm text-muted max-w-md mb-4">
            Train a model in Step 4 to see performance metrics, ROC curves,
            confusion matrix, and other diagnostics here.
          </p>
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => setStep(4)}
          >
            Go to Step 4
          </Button>
        </div>
      </div>
    );
  }

  const result = activeModelResult;

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            Step 5
          </span>
        </div>
        <h1 className="text-xl font-semibold text-dark">Results</h1>
        <p className="text-sm text-muted mt-1">
          Performance analysis for{' '}
          <span className="font-medium text-dark">
            {result.model_name || result.model_type}
          </span>
          {result.training_time_ms != null && (
            <span>
              {' '}
              &middot; Trained in{' '}
              <span className="font-mono font-medium">
                {result.training_time_ms}ms
              </span>
            </span>
          )}
        </p>
      </div>

      {/* Overfit warning at top if severe */}
      {result.overfit_warning && (
        <Banner
          variant="warning"
          title="Overfitting Warning"
          message={result.overfit_warning}
          className="mb-5"
        />
      )}

      {/* Low Sensitivity Danger Banner */}
      {(() => {
        const sens = result.metrics?.find((m) => m.name === 'sensitivity');
        if (sens && sens.value < 0.5) {
          return (
            <Banner
              variant="error"
              title="Dangerously Low Sensitivity"
              message={`Sensitivity is only ${(sens.value * 100).toFixed(1)}% — below the 50% clinical safety threshold. This model fails to detect more than half of positive cases (e.g., patients with the condition classified as healthy). Consider adjusting hyperparameters or trying a different model before any clinical use.`}
              className="mb-5"
            />
          );
        }
        return null;
      })()}

      <div className="space-y-5">
        {/* Metrics grid */}
        <MetricsGrid metrics={result.metrics} />

        {/* Charts row: Confusion Matrix + ROC */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ConfusionMatrix confusionMatrix={result.confusion_matrix} />
          <ROCCurve rocData={result.roc_curve} />
        </div>

        {/* Charts row: PR Curve + Cross-Validation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PRCurve prData={result.pr_curve} />
          <CrossValidation cvData={result.cross_validation} />
        </div>

        {/* Overfit detector */}
        <OverfitDetector
          trainAccuracy={result.train_accuracy}
          testAccuracy={result.test_accuracy}
        />

        {/* Model comparison table */}
        <ModelComparison
          trainedModels={trainedModels}
          comparison={comparison}
        />
      </div>
    </div>
  );
}
