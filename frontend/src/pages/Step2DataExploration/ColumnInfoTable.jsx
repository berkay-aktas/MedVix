import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';

function getMissingColor(pct) {
  if (pct > 30) return 'red';
  if (pct > 5) return 'amber';
  return 'green';
}

export default function ColumnInfoTable({ columns }) {
  if (!columns?.length) return null;

  return (
    <Card title="Column Information">
      <div className="overflow-x-auto scrollbar-thin -mx-5 px-5">
        <table className="w-full text-xs" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold text-muted uppercase tracking-wide">
                Feature Name
              </th>
              <th className="text-left py-2 px-3 font-semibold text-muted uppercase tracking-wide">
                Type
              </th>
              <th className="text-left py-2 px-3 font-semibold text-muted uppercase tracking-wide w-40">
                Missing %
              </th>
              <th className="text-left py-2 px-3 font-semibold text-muted uppercase tracking-wide">
                Range
              </th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr
                key={col.name}
                className="border-b border-border/50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-2.5 px-3">
                  <span className="font-mono font-medium text-dark">
                    {col.name}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <Badge
                    variant={
                      col.dtype === 'numeric'
                        ? 'numeric'
                        : col.dtype === 'categorical'
                          ? 'categorical'
                          : col.dtype === 'binary'
                            ? 'binary'
                            : 'default'
                    }
                  >
                    {col.dtype}
                  </Badge>
                </td>
                <td className="py-2.5 px-3">
                  <ProgressBar
                    value={col.missing_pct}
                    color={getMissingColor(col.missing_pct)}
                    showValue
                  />
                </td>
                <td className="py-2.5 px-3 font-mono text-muted">
                  {col.min_val !== null && col.max_val !== null
                    ? `${Number(col.min_val).toFixed(1)} - ${Number(col.max_val).toFixed(1)}`
                    : `${col.unique_count} unique`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
