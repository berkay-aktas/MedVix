import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Layers, Scale } from 'lucide-react';
import Card from '../../components/ui/Card';
import useDataStore from '../../stores/useDataStore';
import useModalStore from '../../stores/useModalStore';

function getScoreColor(score) {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#D97706';
  return '#DC2626';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}

/**
 * Data Quality Score component for Step 2 (Data Exploration) of the MedVix pipeline.
 * Shows the composite score gauge plus a breakdown derived from the column summary
 * so the right-hand quality card has real density next to the wider class
 * distribution card on its left.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function DataQualityScore() {
  const dataQualityScore = useDataStore((s) => s.dataQualityScore);
  const columnSummary = useDataStore((s) => s.columnSummary);
  const isImbalanced = useDataStore((s) => s.isImbalanced);
  const warnings = useDataStore((s) => s.warnings);
  const openDataInspector = useModalStore((s) => s.openDataInspector);

  const breakdown = useMemo(() => {
    if (!columnSummary || columnSummary.length === 0) return null;

    const total = columnSummary.length;
    let missingSum = 0;
    const cleanColNames = [];
    const someMissingColNames = [];
    const highMissingColNames = [];
    const types = { numeric: 0, categorical: 0, binary: 0, identifier: 0, other: 0 };

    columnSummary.forEach((c) => {
      missingSum += c.missing_pct;
      if (c.action_color === 'green' || c.missing_pct < 5) cleanColNames.push(c.name);
      else if (c.action_color === 'red' || c.missing_pct > 30) highMissingColNames.push(c.name);
      else someMissingColNames.push(c.name);

      const key = ['numeric', 'categorical', 'binary', 'identifier'].includes(c.dtype)
        ? c.dtype
        : 'other';
      types[key] += 1;
    });

    const completeness = Math.max(0, 100 - missingSum / total);

    return {
      total,
      completeness: completeness.toFixed(1),
      cleanColNames,
      someMissingColNames,
      highMissingColNames,
      types,
    };
  }, [columnSummary]);

  // Open the Data Inspector with a pre-filter of the matching columns,
  // and pre-select the first one so its stats panel auto-opens.
  const inspectFiltered = (names) => {
    if (!names || names.length === 0) return;
    openDataInspector({
      filterNames: names,
      initialColumn: names[0],
    });
  };

  if (dataQualityScore === null || dataQualityScore === undefined) return null;

  const color = getScoreColor(dataQualityScore);
  const label = getScoreLabel(dataQualityScore);

  // SVG arc parameters for semicircle gauge
  const radius = 52;
  const circumference = Math.PI * radius;
  const progress = (dataQualityScore / 100) * circumference;

  return (
    <Card title="Data Quality" className="w-56 flex-shrink-0 self-start">
      {/* Gauge */}
      <div className="flex flex-col items-center">
        <svg
          width="120"
          height="72"
          viewBox="0 0 120 72"
          className="overflow-visible"
          aria-label={`Data quality score: ${dataQualityScore} out of 100`}
          role="img"
        >
          <path
            d="M 8 64 A 52 52 0 0 1 112 64"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 8 64 A 52 52 0 0 1 112 64"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-700"
          />
          <text
            x="60"
            y="56"
            textAnchor="middle"
            className="font-mono font-bold"
            style={{ fontSize: '24px', fill: color }}
          >
            {dataQualityScore}
          </text>
        </svg>
        <span className="text-xs font-semibold mt-1" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {/* Completeness */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Completeness
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {breakdown.completeness}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${breakdown.completeness}%` }}
              />
            </div>
          </div>

          {/* Column status — clickable */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1.5">
              Columns ({breakdown.total}) — click to inspect
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {breakdown.cleanColNames.length > 0 && (
                <button
                  type="button"
                  onClick={() => inspectFiltered(breakdown.cleanColNames)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  title={`Inspect ${breakdown.cleanColNames.length} clean column${breakdown.cleanColNames.length === 1 ? '' : 's'}`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="font-mono font-bold">{breakdown.cleanColNames.length}</span>
                  <span>clean</span>
                </button>
              )}
              {breakdown.someMissingColNames.length > 0 && (
                <button
                  type="button"
                  onClick={() => inspectFiltered(breakdown.someMissingColNames)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                  title={`Inspect ${breakdown.someMissingColNames.length} column${breakdown.someMissingColNames.length === 1 ? '' : 's'} with some missing values (5-30%)`}
                >
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-mono font-bold">{breakdown.someMissingColNames.length}</span>
                  <span>amber</span>
                </button>
              )}
              {breakdown.highMissingColNames.length > 0 && (
                <button
                  type="button"
                  onClick={() => inspectFiltered(breakdown.highMissingColNames)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                  title={`Inspect ${breakdown.highMissingColNames.length} column${breakdown.highMissingColNames.length === 1 ? '' : 's'} with high missing values (>30%)`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-mono font-bold">{breakdown.highMissingColNames.length}</span>
                  <span>red</span>
                </button>
              )}
            </div>
          </div>

          {/* Types */}
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted mb-1.5">
              <Layers className="w-3 h-3" />
              Types
            </div>
            <div className="space-y-1 text-[11px]">
              {breakdown.types.numeric > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-main">Numeric</span>
                  <span className="font-mono font-bold text-blue-700">
                    {breakdown.types.numeric}
                  </span>
                </div>
              )}
              {breakdown.types.categorical > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-main">Categorical</span>
                  <span className="font-mono font-bold text-purple-700">
                    {breakdown.types.categorical}
                  </span>
                </div>
              )}
              {breakdown.types.binary > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-main">Binary</span>
                  <span className="font-mono font-bold text-amber-700">
                    {breakdown.types.binary}
                  </span>
                </div>
              )}
              {breakdown.types.identifier > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-main">Identifier</span>
                  <span className="font-mono font-bold text-slate-600">
                    {breakdown.types.identifier}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Class balance */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted mb-1.5">
              <Scale className="w-3 h-3" />
              Class balance
            </div>
            <div
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded ${
                isImbalanced
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isImbalanced ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  Imbalanced
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Balanced
                </>
              )}
            </div>
          </div>

          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Warnings
                </span>
                <span className="font-mono font-bold text-amber-600">
                  {warnings.length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
