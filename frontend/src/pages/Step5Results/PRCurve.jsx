import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from '../../components/ui/Card';
import MetricInfoPopover from '../../components/ui/MetricInfoPopover';
import { CHART_EXPLANATIONS } from './chartExplanations';

/**
 * P R Curve component for Step 5 (Results) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function PRCurve({ prData }) {
  if (!prData?.recall_values || !prData?.precision_values) return null;

  // Build chart data from parallel arrays
  const chartData = prData.recall_values.map((recall, i) => ({
    recall: parseFloat(recall.toFixed(4)),
    precision: parseFloat(prData.precision_values[i].toFixed(4)),
  }));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Precision-Recall Curve
          </h3>
          <MetricInfoPopover explanation={CHART_EXPLANATIONS.pr_curve} />
        </div>
        <span className="text-xs font-mono font-semibold text-info bg-blue-50 rounded-full px-3 py-0.5">
          AUC = {prData.auc?.toFixed(3) ?? 'N/A'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="recall"
            type="number"
            domain={[0, 1]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#64748B' }}
            label={{
              value: 'Recall',
              position: 'insideBottom',
              offset: -2,
              style: { fontSize: 11, fill: '#64748B' },
            }}
          />
          <YAxis
            dataKey="precision"
            type="number"
            domain={[0, 1]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#64748B' }}
            label={{
              value: 'Precision',
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
            labelFormatter={(label) => `Recall: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="precision"
            stroke="#2563EB"
            strokeWidth={2}
            fill="#2563EB"
            fillOpacity={0.12}
            dot={false}
            activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
