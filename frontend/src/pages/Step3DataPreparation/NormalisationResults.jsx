import Card from '../../components/ui/Card';

export default function NormalisationResults({ preparationResult }) {
  const { before_after_stats, normalisation } = preparationResult;

  if (!before_after_stats?.length && !normalisation) return null;

  // Use before_after_stats for bar comparison (top 3 features)
  const topFeatures = (before_after_stats || []).slice(0, 3);

  return (
    <Card title="Before / After Normalisation">
      {topFeatures.length > 0 ? (
        <div className="space-y-5">
          {topFeatures.map((item) => {
            const beforeRange = Math.abs(item.before.max - item.before.min);
            const afterRange = Math.abs(item.after.max - item.after.min);
            const maxRange = Math.max(beforeRange, afterRange, 1);

            return (
              <div key={item.column}>
                <div className="text-xs font-mono font-medium text-dark mb-2">
                  {item.column}
                </div>
                <div className="space-y-1.5">
                  {/* Before bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-muted w-12 text-right">
                      Before
                    </span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-slate-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${(beforeRange / maxRange) * 100}%`,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-medium text-slate-700">
                        {item.before.min.toFixed(2)} - {item.before.max.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {/* After bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-primary w-12 text-right">
                      After
                    </span>
                    <div className="flex-1 h-5 bg-primary-bg rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${(afterRange / maxRange) * 100}%`,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-medium text-emerald-700">
                        {item.after.min.toFixed(2)} - {item.after.max.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : normalisation ? (
        <div className="text-xs text-muted">
          <p>
            Method: <span className="font-semibold">{normalisation.method}</span>
          </p>
          <p className="mt-1">
            Columns normalised:{' '}
            {normalisation.columns_normalised?.length || 0}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
