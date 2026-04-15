import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, AlertTriangle } from 'lucide-react';

export default function TrainingDataChart({ comparisonData }) {
  if (!comparisonData || comparisonData.length === 0) return null;

  const chartData = comparisonData.map((item) => ({
    name: item.group_name,
    'Training Data': Math.round(item.training_pct),
    'Real Population': Math.round(item.population_pct),
  }));

  const hasWarning = comparisonData.some((item) => item.has_warning);
  const warningGroups = comparisonData
    .filter((item) => item.has_warning)
    .map((item) => item.group_name);

  return (
    <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
      <div className="px-5 pt-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-md bg-amber-50 text-warning flex items-center justify-center">
          <BarChart3 className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-semibold text-dark">Training data representation</h3>
      </div>
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              formatter={(value) => [`${value}%`]}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Training Data" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Real Population" fill="#94A3B8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {hasWarning && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-3">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-800 leading-relaxed">
              Training data may not represent the real population for: <strong>{warningGroups.join(', ')}</strong>.
              Gaps exceeding 15 percentage points may affect model fairness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
