import { useState, useCallback } from 'react';
import { Upload, Database, Columns, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Banner from '../../components/ui/Banner';
import Skeleton from '../../components/ui/Skeleton';
import usePipelineStore from '../../stores/usePipelineStore';
import useDataStore from '../../stores/useDataStore';
import useModalStore from '../../stores/useModalStore';
import api from '../../utils/api';
import { getDomainById } from '../../utils/domains';
import UploadZone from './UploadZone';
import DataPreview from './DataPreview';
import ColumnInfoTable from './ColumnInfoTable';
import ClassDistribution from './ClassDistribution';
import DataQualityScore from './DataQualityScore';

/**
 * Step2 Data Exploration component for Step 2 (Data Exploration) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Step2DataExploration() {
  const selectedDomain = usePipelineStore((s) => s.selectedDomain);
  const {
    sessionId,
    columnSummary,
    isLoading,
    schemaOK,
    preview,
    uploadResponse,
    setSessionId,
    setIsLoading,
    setPreview,
    setUploadResponse,
    loadSummaryData,
  } = useDataStore();
  const openColumnMapper = useModalStore((s) => s.openColumnMapper);

  const domain = getDomainById(selectedDomain);
  const hasData = !!sessionId && !!columnSummary;

  // Handle successful upload or built-in load
  const handleDataLoaded = useCallback(
    async (response) => {
      setSessionId(response.session_id);
      setUploadResponse(response);

      // Fetch summary
      setIsLoading(true);
      try {
        const [summaryRes, previewRes] = await Promise.all([
          api.get(`/data/summary?session_id=${response.session_id}`),
          api.get(`/data/preview?session_id=${response.session_id}`),
        ]);
        loadSummaryData(summaryRes.data);
        setPreview(previewRes.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load data summary.');
      } finally {
        setIsLoading(false);
      }
    },
    [setSessionId, setUploadResponse, setIsLoading, loadSummaryData, setPreview]
  );

  // Upload CSV file
  const handleUpload = useCallback(
    async (file) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(
          `/data/upload?domain_id=${selectedDomain}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        toast.success(response.data.message);
        await handleDataLoaded(response.data);
      } catch (err) {
        toast.error(err.message || 'Upload failed.');
        setIsLoading(false);
      }
    },
    [selectedDomain, handleDataLoaded, setIsLoading]
  );

  // Load built-in dataset
  const handleLoadBuiltin = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/data/builtin', {
        domain_id: selectedDomain,
      });
      toast.success(response.data.message);
      await handleDataLoaded(response.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load built-in dataset.');
      setIsLoading(false);
    }
  }, [selectedDomain, handleDataLoaded, setIsLoading]);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            Step 2
          </span>
        </div>
        <h1 className="text-xl font-semibold text-dark">Data Exploration</h1>
        <p className="text-sm text-muted mt-1">
          Upload your own CSV file or load the built-in dataset for{' '}
          {domain?.name || 'this domain'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5">
        {/* Left panel: Upload / Built-in */}
        <div className="space-y-5 min-w-0">
          {/* Upload Zone */}
          <UploadZone onUpload={handleUpload} isLoading={isLoading} />

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Built-in dataset card */}
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary-bg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dark">
                  Use Example Dataset
                </h3>
                <p className="text-xs text-muted">
                  Pre-loaded dataset for {domain?.name || 'this domain'}
                </p>
              </div>
            </div>
            {domain && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-sm font-mono font-bold text-dark">
                    {domain.dataset_info.rows.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted">Rows</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-sm font-mono font-bold text-dark">
                    {domain.dataset_info.features}
                  </div>
                  <div className="text-[10px] text-muted">Features</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-sm font-mono font-bold text-dark">
                    {domain.dataset_info.classes}
                  </div>
                  <div className="text-[10px] text-muted">Classes</div>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLoadBuiltin}
              disabled={isLoading}
              className="w-full"
              icon={Database}
            >
              {isLoading ? 'Loading...' : 'Load Dataset'}
            </Button>
          </Card>

          {/* Upload info */}
          {uploadResponse && (
            <Banner
              variant="success"
              title="Data loaded"
              message={`${uploadResponse.filename || 'Dataset'} - ${uploadResponse.row_count} rows, ${uploadResponse.column_count} columns`}
            />
          )}
        </div>

        {/* Right panel: Data exploration results */}
        <div className="space-y-5 min-w-0">
          {isLoading && !hasData ? (
            <Card>
              <div className="space-y-3">
                <Skeleton variant="text" className="w-1/3" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton variant="text" />
                <Skeleton variant="text" className="w-2/3" />
              </div>
            </Card>
          ) : hasData ? (
            <>
              {/* Data Preview */}
              {preview && <DataPreview preview={preview} />}

              {/* Column Info Table */}
              {columnSummary && (
                <ColumnInfoTable columns={columnSummary} />
              )}

              {/* Class Distribution + Quality Score in 2 cols */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5">
                <ClassDistribution />
                <DataQualityScore />
              </div>

              {/* Column Mapper button */}
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Columns className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-dark">
                        Column Mapper
                      </h3>
                      <p className="text-xs text-muted">
                        {schemaOK
                          ? 'Schema validated -- ready for Step 3'
                          : 'Assign feature, target, and ignore roles to columns'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={schemaOK ? 'outline' : 'primary'}
                    onClick={openColumnMapper}
                    icon={Columns}
                  >
                    {schemaOK ? 'Edit Mapping' : 'Open Column Mapper'}
                  </Button>
                </div>
              </Card>

              {/* Continue hint */}
              {schemaOK && (
                <Banner
                  variant="success"
                  title="Ready to continue"
                  message="Column mapping is validated. You can now proceed to Step 3: Data Preparation."
                />
              )}
            </>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-dark mb-1">
                  No data loaded yet
                </h3>
                <p className="text-xs text-muted max-w-xs">
                  Upload a CSV file or load the built-in dataset to start
                  exploring your data.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
