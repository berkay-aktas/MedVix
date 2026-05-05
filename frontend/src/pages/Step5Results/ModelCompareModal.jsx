import { useState, useEffect, useMemo } from 'react';
import { X, GitCompareArrows } from 'lucide-react';
import clsx from 'clsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

const COMPARE_COLORS = ['#059669', '#2563EB', '#D97706', '#7C3AED'];
const MAX_MODELS = 4;

const METRIC_COLUMNS = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'sensitivity', label: 'Sensitivity' },
  { key: 'specificity', label: 'Specificity' },
  { key: 'precision', label: 'Precision' },
  { key: 'f1', label: 'F1' },
  { key: 'auc_roc', label: 'AUC' },
];

function getMetric(model, key) {
  return model.metrics?.find((m) => m.name === key)?.value ?? null;
}

function MiniConfusionMatrix({ result, color }) {
  const cm = result.confusion_matrix;
  if (!cm || !Array.isArray(cm) || cm.length < 2) return null;
  const cells = [
    { label: 'TN', value: cm[0][0], tone: 'good' },
    { label: 'FP', value: cm[0][1], tone: 'bad' },
    { label: 'FN', value: cm[1][0], tone: 'bad' },
    { label: 'TP', value: cm[1][1], tone: 'good' },
  ];
  return (
    <div className="bg-white rounded-lg border border-border p-3 min-w-[180px]">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-xs font-semibold text-dark truncate">
          {result.model_name || result.model_type}
        </span>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1 items-center">
        <span></span>
        <span className="text-[9px] text-muted text-center">Pred −</span>
        <span className="text-[9px] text-muted text-center">Pred +</span>
        <span className="text-[9px] text-muted text-right">Act −</span>
        <div className={clsx('text-center text-[13px] font-mono font-semibold py-1.5 rounded',
          cells[0].tone === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
          {cells[0].value}
        </div>
        <div className={clsx('text-center text-[13px] font-mono font-semibold py-1.5 rounded',
          cells[1].tone === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
          {cells[1].value}
        </div>
        <span className="text-[9px] text-muted text-right">Act +</span>
        <div className={clsx('text-center text-[13px] font-mono font-semibold py-1.5 rounded',
          cells[2].tone === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
          {cells[2].value}
        </div>
        <div className={clsx('text-center text-[13px] font-mono font-semibold py-1.5 rounded',
          cells[3].tone === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
          {cells[3].value}
        </div>
      </div>
    </div>
  );
}

export default function ModelCompareModal({ open, onClose, trainedModels, defaultActiveId }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // When opened, default to ALL trained models (capped at MAX_MODELS).
  useEffect(() => {
    if (!open) return;
    const initial = new Set(trainedModels.slice(0, MAX_MODELS).map((m) => m.model_id));
    setSelectedIds(initial);
  }, [open, trainedModels]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const selectedModels = useMemo(
    () => trainedModels.filter((m) => selectedIds.has(m.model_id)),
    [trainedModels, selectedIds]
  );

  const toggleModel = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // keep at least 1
      } else {
        if (next.size < MAX_MODELS) next.add(id);
      }
      return next;
    });
  };

  if (!open) return null;

  const rocSeries = selectedModels
    .map((m, i) => {
      const roc = m.roc_curve;
      if (!roc?.fpr || !roc?.tpr) return null;
      const data = roc.fpr.map((fpr, idx) => ({
        fpr: parseFloat(fpr.toFixed(4)),
        tpr: parseFloat(roc.tpr[idx].toFixed(4)),
      }));
      return {
        id: m.model_id,
        name: m.model_name || m.model_type,
        color: COMPARE_COLORS[i % COMPARE_COLORS.length],
        data,
        auc: roc.auc,
      };
    })
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-slate-900/60 animate-fade-in overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Model Comparison"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 rounded-2xl shadow-2xl border border-border w-full max-w-[1200px] my-auto animate-scale-in origin-top"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-t-2xl border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-bg text-primary flex items-center justify-center">
              <GitCompareArrows className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-dark">Side-by-side model comparison</h2>
              <p className="text-[11px] text-muted">Toggle which models to compare. Up to {MAX_MODELS} at once.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg text-muted hover:text-dark hover:bg-slate-50 inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model selector */}
        <div className="px-6 pt-4 pb-3 flex items-center gap-2 flex-wrap">
          {trainedModels.map((m, i) => {
            const isSelected = selectedIds.has(m.model_id);
            const colorIdx = selectedModels.findIndex((s) => s.model_id === m.model_id);
            const color = colorIdx >= 0 ? COMPARE_COLORS[colorIdx % COMPARE_COLORS.length] : null;
            return (
              <button
                key={m.model_id}
                type="button"
                onClick={() => toggleModel(m.model_id)}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                  isSelected
                    ? 'bg-white text-dark border-border shadow-sm'
                    : 'bg-slate-100 text-muted border-transparent hover:bg-slate-200'
                )}
                aria-pressed={isSelected}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: isSelected ? color : '#CBD5E1' }}
                />
                {m.model_name || m.model_type}
                {m.model_id === defaultActiveId && (
                  <span className="text-[9px] font-bold uppercase text-primary">Active</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Metrics row */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Metrics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-[11px] uppercase tracking-wider text-muted">Model</th>
                    {METRIC_COLUMNS.map((c) => (
                      <th key={c.key} className="text-right px-3 py-2 font-semibold text-[11px] uppercase tracking-wider text-muted">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedModels.map((m, i) => {
                    const color = COMPARE_COLORS[i % COMPARE_COLORS.length];
                    return (
                      <tr key={m.model_id} className="border-t border-border">
                        <td className="px-4 py-2.5 text-sm font-medium text-dark">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                            {m.model_name || m.model_type}
                          </span>
                        </td>
                        {METRIC_COLUMNS.map((c) => {
                          const v = getMetric(m, c.key);
                          return (
                            <td key={c.key} className="px-3 py-2.5 text-right text-sm font-mono text-dark">
                              {v == null ? '—' : v.toFixed(3)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROC overlay */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              ROC Curves Overlaid
            </h3>
            {rocSeries.length === 0 ? (
              <p className="text-sm text-muted italic py-8 text-center">No ROC data available for the selected models.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    dataKey="fpr"
                    domain={[0, 1]}
                    tickCount={6}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, style: { fontSize: 11, fill: '#64748B' } }}
                  />
                  <YAxis
                    type="number"
                    domain={[0, 1]}
                    tickCount={6}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#64748B' } }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(value) => [Number(value).toFixed(4)]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <ReferenceLine
                    segment={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                    stroke="#94A3B8"
                    strokeDasharray="6 4"
                    strokeWidth={1}
                  />
                  {rocSeries.map((s) => (
                    <Line
                      key={s.id}
                      data={s.data}
                      type="monotone"
                      dataKey="tpr"
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      name={`${s.name}${s.auc != null ? ` (AUC ${s.auc.toFixed(3)})` : ''}`}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Confusion matrices */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Confusion Matrices
            </h3>
            <div className="flex gap-3 flex-wrap">
              {selectedModels.map((m, i) => (
                <MiniConfusionMatrix
                  key={m.model_id}
                  result={m}
                  color={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
