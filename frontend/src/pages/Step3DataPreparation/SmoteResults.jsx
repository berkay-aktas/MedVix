import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

const CLASS_COLORS = ['#059669', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function SmoteResults({ smote }) {
  if (!smote?.applied) return null;

  const beforeDist = smote.before_distribution || {};
  const afterDist = smote.after_distribution || {};
  const allClasses = [
    ...new Set([...Object.keys(beforeDist), ...Object.keys(afterDist)]),
  ];

  const beforeMax = Math.max(...Object.values(beforeDist), 1);
  const afterMax = Math.max(...Object.values(afterDist), 1);

  return (
    <Card title="Before / After SMOTE Class Balance">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Before SMOTE */}
        <div>
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Before SMOTE
          </h4>
          <div className="space-y-2">
            {allClasses.map((cls, idx) => {
              const count = beforeDist[cls] || 0;
              return (
                <div key={cls}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-medium text-dark">{cls}</span>
                    <span className="text-xs font-mono text-muted">
                      {count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / beforeMax) * 100}%`,
                        backgroundColor: CLASS_COLORS[idx % CLASS_COLORS.length],
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* After SMOTE */}
        <div>
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            After SMOTE
          </h4>
          <div className="space-y-2">
            {allClasses.map((cls, idx) => {
              const count = afterDist[cls] || 0;
              const beforeCount = beforeDist[cls] || 0;
              const isSynthetic = count > beforeCount;
              return (
                <div key={cls}>
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-dark">
                        {cls}
                      </span>
                      {isSynthetic && (
                        <Badge variant="binary" className="text-[9px] py-0">
                          +{(count - beforeCount).toLocaleString()} synthetic
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted">
                      {count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / afterMax) * 100}%`,
                        backgroundColor: CLASS_COLORS[idx % CLASS_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {smote.synthetic_samples > 0 && (
            <p className="text-[10px] text-muted mt-2">
              {smote.synthetic_samples.toLocaleString()} synthetic samples
              generated
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
