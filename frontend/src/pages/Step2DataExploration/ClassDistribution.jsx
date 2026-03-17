import Card from '../../components/ui/Card';
import Banner from '../../components/ui/Banner';
import useDataStore from '../../stores/useDataStore';

const CLASS_COLORS = ['#059669', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ClassDistribution() {
  const classDistribution = useDataStore((s) => s.classDistribution);
  const isImbalanced = useDataStore((s) => s.isImbalanced);
  const imbalanceWarning = useDataStore((s) => s.imbalanceWarning);

  if (!classDistribution?.length) return null;

  const maxCount = Math.max(...classDistribution.map((c) => c.count));

  return (
    <Card title="Class Distribution">
      <div className="space-y-3">
        {classDistribution.map((cls, idx) => (
          <div key={cls.class_name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-dark">
                {cls.class_name}
              </span>
              <span className="text-xs font-mono text-muted">
                {cls.count.toLocaleString()} ({cls.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(cls.count / maxCount) * 100}%`,
                  backgroundColor: CLASS_COLORS[idx % CLASS_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {isImbalanced && (
        <Banner
          variant="warning"
          title="Class imbalance detected"
          message={
            imbalanceWarning ||
            'Consider enabling SMOTE in Step 3 to balance your classes.'
          }
          className="mt-4"
        />
      )}
    </Card>
  );
}
