import { BarChart3, Info } from 'lucide-react';

/**
 * Feature Importance Chart component for Step 6 (Explainability) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function FeatureImportanceChart({ features }) {
  if (!features || features.length === 0) return null;

  const maxImportance = Math.max(...features.map((f) => f.importance));

  return (
    <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
      <div className="px-5 pt-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-md bg-primary-bg text-primary flex items-center justify-center">
          <BarChart3 className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-semibold text-dark">Feature importance (SHAP values)</h3>
      </div>
      <div className="px-5 py-4">
        <div className="space-y-2.5">
          {features.map((feature) => {
            const widthPct = maxImportance > 0 ? (feature.importance / maxImportance) * 100 : 0;
            return (
              <div key={feature.feature_name} className="flex items-start gap-3">
                <span
                  className="w-[220px] text-right text-[13px] text-slate-700 shrink-0 leading-snug pt-1"
                  title={feature.display_name}
                >
                  {feature.display_name}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-md relative overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-md transition-all duration-300"
                    style={{
                      width: `${widthPct}%`,
                      background: 'linear-gradient(90deg, #059669, #10B981)',
                    }}
                  />
                </div>
                <span className="w-12 text-left text-xs font-semibold text-primary font-mono shrink-0 pt-1.5">
                  {feature.importance.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-center text-[11px] text-muted mt-2 pt-2 border-t border-border">
          Mean |SHAP value| (average impact on model output)
        </div>
        <div className="flex items-center gap-1.5 mt-3 px-3 py-2.5 bg-primary-bg rounded-lg text-xs text-primary leading-relaxed">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Higher SHAP values indicate greater influence on model predictions
        </div>
      </div>
    </div>
  );
}
