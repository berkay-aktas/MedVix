import { ArrowLeftRight, Maximize2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import useModalStore from '../../stores/useModalStore';

/**
 * Data Preview component for Step 2 (Data Exploration) of the MedVix pipeline.
 * Renders a horizontally scrollable preview table with a sticky row-index
 * column. For deeper inspection, users open the full Data Inspector modal.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function DataPreview({ preview }) {
  const openDataInspector = useModalStore((s) => s.openDataInspector);
  if (!preview || !preview.rows?.length) return null;

  const colCount = preview.columns.length;
  const isWide = colCount > 8;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Data Preview
        </h3>
        <button
          type="button"
          onClick={openDataInspector}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-primary hover:bg-emerald-700 rounded-lg px-3 py-1.5 transition-colors shadow-sm"
        >
          <Maximize2 className="w-3 h-3" />
          Open Data Inspector
        </button>
      </div>
      {isWide && (
        <div className="flex items-center gap-2 mb-2 text-[11px] text-muted">
          <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
          <span>
            <strong className="text-dark">{colCount} columns</strong> — scroll
            sideways here, or use the inspector for search and column statistics.
          </span>
        </div>
      )}
      <div className="overflow-x-auto scrollbar-thin -mx-5 relative" style={{ scrollbarColor: '#94a3b8 transparent' }}>
        <table className="text-xs border-separate border-spacing-0" role="table">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-slate-50 text-right py-2 px-2.5 font-semibold text-[10px] text-muted uppercase tracking-wide border-b border-r border-border whitespace-nowrap"
                style={{ minWidth: '52px' }}
              >
                Row
              </th>
              {preview.columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="text-left py-2 px-3 font-semibold text-muted uppercase tracking-wide whitespace-nowrap border-b border-border bg-white"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 group transition-colors">
                <td
                  className="sticky left-0 z-10 bg-slate-50 group-hover:bg-slate-100 text-right py-2 px-2.5 font-mono text-[10px] text-muted border-b border-r border-border/50 transition-colors"
                  style={{ minWidth: '52px' }}
                >
                  {idx + 1}
                </td>
                {preview.columns.map((col) => (
                  <td
                    key={col}
                    className="py-2 px-3 font-mono text-text-main whitespace-nowrap border-b border-border/50"
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
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
        <span>
          {colCount} columns × {preview.rows.length} rows shown
        </span>
        <span>
          Total dataset: {preview.total_rows.toLocaleString()} rows
        </span>
      </div>
    </Card>
  );
}
