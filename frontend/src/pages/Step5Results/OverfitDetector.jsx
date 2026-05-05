import { AlertTriangle, ShieldCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Banner from '../../components/ui/Banner';
import ProgressBar from '../../components/ui/ProgressBar';
import MetricInfoPopover from '../../components/ui/MetricInfoPopover';
import { CHART_EXPLANATIONS } from './chartExplanations';

/**
 * Overfit Detector component for Step 5 (Results) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function OverfitDetector({ trainAccuracy, testAccuracy }) {
  if (trainAccuracy == null || testAccuracy == null) return null;

  const trainPct = trainAccuracy * 100;
  const testPct = testAccuracy * 100;
  const gap = trainPct - testPct;
  const absGap = Math.abs(gap);

  let severity = 'none';
  if (absGap > 20) severity = 'danger';
  else if (absGap > 10) severity = 'warning';

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        {severity === 'none' ? (
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        )}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Overfit Detector
        </h3>
        <MetricInfoPopover explanation={CHART_EXPLANATIONS.overfit_detector} />
      </div>

      <div className="space-y-4">
        {/* Train accuracy bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-dark">Train Accuracy</span>
            <span className="text-sm font-mono font-semibold text-emerald-700">
              {trainPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${trainPct}%` }}
              role="progressbar"
              aria-valuenow={trainPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Train accuracy: ${trainPct.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Gap indicator */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full">
            <span className="text-xs text-muted">Gap:</span>
            <span
              className={`text-sm font-mono font-bold ${
                severity === 'danger'
                  ? 'text-red-600'
                  : severity === 'warning'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
              }`}
            >
              {gap >= 0 ? '+' : ''}
              {gap.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Test accuracy bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-dark">Test Accuracy</span>
            <span className="text-sm font-mono font-semibold text-blue-700">
              {testPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${testPct}%` }}
              role="progressbar"
              aria-valuenow={testPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Test accuracy: ${testPct.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Warning banners */}
      {severity === 'warning' && (
        <Banner
          variant="warning"
          title="Potential overfitting detected"
          message={`The train-test accuracy gap is ${absGap.toFixed(1)}%. Consider reducing model complexity, increasing training data, or applying regularisation.`}
          className="mt-4"
        />
      )}
      {severity === 'danger' && (
        <Banner
          variant="error"
          title="Significant overfitting detected"
          message={`The train-test accuracy gap is ${absGap.toFixed(1)}%, which exceeds 20%. The model is memorising training data. Reduce complexity, add more data, or try a simpler model.`}
          className="mt-4"
        />
      )}
      {severity === 'none' && (
        <Banner
          variant="success"
          title="No overfitting detected"
          message={`The train-test accuracy gap is only ${absGap.toFixed(1)}%. The model generalises well to unseen data.`}
          className="mt-4"
        />
      )}
    </Card>
  );
}
