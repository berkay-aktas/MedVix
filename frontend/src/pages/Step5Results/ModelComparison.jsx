import { useState, useEffect } from 'react';
import { Trophy, Plus, X, LayoutGrid } from 'lucide-react';
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
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function ModelComparison({ trainedModels, comparison }) {
  const [comparedIds, setComparedIds] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auto-add the first model when it appears
  useEffect(() => {
    if (trainedModels?.length > 0 && comparedIds.length === 0) {
      setComparedIds([trainedModels[trainedModels.length - 1].model_id]);
    }
  }, [trainedModels]);

  if (!trainedModels || trainedModels.length === 0) return null;

  const comparedModels = trainedModels.filter((m) =>
    comparedIds.includes(m.model_id)
  );
  const availableToAdd = trainedModels.filter(
    (m) => !comparedIds.includes(m.model_id)
  );

  const addModel = (modelId) => {
    if (!comparedIds.includes(modelId)) {
      setComparedIds((prev) => [...prev, modelId]);
    }
    setDropdownOpen(false);
  };

  const removeModel = (modelId) => {
    setComparedIds((prev) => prev.filter((id) => id !== modelId));
  };

  const addAll = () => {
    setComparedIds(trainedModels.map((m) => m.model_id));
    setDropdownOpen(false);
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
            {comparedModels.length} / {trainedModels.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare All button */}
          {availableToAdd.length > 1 && (
            <button
              type="button"
              onClick={addAll}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted border border-border rounded-lg px-2.5 py-1 hover:border-primary hover:text-primary transition-colors"
            >
              <LayoutGrid className="w-3 h-3" />
              Compare All
            </button>
          )}

          {/* + Compare dropdown */}
          {availableToAdd.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-primary rounded-lg px-3 py-1.5 hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Compare
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-xl shadow-modal py-1 min-w-[180px]">
                    {availableToAdd.map((model) => (
                      <button
                        key={model.model_id}
                        type="button"
                        onClick={() => addModel(model.model_id)}
                        className="w-full text-left px-3 py-2 text-sm text-dark hover:bg-slate-50 transition-colors"
                      >
                        {model.model_name || model.model_type}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {comparedModels.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          Click <strong>+ Compare</strong> to add models to the comparison
          table.
        </p>
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
                      {comparedModels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModel(model.model_id)}
                          className="p-1 text-muted hover:text-red-500 transition-colors rounded"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
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
