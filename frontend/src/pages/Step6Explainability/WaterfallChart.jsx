import { AlertTriangle, Shield } from 'lucide-react';

export default function WaterfallChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted text-sm">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        Computing patient explanation...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-sm text-muted">
        Select a patient above to see their individual explanation.
      </div>
    );
  }

  const { bars, base_probability, final_probability, prediction_label, prediction_class, summary_text } = data;

  // Find max absolute SHAP for scaling bars
  const maxAbsShap = Math.max(...bars.map((b) => Math.abs(b.shap_value)), 0.01);

  return (
    <div>
      {/* Baseline */}
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-dashed border-border text-xs">
        <span className="font-medium text-muted">Base value</span>
        <span className="font-mono font-semibold text-muted">{base_probability.toFixed(2)}</span>
        <span className="text-[11px] text-slate-400">(average model output)</span>
      </div>

      {/* Feature rows */}
      <div className="space-y-2.5">
        {bars.map((bar) => {
          const isRisk = bar.direction === 'risk';
          const barPct = Math.max((Math.abs(bar.shap_value) / maxAbsShap) * 100, 4);

          return (
            <div key={bar.feature_name}>
              {/* Label row */}
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[12px] font-medium text-dark leading-tight">
                  {bar.display_name}
                </span>
                <span className={`text-[12px] font-bold font-mono shrink-0 ml-2 ${isRisk ? 'text-danger' : 'text-primary'}`}>
                  {isRisk ? '+' : ''}{bar.shap_value.toFixed(3)}
                </span>
              </div>
              {/* Bar + value row */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 w-14 shrink-0">
                  {bar.feature_value}
                </span>
                <div className="flex-1 h-4 bg-slate-50 rounded overflow-hidden relative">
                  {isRisk ? (
                    <div className="absolute left-1/2 top-0 h-full rounded-r" style={{
                      width: `${barPct / 2}%`,
                      background: 'linear-gradient(90deg, #EF4444, #F87171)',
                    }} />
                  ) : (
                    <div className="absolute top-0 h-full rounded-l" style={{
                      width: `${barPct / 2}%`,
                      right: '50%',
                      background: 'linear-gradient(90deg, #059669, #10B981)',
                    }} />
                  )}
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 w-px h-full bg-slate-300" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prediction */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-dashed border-border">
        <span className="font-semibold text-xs text-dark">Prediction</span>
        <span className={`font-mono font-semibold text-sm ${prediction_class === 'positive' ? 'text-danger' : 'text-primary'}`}>
          {final_probability.toFixed(2)}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
          prediction_class === 'positive' ? 'bg-red-50 text-danger' : 'bg-primary-bg text-primary'
        }`}>
          {prediction_class === 'positive' ? <AlertTriangle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
          {prediction_label}
        </span>
      </div>

      {/* Summary */}
      <div className="mt-3 px-3.5 py-3 border-l-[3px] border-primary bg-primary-bg rounded-r-lg text-[12px] text-slate-600 leading-relaxed">
        {summary_text}
      </div>
    </div>
  );
}
