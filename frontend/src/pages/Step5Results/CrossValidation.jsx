import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  ReferenceArea,
} from 'recharts';
import Card from '../../components/ui/Card';
import MetricInfoPopover from '../../components/ui/MetricInfoPopover';
import { CHART_EXPLANATIONS } from './chartExplanations';

/**
 * Cross Validation component for Step 5 (Results) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function CrossValidation({ cvData }) {
  if (!cvData?.fold_scores || cvData.fold_scores.length === 0) return null;

  const chartData = cvData.fold_scores.map((score, i) => ({
    name: `Fold ${i + 1}`,
    score: parseFloat(score.toFixed(4)),
  }));

  const mean = cvData.mean;
  const std = cvData.std;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Cross-Validation ({cvData.n_folds}-Fold)
          </h3>
          <MetricInfoPopover explanation={CHART_EXPLANATIONS.cross_validation} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-primary bg-primary-bg rounded-full px-3 py-0.5">
            Mean = {(mean * 100).toFixed(1)}%
          </span>
          <span className="text-xs font-mono font-medium text-muted bg-slate-100 rounded-full px-3 py-0.5">
            Std = {(std * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
          />
          <YAxis
            domain={[0, 1]}
            tickCount={6}
            tick={{ fontSize: 11, fill: '#64748B' }}
            label={{
              value: 'Score',
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
            formatter={(value) => [(value * 100).toFixed(1) + '%', 'Score']}
          />
          {/* Std deviation band */}
          <ReferenceArea
            y1={Math.max(0, mean - std)}
            y2={Math.min(1, mean + std)}
            fill="#059669"
            fillOpacity={0.08}
            strokeOpacity={0}
          />
          {/* Mean line */}
          <ReferenceLine
            y={mean}
            stroke="#059669"
            strokeDasharray="6 4"
            strokeWidth={2}
            label={{
              value: `Mean: ${(mean * 100).toFixed(1)}%`,
              position: 'right',
              style: {
                fontSize: 10,
                fill: '#059669',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
              },
            }}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.score >= mean ? '#059669' : '#10B981'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
