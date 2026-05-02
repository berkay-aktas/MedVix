import { useState, useMemo, useEffect } from 'react';
import { Search, BarChart3, Target, Info, Filter, X } from 'lucide-react';
import clsx from 'clsx';
import Modal from '../ui/Modal';
import useModalStore from '../../stores/useModalStore';
import useDataStore from '../../stores/useDataStore';

/**
 * Data Inspector Modal — full-screen interactive view of the loaded dataset.
 *
 * Features:
 *  1. Search box → filter columns by name in real time
 *  2. Click any column header → slide-in stats panel
 *  3. Target column visually highlighted
 *  4. Sticky row index + sticky column headers (both axes)
 *  5. Comfortable typography for actual readability
 *  6. Footer summary with shown / total counts and target column
 */
export default function DataInspectorModal() {
  const {
    dataInspectorOpen,
    closeDataInspector,
    dataInspectorFilterNames,
    dataInspectorInitialColumn,
  } = useModalStore();
  const { preview, columnSummary, targetColumn } = useDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [filterNames, setFilterNames] = useState(null);

  // When the modal opens, sync the optional preset (filter + selected column)
  useEffect(() => {
    if (dataInspectorOpen) {
      setFilterNames(dataInspectorFilterNames);
      setSelectedColumn(dataInspectorInitialColumn || null);
      setSearchTerm('');
    }
  }, [dataInspectorOpen, dataInspectorFilterNames, dataInspectorInitialColumn]);

  // Map column-name → summary object for fast lookup
  const summaryByName = useMemo(() => {
    const map = {};
    (columnSummary || []).forEach((c) => {
      map[c.name] = c;
    });
    return map;
  }, [columnSummary]);

  // Filter columns: first by the preset filter (if any), then by search term
  const visibleColumns = useMemo(() => {
    if (!preview?.columns) return [];
    let cols = preview.columns;
    if (filterNames && Array.isArray(filterNames) && filterNames.length > 0) {
      const filterSet = new Set(filterNames);
      cols = cols.filter((c) => filterSet.has(c));
    }
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      cols = cols.filter((c) => c.toLowerCase().includes(q));
    }
    return cols;
  }, [preview, searchTerm, filterNames]);

  const selectedSummary = selectedColumn ? summaryByName[selectedColumn] : null;

  // Reset state on open/close so the modal feels fresh each time
  const handleClose = () => {
    setSearchTerm('');
    setSelectedColumn(null);
    setFilterNames(null);
    closeDataInspector();
  };

  if (!preview || !preview.rows?.length) return null;

  const totalCols = preview.columns.length;
  const visibleCount = visibleColumns.length;

  return (
    <Modal
      isOpen={dataInspectorOpen}
      onClose={handleClose}
      title="Data Inspector"
      subtitle={`Search, scroll, click any column header for full statistics. Target = ${targetColumn || '(not set)'}.`}
      width="max-w-[90vw]"
      footer={
        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-dark">{preview.rows.length}</strong> rows ×{' '}
              <strong className="text-dark">{visibleCount}</strong> of{' '}
              <strong className="text-dark">{totalCols}</strong> columns shown
            </span>
            {targetColumn && (
              <>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <Target className="w-3.5 h-3.5" />
                  Target: <strong>{targetColumn}</strong>
                </span>
              </>
            )}
          </div>
          <span>
            Total dataset: {preview.total_rows.toLocaleString()} rows
          </span>
        </div>
      }
    >
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search columns by name..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            aria-label="Search columns by name"
          />
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-xs font-medium text-muted hover:text-dark transition-colors px-2 py-1"
          >
            Clear
          </button>
        )}
        <span className="text-xs text-muted whitespace-nowrap">
          {visibleCount} / {totalCols} columns
        </span>
      </div>

      {/* Active preset filter chip */}
      {filterNames && filterNames.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <Filter className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1">
            Showing only <strong>{filterNames.length}</strong> column{filterNames.length === 1 ? '' : 's'} pre-filtered from the Data Quality breakdown.
          </span>
          <button
            type="button"
            onClick={() => setFilterNames(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
          >
            <X className="w-3 h-3" />
            Show all columns
          </button>
        </div>
      )}

      {/* Body — table + optional inspector panel */}
      <div
        className={clsx(
          'grid gap-4',
          selectedSummary
            ? 'grid-cols-[minmax(0,1fr)_280px]'
            : 'grid-cols-1'
        )}
      >
        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden bg-white">
          <div
            className="overflow-auto scrollbar-thin"
            style={{ maxHeight: '60vh' }}
          >
            {visibleColumns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm text-muted">
                  No columns match "<strong>{searchTerm}</strong>"
                </p>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-medium text-primary hover:underline mt-2"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <table className="text-sm border-separate border-spacing-0" role="table">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 top-0 z-30 bg-slate-100 text-right py-2.5 px-3 font-semibold text-[11px] text-muted uppercase tracking-wide border-b border-r border-border whitespace-nowrap"
                      style={{ minWidth: '60px' }}
                    >
                      Row
                    </th>
                    {visibleColumns.map((col) => {
                      const isTarget = col === targetColumn;
                      const isSelected = col === selectedColumn;
                      return (
                        <th
                          key={col}
                          scope="col"
                          className={clsx(
                            'sticky top-0 z-20 text-left py-2.5 px-3 font-semibold text-xs uppercase tracking-wide border-b border-border whitespace-nowrap cursor-pointer transition-colors',
                            isSelected
                              ? 'bg-primary text-white'
                              : isTarget
                                ? 'bg-emerald-50 text-emerald-800 border-l-2 border-l-primary'
                                : 'bg-slate-50 text-muted hover:bg-slate-100 hover:text-dark'
                          )}
                          onClick={() =>
                            setSelectedColumn(isSelected ? null : col)
                          }
                          title={`Click to inspect column "${col}"`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isTarget && (
                              <Target className="w-3 h-3 flex-shrink-0" />
                            )}
                            <span>{col}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 group transition-colors">
                      <td
                        className="sticky left-0 z-10 bg-slate-100 group-hover:bg-slate-200 text-right py-2 px-3 font-mono text-xs text-muted border-b border-r border-border/60 transition-colors"
                        style={{ minWidth: '60px' }}
                      >
                        {idx + 1}
                      </td>
                      {visibleColumns.map((col) => {
                        const isTarget = col === targetColumn;
                        const isSelected = col === selectedColumn;
                        return (
                          <td
                            key={col}
                            className={clsx(
                              'py-2 px-3 font-mono text-sm whitespace-nowrap border-b border-border/40',
                              isSelected
                                ? 'bg-primary-bg text-primary font-semibold'
                                : isTarget
                                  ? 'bg-emerald-50/50 text-emerald-900 border-l-2 border-l-primary'
                                  : 'text-text-main'
                            )}
                          >
                            {row[col] !== null && row[col] !== undefined
                              ? String(row[col])
                              : <span className="text-slate-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Column inspector panel */}
        {selectedSummary && (
          <ColumnStatsPanel
            summary={selectedSummary}
            isTarget={selectedColumn === targetColumn}
            onClose={() => setSelectedColumn(null)}
          />
        )}
      </div>

      {/* Help banner */}
      <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Click any column header</strong> to view its statistics. The
          target column is highlighted in green.{' '}
          <strong>Search</strong> to filter columns by name in wide datasets.
        </span>
      </div>
    </Modal>
  );
}

/**
 * Side panel showing per-column statistics.
 */
function ColumnStatsPanel({ summary, isTarget, onClose }) {
  if (!summary) return null;

  const isNumeric =
    summary.dtype === 'numeric' &&
    summary.min_val !== null &&
    summary.min_val !== undefined;

  return (
    <div className="border border-border rounded-lg bg-slate-50 p-4 flex flex-col gap-4 self-start sticky top-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isTarget && (
              <Target className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              {isTarget ? 'Target column' : 'Inspecting column'}
            </span>
          </div>
          <h3
            className="font-mono text-sm font-bold text-dark break-all"
            title={summary.name}
          >
            {summary.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-muted hover:text-dark transition-colors"
          aria-label="Close column inspector"
        >
          Close
        </button>
      </div>

      {/* Type pill */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
          Type
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
            summary.dtype === 'numeric' && 'bg-blue-100 text-blue-800',
            summary.dtype === 'categorical' && 'bg-purple-100 text-purple-800',
            summary.dtype === 'binary' && 'bg-amber-100 text-amber-800',
            summary.dtype === 'identifier' && 'bg-slate-200 text-slate-700',
            !['numeric', 'categorical', 'binary', 'identifier'].includes(summary.dtype) &&
              'bg-slate-100 text-slate-700'
          )}
        >
          <BarChart3 className="w-3 h-3" />
          {summary.dtype}
        </span>
      </div>

      {/* Missing rate */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Missing
          </span>
          <span
            className={clsx(
              'text-xs font-mono font-bold',
              summary.missing_pct > 30
                ? 'text-red-600'
                : summary.missing_pct > 5
                  ? 'text-amber-600'
                  : 'text-emerald-600'
            )}
          >
            {summary.missing_pct.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-white rounded overflow-hidden border border-border">
          <div
            className={clsx(
              'h-full transition-all',
              summary.missing_pct > 30
                ? 'bg-red-500'
                : summary.missing_pct > 5
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            )}
            style={{ width: `${Math.min(summary.missing_pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Unique count */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
          Unique values
        </div>
        <div className="text-sm font-mono font-bold text-dark">
          {summary.unique_count?.toLocaleString() ?? '—'}
        </div>
      </div>

      {/* Numeric stats */}
      {isNumeric && (
        <div className="border-t border-border pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
            Numeric range
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white border border-border rounded p-2">
              <div className="text-[10px] text-muted">Min</div>
              <div className="font-mono font-bold text-dark">
                {Number(summary.min_val).toFixed(2)}
              </div>
            </div>
            <div className="bg-white border border-border rounded p-2">
              <div className="text-[10px] text-muted">Max</div>
              <div className="font-mono font-bold text-dark">
                {Number(summary.max_val).toFixed(2)}
              </div>
            </div>
            {summary.mean_val !== null &&
              summary.mean_val !== undefined && (
                <div className="bg-white border border-border rounded p-2">
                  <div className="text-[10px] text-muted">Mean</div>
                  <div className="font-mono font-bold text-dark">
                    {Number(summary.mean_val).toFixed(2)}
                  </div>
                </div>
              )}
            {summary.std_val !== null &&
              summary.std_val !== undefined && (
                <div className="bg-white border border-border rounded p-2">
                  <div className="text-[10px] text-muted">Std</div>
                  <div className="font-mono font-bold text-dark">
                    {Number(summary.std_val).toFixed(2)}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Sample values for non-numeric */}
      {!isNumeric && summary.sample_values?.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
            Sample values
          </div>
          <div className="flex flex-wrap gap-1">
            {summary.sample_values.slice(0, 8).map((v, i) => (
              <span
                key={i}
                className="text-[11px] font-mono bg-white border border-border rounded px-1.5 py-0.5 text-dark"
              >
                {String(v)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
