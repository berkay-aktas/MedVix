import Card from '../../components/ui/Card';

/**
 * Data Preview component for Step 2 (Data Exploration) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function DataPreview({ preview }) {
  if (!preview || !preview.rows?.length) return null;

  return (
    <Card title="Data Preview">
      <div className="overflow-x-auto scrollbar-thin -mx-5 px-5">
        <table className="w-full text-xs" role="table">
          <thead>
            <tr className="border-b border-border">
              {preview.columns.map((col) => (
                <th
                  key={col}
                  className="text-left py-2 px-3 font-semibold text-muted uppercase tracking-wide whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-border/50 hover:bg-slate-50 transition-colors"
              >
                {preview.columns.map((col) => (
                  <td
                    key={col}
                    className="py-2 px-3 font-mono text-text-main whitespace-nowrap"
                  >
                    {row[col] !== null && row[col] !== undefined
                      ? String(row[col])
                      : '--'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[10px] text-muted text-right">
        Showing {preview.rows.length} of {preview.total_rows.toLocaleString()}{' '}
        rows
      </div>
    </Card>
  );
}
