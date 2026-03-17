import { Star } from 'lucide-react';
import clsx from 'clsx';
import Card from '../../components/ui/Card';

function getStatusColor(value) {
  if (value >= 0.8) return 'border-emerald-500';
  if (value >= 0.6) return 'border-amber-500';
  return 'border-red-500';
}

function getStatusBg(value) {
  if (value >= 0.8) return 'bg-emerald-50';
  if (value >= 0.6) return 'bg-amber-50';
  return 'bg-red-50';
}

export default function MetricsGrid({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
        Performance Metrics
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className={clsx(
              'bg-white rounded-xl shadow-card border border-border p-4 border-l-4 transition-all',
              getStatusColor(metric.value),
              getStatusBg(metric.value)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {metric.label || metric.name}
              </span>
              {metric.is_priority && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <div className="text-2xl font-bold font-mono text-dark">
              {(metric.value * 100).toFixed(1)}%
            </div>
            {metric.description && (
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                {metric.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
