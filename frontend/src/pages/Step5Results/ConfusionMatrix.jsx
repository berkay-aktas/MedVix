import clsx from 'clsx';
import Card from '../../components/ui/Card';
import Banner from '../../components/ui/Banner';

// Cell labels for a 2x2 confusion matrix
const CELL_LABELS_2X2 = [
  ['TN', 'FP'],
  ['FN', 'TP'],
];

function getCellColor(value, maxValue) {
  if (maxValue === 0) return 'bg-slate-100';
  const ratio = value / maxValue;
  if (ratio > 0.7) return 'bg-emerald-600 text-white';
  if (ratio > 0.4) return 'bg-emerald-400 text-white';
  if (ratio > 0.2) return 'bg-emerald-200 text-emerald-900';
  if (ratio > 0.05) return 'bg-emerald-100 text-emerald-800';
  return 'bg-slate-50 text-slate-600';
}

/**
 * Confusion Matrix component for Step 5 (Results) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function ConfusionMatrix({ confusionMatrix }) {
  if (!confusionMatrix?.matrix) return null;

  const { matrix, labels } = confusionMatrix;
  const is2x2 = matrix.length === 2 && matrix[0]?.length === 2;

  // Find max value for color scaling
  const allValues = matrix.flat();
  const maxValue = Math.max(...allValues, 1);

  return (
    <Card>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-4">
        Confusion Matrix
      </h3>

      <div className="flex justify-center">
        <div>
          {/* Column header label */}
          <div className="text-center mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Predicted
            </span>
          </div>

          <div className="flex">
            {/* Row header label */}
            <div className="flex items-center mr-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-wide text-muted"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                Actual
              </span>
            </div>

            <div>
              {/* Column labels */}
              <div className="flex ml-16">
                {(labels || ['Negative', 'Positive']).map((label, i) => (
                  <div
                    key={`col-${i}`}
                    className="w-20 text-center text-xs font-medium text-muted truncate px-1"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Matrix rows */}
              {matrix.map((row, rowIdx) => (
                <div key={`row-${rowIdx}`} className="flex items-center">
                  {/* Row label */}
                  <div className="w-16 text-right pr-3 text-xs font-medium text-muted truncate">
                    {(labels || ['Negative', 'Positive'])[rowIdx]}
                  </div>

                  {/* Cells */}
                  {row.map((value, colIdx) => (
                    <div
                      key={`cell-${rowIdx}-${colIdx}`}
                      className={clsx(
                        'w-20 h-20 flex flex-col items-center justify-center rounded-lg m-0.5 transition-colors',
                        getCellColor(value, maxValue)
                      )}
                    >
                      <span className="text-lg font-bold font-mono">
                        {value}
                      </span>
                      {is2x2 && CELL_LABELS_2X2[rowIdx]?.[colIdx] && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70 mt-0.5">
                          {CELL_LABELS_2X2[rowIdx][colIdx]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical interpretation banners for binary classification */}
      {is2x2 && (
        <div className="mt-4 space-y-2">
          {matrix[1][0] > 0 && (
            <Banner
              variant="error"
              title={`${matrix[1][0]} False Negative${matrix[1][0] > 1 ? 's' : ''}`}
              message="Patients who actually had the condition were predicted as healthy. In clinical screening, these missed diagnoses are the most dangerous errors."
            />
          )}
          {matrix[0][1] > 0 && (
            <Banner
              variant="info"
              title={`${matrix[0][1]} False Positive${matrix[0][1] > 1 ? 's' : ''}`}
              message="Patients without the condition were flagged as at-risk. While safer than missed cases, these lead to unnecessary follow-up procedures and patient anxiety."
            />
          )}
        </div>
      )}
    </Card>
  );
}
