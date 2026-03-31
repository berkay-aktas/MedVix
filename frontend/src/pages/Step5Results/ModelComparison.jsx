import { Trophy } from 'lucide-react';
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

export default function ModelComparison({ trainedModels, comparison }) {
  if (!trainedModels || trainedModels.length < 2) return null;

  const bestModelId = comparison?.best_model_id;
  const bestByMetric = comparison?.best_by_metric || {};

  // Compute best per column from the models list if comparison data unavailable
  const localBest = {};
  METRIC_COLUMNS.forEach(({ key }) => {
    let bestVal = -1;
    let bestId = null;
    trainedModels.forEach((model) => {
      const val = getMetricValue(model, key);
      if (val != null && val > bestVal) {
        bestVal = val;
        bestId = model.model_id;
      }
    });
    localBest[key] = bestId;
  });

  // Also find best training time (lowest)
  let fastestId = null;
  let fastestTime = Infinity;
  trainedModels.forEach((model) => {
    if (model.training_time_ms < fastestTime) {
      fastestTime = model.training_time_ms;
      fastestId = model.model_id;
    }
  });

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Model Comparison
        </h3>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {trainedModels.map((model) => {
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
                      (bestByMetric[key] || localBest[key]) === model.model_id;

                    return (
                      <td
                        key={key}
                        className={clsx(
                          'text-right py-2.5 px-2 font-mono whitespace-nowrap',
                          isBestForMetric
                            ? 'text-emerald-700 font-bold'
                            : 'text-text-main'
                        )}
                      >
                        {value != null ? (value * 100).toFixed(1) + '%' : '--'}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
