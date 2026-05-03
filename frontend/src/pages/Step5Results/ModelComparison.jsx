import { useState } from 'react';
import { Trophy, Eye, X } from 'lucide-react';
import clsx from 'clsx';
import Card from '../../components/ui/Card';

const METRIC_COLUMNS = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'sensitivity', label: 'Sensitivity' },
  { key: 'specificity', label: 'Specificity' },
  { key: 'precision', label: 'Precision' },
  { key: 'f1', label: 'F1' },
  { key: 'auc_roc', label: 'AUC-ROC' },
];

function getMetricValue(model, metricKey) {
  const metric = model.metrics?.find((m) => m.name === metricKey);
  return metric?.value ?? null;
}

function getSensitivityColor(value) {
  if (value == null) return 'text-text-main';
  if (value >= 0.8) return 'text-emerald-700';
  if (value >= 0.6) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Model Comparison component for Step 5 (Results) of the MedVix pipeline.
 * Auto-includes every trained model; users can hide and unhide individual
 * models with the X / Show buttons.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function ModelComparison({ trainedModels, comparison }) {
  // Track which model_ids the user has explicitly hidden.
  // Default: nothing hidden — every trained model auto-appears.
  const [hiddenIds, setHiddenIds] = useState(() => new Set());

  if (!trainedModels || trainedModels.length === 0) return null;

  const comparedModels = trainedModels.filter((m) => !hiddenIds.has(m.model_id));
  const hiddenCount = trainedModels.length - comparedModels.length;

  const removeModel = (modelId) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(modelId);
      return next;
    });
  };

  const showAll = () => {
    setHiddenIds(new Set());
  };

  const bestModelId = comparison?.best_model_id;
  const bestByMetric = comparison?.best_by_metric || {};

  // Compute best per column from compared models
  const localBest = {};
  METRIC_COLUMNS.forEach(({ key }) => {
    let bestVal = -1;
    let bestId = null;
    comparedModels.forEach((model) => {
      const val = getMetricValue(model, key);
      if (val != null && val > bestVal) {
        bestVal = val;
        bestId = model.model_id;
      }
    });
    localBest[key] = bestId;
  });

  // Find fastest training time among compared models
  let fastestId = null;
  let fastestTime = Infinity;
  comparedModels.forEach((model) => {
    if (model.training_time_ms < fastestTime) {
      fastestTime = model.training_time_ms;
      fastestId = model.model_id;
    }
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Model Comparison
          </h3>
          <span className="text-[10px] font-mono text-muted bg-slate-100 rounded-full px-2 py-0.5">
            {comparedModels.length} of {trainedModels.length} shown
          </span>
        </div>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={showAll}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary border border-primary rounded-lg px-2.5 py-1 hover:bg-primary-bg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Show all ({hiddenCount} hidden)
          </button>
        )}
      </div>

      {comparedModels.length === 0 ? (
        <div className="text-sm text-muted text-center py-6">
          All trained models are hidden.{' '}
          <button
            type="button"
            onClick={showAll}
            className="text-primary font-semibold hover:underline"
          >
            Show all
          </button>
          {' '}to compare them.
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
                  Model
                </th>
                {METRIC_COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    className="text-right py-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
                <th className="text-right py-2 pl-2 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
                  Time
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {comparedModels.map((model) => {
                const isBestOverall =
                  bestModelId && model.model_id === bestModelId;

                return (
                  <tr
                    key={model.model_id}
                    className={clsx(
                      'border-b border-border/50 last:border-b-0',
                      isBestOverall && 'bg-primary-bg'
                    )}
                  >
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-dark">
                          {model.model_name || model.model_type}
                        </span>
                        {isBestOverall && (
                          <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    {METRIC_COLUMNS.map(({ key }) => {
                      const value = getMetricValue(model, key);
                      const isBestForMetric =
                        (bestByMetric[key] || localBest[key]) ===
                        model.model_id;
                      const isSensitivity = key === 'sensitivity';

                      return (
                        <td
                          key={key}
                          className={clsx(
                            'text-right py-2.5 px-2 font-mono whitespace-nowrap',
                            isBestForMetric
                              ? 'text-emerald-700 font-bold'
                              : isSensitivity
                                ? getSensitivityColor(value)
                                : 'text-text-main'
                          )}
                        >
                          {value != null
                            ? (value * 100).toFixed(1) + '%'
                            : '--'}
                        </td>
                      );
                    })}
                    <td
                      className={clsx(
                        'text-right py-2.5 pl-2 font-mono whitespace-nowrap',
                        fastestId === model.model_id
                          ? 'text-emerald-700 font-bold'
                          : 'text-text-main'
                      )}
                    >
                      {model.training_time_ms != null
                        ? `${model.training_time_ms}ms`
                        : '--'}
                    </td>
                    <td className="py-2.5 pl-1">
                      <button
                        type="button"
                        onClick={() => removeModel(model.model_id)}
                        className="p-1 text-muted hover:text-red-500 transition-colors rounded"
                        title="Hide from comparison"
                        aria-label={`Hide ${model.model_name || model.model_type} from comparison`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
