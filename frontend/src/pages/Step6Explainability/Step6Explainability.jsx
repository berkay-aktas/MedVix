import { useEffect } from 'react';
import { Eye, ArrowLeft, AlertTriangle, Info, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useMLStore from '../../stores/useMLStore';
import useDataStore from '../../stores/useDataStore';
import usePipelineStore from '../../stores/usePipelineStore';
import useExplainabilityStore from '../../stores/useExplainabilityStore';
import api from '../../utils/api';
import FeatureImportanceChart from './FeatureImportanceChart';
import PatientSelector from './PatientSelector';
import WaterfallChart from './WaterfallChart';
import ClinicalSenseCheck from './ClinicalSenseCheck';
import PatientRiskMap from './PatientRiskMap';
import CounterfactualPanel from './CounterfactualPanel';

/**
 * Step6 Explainability component for Step 6 (Explainability) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function Step6Explainability() {
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const sessionId = useDataStore((s) => s.sessionId);
  const completeStep = usePipelineStore((s) => s.completeStep);
  const setStep = usePipelineStore((s) => s.setStep);

  const {
    featureImportance,
    senseCheckText,
    patients,
    selectedPatientIndex,
    waterfallData,
    isLoading,
    isWaterfallLoading,
    setFeatureImportance,
    setSelectedPatientIndex,
    setWaterfallData,
    setIsLoading,
    setIsWaterfallLoading,
    setPatientMapData,
    setIsMapLoading,
  } = useExplainabilityStore();

  // Fetch feature importance + patient map on mount / model change
  useEffect(() => {
    if (!sessionId || !activeModelResult) return;

    const fetchImportance = async () => {
      setIsLoading(true);
      try {
        const res = await api.post('/explainability/feature-importance', {
          session_id: sessionId,
          model_id: activeModelResult.model_id,
        });
        setFeatureImportance(res.data);
        completeStep(6);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to compute feature importance');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPatientMap = async () => {
      setIsMapLoading(true);
      // Don't toast on map failures — the rest of Step 6 should still work
      try {
        const res = await api.post('/explainability/patient-map', {
          session_id: sessionId,
          model_id: activeModelResult.model_id,
        });
        setPatientMapData(res.data);
      } catch {
        setPatientMapData(null);
      } finally {
        setIsMapLoading(false);
      }
    };

    fetchImportance();
    fetchPatientMap();
  }, [sessionId, activeModelResult?.model_id]);

  // Fetch waterfall when patient selected
  useEffect(() => {
    if (selectedPatientIndex === null || !sessionId || !activeModelResult) return;

    const fetchWaterfall = async () => {
      setIsWaterfallLoading(true);
      try {
        const res = await api.post('/explainability/waterfall', {
          session_id: sessionId,
          model_id: activeModelResult.model_id,
          patient_index: selectedPatientIndex,
        });
        setWaterfallData(res.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to compute patient explanation');
      } finally {
        setIsWaterfallLoading(false);
      }
    };

    fetchWaterfall();
  }, [selectedPatientIndex, sessionId, activeModelResult?.model_id]);

  // Empty state
  if (!activeModelResult) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-lg font-semibold text-dark mb-2">No Model Results</h2>
        <p className="text-sm text-muted max-w-md mb-4">
          Train a model in Step 4 first, then return here to explore feature explanations.
        </p>
        <button onClick={() => setStep(4)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go to Step 4
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading && !featureImportance) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted">Computing SHAP explanations...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            <Eye className="w-3 h-3 mr-1" /> Step 6 of 7
          </span>
        </div>
        <h1 className="text-xl font-semibold text-dark">Explainability</h1>
        <p className="text-sm text-muted mt-1">
          Understand why the model makes its predictions using SHAP (SHapley Additive exPlanations).
        </p>
      </div>

      {/* Caution Banner */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[13px] font-semibold text-amber-900 mb-0.5">Correlation, Not Causation</h4>
          <p className="text-[12px] text-amber-800 leading-relaxed">
            These features show statistical associations with the outcome but do not prove causal relationships. Clinical judgement remains essential.
          </p>
        </div>
      </div>

      {/* Patient Risk Map — headline visual */}
      <PatientRiskMap />

      {/* Counterfactual Explorer — visible immediately, populates on patient click */}
      <CounterfactualPanel />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-5 mt-5">
        {/* Left: Feature Importance */}
        <FeatureImportanceChart features={featureImportance} />

        {/* Right: Patient Explanation */}
        <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
          <div className="px-5 pt-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-blue-50 text-info flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <h3 className="text-[15px] font-semibold text-dark">Patient explanation</h3>
          </div>
          <div className="px-5 py-4">
            <PatientSelector
              patients={patients}
              selectedIndex={selectedPatientIndex}
              onSelect={setSelectedPatientIndex}
            />
            <WaterfallChart data={waterfallData} isLoading={isWaterfallLoading} />
          </div>
        </div>
      </div>

      {/* What-if Info Banner */}
      {waterfallData && waterfallData.bars.length > 0 && (
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl mt-5">
          <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-semibold text-blue-900 mb-0.5">What-If Analysis</h4>
            <p className="text-[12px] text-blue-800 leading-relaxed">
              The top contributing feature is <strong>{waterfallData.bars[0].display_name}</strong> (value: {waterfallData.bars[0].feature_value}).
              It shifts the predicted probability by <strong>{waterfallData.bars[0].shap_value > 0 ? '+' : ''}{(waterfallData.bars[0].shap_value * 100).toFixed(1)}pp</strong> from baseline.
            </p>
          </div>
        </div>
      )}

      {/* Clinical Sense-Check */}
      <ClinicalSenseCheck text={senseCheckText} />
    </div>
  );
}
