import { Users } from 'lucide-react';

function Badge({ value, status }) {
  const colorMap = {
    OK: 'bg-emerald-50 text-primary',
    Review: 'bg-amber-50 text-warning',
    Warning: 'bg-red-50 text-danger',
    Baseline: 'bg-slate-100 text-muted',
  };
  const cls = colorMap[status] || colorMap.Baseline;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${cls}`}>
      {value > 0 ? '+' : ''}{value}%
    </span>
  );
}

function SensitivityCell({ value }) {
  const pct = (value * 100).toFixed(0);
  const color = value >= 0.8 ? 'text-primary' : value >= 0.6 ? 'text-warning' : 'text-danger';
  return <td className={`px-3.5 py-2.5 font-mono text-[13px] font-medium ${color}`}>{pct}%</td>;
}

/**
 * Subgroup Table component for Step 7 (Ethics & Bias Audit) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function SubgroupTable({ subgroups, overallSensitivity }) {
  if (!subgroups || subgroups.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
      <div className="px-5 pt-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-md bg-blue-50 text-info flex items-center justify-center">
          <Users className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-semibold text-dark">Fairness metrics by subgroup</h3>
      </div>
      <div className="px-5 py-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b-2 border-border bg-slate-50/50">
              <th className="text-left px-3.5 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-muted">Subgroup</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-muted">N</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-muted">Accuracy</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-muted">Sensitivity</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-muted">Specificity</th>
              <th className="text-left px-3.5 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-muted">Disparity</th>
            </tr>
          </thead>
          <tbody>
            {subgroups.map((sg) => (
              <tr key={sg.subgroup_name} className="border-b border-border last:border-b-0">
                <td className="px-3.5 py-2.5 font-semibold text-dark">{sg.subgroup_name}</td>
                <td className="px-3.5 py-2.5 font-mono text-[13px] font-medium">{sg.n}</td>
                <td className="px-3.5 py-2.5 font-mono text-[13px] font-medium">{(sg.accuracy * 100).toFixed(0)}%</td>
                <SensitivityCell value={sg.sensitivity} />
                <td className="px-3.5 py-2.5 font-mono text-[13px] font-medium">{(sg.specificity * 100).toFixed(0)}%</td>
                <td className="px-3.5 py-2.5">
                  <Badge value={sg.disparity_pp} status={sg.fairness_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
