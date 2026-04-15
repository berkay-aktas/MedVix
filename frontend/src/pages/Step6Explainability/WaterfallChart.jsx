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

  // SVG layout constants
  const svgWidth = 500;
  const barAreaStart = 160;
  const barAreaWidth = 260;
  const effectX = 430;
  const rowHeight = 38;
  const svgHeight = bars.length * rowHeight + 10;

  // Compute range for scaling
  const allShapAbs = bars.map((b) => Math.abs(b.shap_value));
  const maxShap = Math.max(...allShapAbs, 0.01);
  const range = maxShap * 2.5;

  const probToX = (offset) => barAreaStart + barAreaWidth / 2 + (offset / range) * barAreaWidth;

  let cumOffset = 0;

  return (
    <div>
      {/* Baseline */}
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-dashed border-border text-xs">
        <span className="font-medium text-muted">Base value</span>
        <span className="font-mono font-semibold text-muted">{base_probability.toFixed(2)}</span>
        <span className="text-[11px] text-muted">(average model output)</span>
      </div>

      {/* SVG Waterfall */}
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="block">
        <defs>
          <linearGradient id="wfRedGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
          <linearGradient id="wfGreenGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Base value center line */}
        <line x1={probToX(0)} y1="0" x2={probToX(0)} y2={svgHeight} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4,3" />

        {bars.map((bar, i) => {
          const y = i * rowHeight + 4;
          const isRisk = bar.direction === 'risk';
          const barPixelWidth = Math.max(Math.abs(bar.shap_value / range) * barAreaWidth, 3);

          const startX = probToX(cumOffset);
          const barX = isRisk ? startX : startX - barPixelWidth;

          cumOffset += bar.shap_value;
          const nextStartX = probToX(cumOffset);

          return (
            <g key={bar.feature_name}>
              {/* Feature label */}
              <text x="0" y={y + 14} fontFamily="Inter,sans-serif" fontSize="12" fill="#334155">
                {bar.display_name}
              </text>
              <text x="0" y={y + 26} fontFamily="JetBrains Mono,monospace" fontSize="10" fill="#64748B">
                = {bar.feature_value}
              </text>

              {/* Bar */}
              <rect
                x={barX}
                y={y + 4}
                width={barPixelWidth}
                height={22}
                rx={4}
                fill={isRisk ? 'url(#wfRedGrad)' : 'url(#wfGreenGrad)'}
              />

              {/* Connector line to next bar */}
              {i < bars.length - 1 && (
                <line x1={nextStartX} y1={y + 26} x2={nextStartX} y2={y + rowHeight + 4} stroke="#CBD5E1" strokeWidth="1" />
              )}

              {/* Effect value */}
              <text x={effectX} y={y + 18} fontFamily="JetBrains Mono,monospace" fontSize="12" fontWeight="600" fill={isRisk ? '#DC2626' : '#059669'}>
                {isRisk ? '+' : ''}{bar.shap_value.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Prediction */}
      <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-dashed border-border">
        <span className="font-semibold text-xs text-dark">Prediction</span>
        <span className={`font-mono font-semibold text-[13px] ${prediction_class === 'positive' ? 'text-danger' : 'text-primary'}`}>
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
      <div className="mt-4 px-4 py-3.5 border-l-[3px] border-primary bg-primary-bg rounded-r-lg text-[13px] text-slate-700 leading-relaxed">
        {summary_text}
      </div>
    </div>
  );
}
