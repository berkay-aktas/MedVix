import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Card from '../../components/ui/Card';

export default function ROCCurve({ rocData }) {
  if (!rocData?.fpr || !rocData?.tpr) return null;

  // Build chart data from parallel arrays
  const chartData = rocData.fpr.map((fpr, i) => ({
    fpr: parseFloat(fpr.toFixed(4)),
    tpr: parseFloat(rocData.tpr[i].toFixed(4)),
  }));

  // Diagonal reference line data
  const diagonalData = [
    { fpr: 0, tpr: 0 },
    { fpr: 1, tpr: 1 },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          ROC Curve
        </h3>
        <span className="text-xs font-mono font-semibold text-primary bg-primary-bg rounded-full px-3 py-0.5">
          AUC = {rocData.auc?.toFixed(3) ?? 'N/A'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="fpr"
            type="number"
            domain={[0, 1]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#64748B' }}
            label={{
              value: 'False Positive Rate',
              position: 'insideBottom',
              offset: -2,
              style: { fontSize: 11, fill: '#64748B' },
            }}
          />
          <YAxis
            dataKey="tpr"
            type="number"
            domain={[0, 1]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#64748B' }}
            label={{
              value: 'True Positive Rate',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fontSize: 11, fill: '#64748B' },
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            formatter={(value) => [value.toFixed(4)]}
            labelFormatter={(label) => `FPR: ${label}`}
          />
          {/* Diagonal dashed reference line (random classifier) */}
          <ReferenceLine
            segment={diagonalData}
            stroke="#94A3B8"
            strokeDasharray="6 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="tpr"
            stroke="#059669"
            strokeWidth={2}
            fill="#059669"
            fillOpacity={0.15}
            dot={false}
            activeDot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted mt-3 leading-relaxed">
        The ROC curve plots the trade-off between detecting positive cases (True
        Positive Rate, y-axis) and incorrectly flagging negative cases (False
        Positive Rate, x-axis) across every possible decision threshold. The
        dashed diagonal represents a random classifier (AUC&nbsp;=&nbsp;0.50).
        A model that hugs the top-left corner is better at separating the two
        classes.{' '}
        {rocData.auc != null && (
          <span className="font-medium text-dark">
            This model&apos;s AUC of {rocData.auc.toFixed(3)} means it correctly
            ranks a random positive case above a random negative case{' '}
            {(rocData.auc * 100).toFixed(0)}% of the time.
          </span>
        )}
      </p>
    </Card>
  );
}
