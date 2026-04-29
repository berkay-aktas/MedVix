import { useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useMLStore from '../../stores/useMLStore';
import useDataStore from '../../stores/useDataStore';
import usePipelineStore from '../../stores/usePipelineStore';
import useEthicsStore from '../../stores/useEthicsStore';
import api from '../../utils/api';
import SubgroupTable from './SubgroupTable';
import BiasDetectionBanner from './BiasDetectionBanner';
import TrainingDataChart from './TrainingDataChart';
import EUChecklist from './EUChecklist';
import CaseStudies from './CaseStudies';
import SummaryCard from './SummaryCard';

/**
 * Step7 Ethics Bias component for Step 7 (Ethics & Bias Audit) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Step7EthicsBias() {
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const sessionId = useDataStore((s) => s.sessionId);
  const completeStep = usePipelineStore((s) => s.completeStep);
  const setStep = usePipelineStore((s) => s.setStep);
  const selectedDomain = usePipelineStore((s) => s.selectedDomain);
  const domainDetail = usePipelineStore((s) => s.domainDetail);

  const {
    biasAnalysis,
    isLoading,
    setBiasAnalysis,
    setIsLoading,
  } = useEthicsStore();

  // Fetch bias analysis on mount
  useEffect(() => {
    if (!sessionId || !activeModelResult) return;

    const fetchBias = async () => {
      setIsLoading(true);
      try {
        const res = await api.post('/ethics/bias-analysis', {
          session_id: sessionId,
          model_id: activeModelResult.model_id,
        });
        setBiasAnalysis(res.data);
        completeStep(7);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to compute bias analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBias();
  }, [sessionId, activeModelResult?.model_id]);

  // Empty state
  if (!activeModelResult) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-lg font-semibold text-dark mb-2">No Model Results</h2>
        <p className="text-sm text-muted max-w-md mb-4">
          Train a model and view explainability first, then return here for the ethics audit.
        </p>
        <button onClick={() => setStep(4)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go to Step 4
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading && !biasAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted">Analysing model fairness...</p>
      </div>
    );
  }

  const domainName = domainDetail?.name || selectedDomain || 'Unknown';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            <Shield className="w-3 h-3 mr-1" /> Step 7 of 7
          </span>
        </div>
        <h1 className="text-xl font-semibold text-dark">Ethics & Bias Audit</h1>
        <p className="text-sm text-muted mt-1">
          Evaluate model fairness across patient subgroups and ensure compliance with ethical AI standards.
        </p>
      </div>

      {/* Bias Detection Banner */}
      <BiasDetectionBanner
        biasDetected={biasAnalysis?.bias_detected}
        biasMessage={biasAnalysis?.bias_message}
      />

      {/* Sections */}
      <div className="space-y-5">
        {/* Subgroup Fairness Table */}
        <SubgroupTable
          subgroups={biasAnalysis?.subgroups}
          overallSensitivity={biasAnalysis?.overall_sensitivity}
        />

        {/* Training Data Chart */}
        <TrainingDataChart comparisonData={biasAnalysis?.training_data_comparison} />

        {/* EU AI Act Checklist */}
        <EUChecklist />

        {/* AI Failure Case Studies */}
        <CaseStudies />

        {/* Summary & Certificate Download */}
        <SummaryCard biasAnalysis={biasAnalysis} domainName={domainName} />
      </div>
    </div>
  );
}
