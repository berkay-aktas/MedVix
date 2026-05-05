import { useEffect, useState } from 'react';
import {
  BookOpen,
  ArrowRightLeft,
  Stethoscope,
  AlertTriangle,
  Info,
  Database,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Banner from '../../components/ui/Banner';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import usePipelineStore from '../../stores/usePipelineStore';
import useModalStore from '../../stores/useModalStore';
import useDataStore from '../../stores/useDataStore';
import DOMAINS, { getDomainById, getDomainGradient } from '../../utils/domains';
import api from '../../utils/api';

/**
 * Step1 Clinical Context component for Step 1 (Clinical Context) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Step1ClinicalContext() {
  const {
    selectedDomain,
    setDomain,
    domainDetail,
    setDomainDetail,
    completeStep,
  } = usePipelineStore();
  const { openGlossary, openDomainSwitch } = useModalStore();
  const uploadResponse = useDataStore((s) => s.uploadResponse);
  // Custom CSV is only signalled by uploadResponse.filename when the user
  // went through /api/data/upload (built-in datasets do not set it).
  const isCustomDataset = Boolean(uploadResponse?.filename);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-select first domain if none selected
  useEffect(() => {
    if (!selectedDomain) {
      setDomain(DOMAINS[0].id);
    }
  }, [selectedDomain, setDomain]);

  // Fetch domain detail from API when domain changes
  useEffect(() => {
    if (!selectedDomain) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/domains/${selectedDomain}`);
        setDomainDetail(response.data);
        completeStep(1);
      } catch (err) {
        setError(err.message);
        // Fall back to local data
        const localDomain = getDomainById(selectedDomain);
        if (localDomain) {
          setDomainDetail(null);
          completeStep(1);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [selectedDomain, setDomainDetail, completeStep]);

  const localDomain = getDomainById(selectedDomain);

  if (!localDomain) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted">Please select a clinical domain to begin.</p>
      </div>
    );
  }

  // Use API detail if available, fall back to local
  const detail = domainDetail;
  const clinicalQuestion =
    detail?.clinical_question || localDomain.clinical_question;
  const whyItMatters = detail?.why_it_matters || null;
  const aiLimitation = detail?.ai_limitation_note || null;
  const featureNames = detail?.feature_names || localDomain.key_variables;
  const positiveLabel = detail?.positive_label;
  const negativeLabel = detail?.negative_label;
  const positiveMeaning = detail?.positive_class_meaning;
  const negativeMeaning = detail?.negative_class_meaning;
  const problemType = detail?.problem_type || 'binary';
  const targetClassesArr = detail?.target_classes || [];
  const datasetRows = detail?.dataset_rows || localDomain.dataset_info.rows;
  const datasetFeatures =
    detail?.dataset_features || localDomain.dataset_info.features;
  const targetClasses =
    detail?.target_classes?.length || localDomain.dataset_info.classes;
  const positiveRate =
    detail?.positive_rate || localDomain.dataset_info.positive_rate;

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            Step 1
          </span>
        </div>
        <h1 className="text-xl font-semibold text-dark">Clinical Context</h1>
        <p className="text-sm text-muted mt-1">
          Understand the medical problem and dataset before proceeding to data
          exploration.
        </p>
      </div>

      {error && (
        <Banner
          variant="warning"
          message={`Could not fetch domain details from server: ${error}. Using cached data.`}
          className="mb-4"
          onDismiss={() => setError(null)}
        />
      )}

      {isCustomDataset && (
        <Banner variant="warning" title="Custom dataset uploaded" className="mb-4">
          <p className="text-sm mt-1">
            The clinical context below describes the built-in <strong>{localDomain.name}</strong> scenario.
            Your uploaded file (<span className="font-mono">{uploadResponse.filename}</span>) may predict a
            different outcome — the model will use whatever your target column represents.
          </p>
        </Banner>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Domain Card */}
          <Card>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={getDomainGradient(localDomain)}
              >
                <span className="drop-shadow-sm">{localDomain.icon}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-dark">
                  {localDomain.name}
                </h2>
                <p className="text-sm text-muted">{localDomain.subtitle}</p>
              </div>
            </div>
          </Card>

          {/* Clinical Question */}
          {isLoading ? (
            <Card>
              <Skeleton variant="text" className="mb-2" />
              <Skeleton variant="text" className="w-3/4" />
            </Card>
          ) : (
            <Card>
              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                    Clinical Question
                  </h3>
                  <p className="text-base italic text-dark leading-relaxed border-l-4 border-primary bg-primary-bg/50 pl-4 py-2 rounded-r-lg">
                    {clinicalQuestion}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* What we predict — concrete outcome breakdown */}
          {!isLoading && (
            <Card>
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                    What we predict
                  </h3>
                  <p className="text-sm text-dark leading-relaxed mb-3">
                    {problemType === 'binary' ? (
                      <>The model outputs a <strong>probability score (0&ndash;1)</strong> answering the clinical question above. A score above 0.5 is classified as <strong>positive</strong>; below 0.5 is classified as <strong>negative</strong>.</>
                    ) : (
                      <>The model outputs probability scores across <strong>{targetClassesArr.length || 'multiple'}</strong> classes. The class with the highest probability is the model's prediction.</>
                    )}
                  </p>
                  {problemType === 'binary' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                            Positive ({positiveLabel || 'class 1'})
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {positiveMeaning ||
                            'The model predicts the condition described in the clinical question is present.'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                            Negative ({negativeLabel || 'class 0'})
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {negativeMeaning ||
                            'The model predicts the condition described in the clinical question is not present.'}
                        </p>
                      </div>
                    </div>
                  )}
                  {positiveRate && (
                    <p className="text-[11px] text-muted mt-2.5">
                      <span className="font-semibold text-dark">Class balance:</span>{' '}
                      <span className="font-mono">{positiveRate}</span> of training data is positive.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Why This Matters */}
          {whyItMatters && (
            <Banner variant="info" title="Why This Matters">
              <p className="text-sm mt-1">{whyItMatters}</p>
            </Banner>
          )}

          {/* AI Limitation Note */}
          {aiLimitation && (
            <Banner variant="warning" title="AI Limitation">
              <p className="text-sm mt-1">{aiLimitation}</p>
            </Banner>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Key Variables */}
          <Card title="Key Variables">
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-24 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {featureNames.map((variable) => (
                  <span
                    key={variable}
                    className="inline-flex items-center rounded-full bg-slate-100 text-dark text-xs font-medium px-3 py-1"
                  >
                    {variable}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Dataset Overview */}
          <Card title="Dataset Overview">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 border border-border p-3 text-center">
                <div className="text-2xl font-bold font-mono text-dark">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mx-auto" />
                  ) : (
                    datasetRows.toLocaleString()
                  )}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted mt-1">
                  Patients
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-border p-3 text-center">
                <div className="text-2xl font-bold font-mono text-dark">
                  {isLoading ? (
                    <Skeleton className="h-8 w-10 mx-auto" />
                  ) : (
                    datasetFeatures
                  )}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted mt-1">
                  Features
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-border p-3 text-center">
                <div className="text-2xl font-bold font-mono text-dark">
                  {isLoading ? (
                    <Skeleton className="h-8 w-6 mx-auto" />
                  ) : (
                    targetClasses
                  )}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted mt-1">
                  Classes
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-border p-3 text-center">
                <div className="text-2xl font-bold font-mono text-dark">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mx-auto" />
                  ) : (
                    positiveRate || 'N/A'
                  )}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted mt-1">
                  Positive Rate
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                icon={BookOpen}
                onClick={openGlossary}
                className="w-full justify-start"
                aria-label="View glossary of terms"
              >
                View Glossary
              </Button>
              <Button
                variant="outline"
                icon={ArrowRightLeft}
                onClick={() => openDomainSwitch(null)}
                className="w-full justify-start"
                aria-label="Switch clinical domain"
              >
                Switch Domain
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
