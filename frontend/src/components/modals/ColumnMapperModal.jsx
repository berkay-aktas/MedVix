import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Banner from '../ui/Banner';
import useModalStore from '../../stores/useModalStore';
import useDataStore from '../../stores/useDataStore';
import usePipelineStore from '../../stores/usePipelineStore';
import api from '../../utils/api';

export default function ColumnMapperModal() {
  const { columnMapperOpen, closeColumnMapper } = useModalStore();
  const {
    sessionId,
    columnSummary,
    targetColumn: storeTarget,
    setSchemaOK,
    setTargetColumn,
  } = useDataStore();
  const { domainDetail, completeStep } = usePipelineStore();

  // Local mapping state: { columnName: 'feature'|'target'|'ignore' }
  const [mappings, setMappings] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Initialize mappings when modal opens
  useEffect(() => {
    if (columnMapperOpen && columnSummary) {
      const initial = {};
      const domainTarget = domainDetail?.target_variable || storeTarget;

      columnSummary.forEach((col) => {
        if (col.name === domainTarget) {
          initial[col.name] = 'target';
        } else {
          initial[col.name] = 'feature';
        }
      });
      setMappings(initial);
      setValidationError(null);
    }
  }, [columnMapperOpen, columnSummary, domainDetail, storeTarget]);

  const handleRoleChange = (colName, newRole) => {
    setMappings((prev) => {
      const next = { ...prev };

      // If setting a column as target, clear any existing target
      if (newRole === 'target') {
        Object.keys(next).forEach((key) => {
          if (next[key] === 'target') {
            next[key] = 'feature';
          }
        });
      }

      next[colName] = newRole;
      return next;
    });
    setValidationError(null);
  };

  // Stats
  const stats = useMemo(() => {
    const featureCount = Object.values(mappings).filter(
      (r) => r === 'feature'
    ).length;
    const targetCount = Object.values(mappings).filter(
      (r) => r === 'target'
    ).length;
    const ignoredCount = Object.values(mappings).filter(
      (r) => r === 'ignore'
    ).length;
    return { featureCount, targetCount, ignoredCount };
  }, [mappings]);

  const targetColumnName = useMemo(() => {
    return (
      Object.entries(mappings).find(([, role]) => role === 'target')?.[0] ||
      null
    );
  }, [mappings]);

  // Validation check
  const canValidate =
    stats.targetCount === 1 && stats.featureCount >= 2;

  const handleValidateAndSave = async () => {
    if (!canValidate) {
      setValidationError(
        'You need exactly 1 target column and at least 2 feature columns.'
      );
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const mappingsList = Object.entries(mappings).map(([csv_column, role]) => ({
        csv_column,
        role,
      }));

      const response = await api.post('/data/column-mapping', {
        session_id: sessionId,
        target_column: targetColumnName,
        mappings: mappingsList,
      });

      const data = response.data;

      if (data.schema_ok) {
        setSchemaOK(true);
        setTargetColumn(targetColumnName);
        completeStep(2);
        toast.success('Column mapping validated and saved!');
        closeColumnMapper();
      } else {
        setValidationError(
          'Schema validation failed. Please review your column assignments.'
        );
      }
    } catch (err) {
      setValidationError(err.message || 'Failed to validate column mapping.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Modal
      isOpen={columnMapperOpen}
      onClose={closeColumnMapper}
      title="Column Mapper"
      subtitle="Assign roles to each column in your dataset"
      width="max-w-4xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted">
            <span className="font-semibold text-primary">
              {stats.featureCount} features
            </span>
            {' / '}
            <span className="font-semibold text-info">
              {stats.targetCount} target
            </span>
            {' / '}
            <span>{stats.ignoredCount} ignored</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={closeColumnMapper}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleValidateAndSave}
              disabled={!canValidate || isValidating}
              icon={CheckCircle2}
            >
              {isValidating ? 'Validating...' : 'Validate & Save'}
            </Button>
          </div>
        </div>
      }
    >
      {/* Validation error */}
      {validationError && (
        <Banner
          variant="error"
          message={validationError}
          className="mb-4"
          onDismiss={() => setValidationError(null)}
        />
      )}

      {/* Column table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Column Name
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Detected Type
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Missing %
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {columnSummary?.map((col) => (
              <tr
                key={col.name}
                className="border-b border-border/50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-2.5 px-3">
                  <span className="font-mono text-xs font-medium text-dark">
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
                            : col.dtype === 'identifier'
                              ? 'identifier'
                              : 'default'
                    }
                  >
                    {col.dtype}
                  </Badge>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`text-xs font-mono font-medium ${
                      col.missing_pct > 30
                        ? 'text-red-600'
                        : col.missing_pct > 5
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }`}
                  >
                    {col.missing_pct.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <select
                    value={mappings[col.name] || 'feature'}
                    onChange={(e) =>
                      handleRoleChange(col.name, e.target.value)
                    }
                    className={`
                      text-xs font-medium rounded-lg border px-2.5 py-1.5 outline-none transition-colors
                      ${mappings[col.name] === 'target'
                        ? 'border-blue-300 bg-blue-50 text-blue-800'
                        : mappings[col.name] === 'ignore'
                          ? 'border-slate-300 bg-slate-100 text-slate-500'
                          : 'border-border bg-white text-dark'
                      }
                      focus:ring-2 focus:ring-primary focus:border-primary
                    `}
                    aria-label={`Role for column ${col.name}`}
                  >
                    <option value="feature">Feature</option>
                    <option value="target">Target</option>
                    <option value="ignore">Ignore</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation requirements info */}
      <div className="mt-4 flex items-start gap-2 text-xs text-muted">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Select exactly <strong>1 target</strong> column and at least{' '}
          <strong>2 feature</strong> columns to proceed.
        </span>
      </div>
    </Modal>
  );
}
