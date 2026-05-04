import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Activity, Zap, RotateCcw, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import useDataStore from '../../stores/useDataStore';
import useMLStore from '../../stores/useMLStore';
import useExplainabilityStore from '../../stores/useExplainabilityStore';
import SliderControl from '../../components/ui/SliderControl';
import ToggleSwitch from '../../components/ui/ToggleSwitch';

export default function CounterfactualPanel() {
  const sessionId = useDataStore((s) => s.sessionId);
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const {
    selectedPatientIndex,
    counterfactualData,
    isCounterfactualLoading,
    featureOverrides,
    autoFindResult,
    setCounterfactualData,
    setIsCounterfactualLoading,
    updateFeatureOverride,
    resetFeatureOverrides,
    setAutoFindResult,
  } = useExplainabilityStore();

  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);
  const initializedRef = useRef(false);
  const [autoFindLoading, setAutoFindLoading] = useState(false);

  const fetchPrediction = async (overrides) => {
    if (!sessionId || !activeModelResult || selectedPatientIndex === null) return;
    setIsCounterfactualLoading(true);
    const reqId = ++reqIdRef.current;
    try {
      const res = await api.post('/explainability/counterfactual', {
        session_id: sessionId,
        model_id: activeModelResult.model_id,
        patient_index: selectedPatientIndex,
        feature_overrides: overrides && Object.keys(overrides).length > 0 ? overrides : null,
      });
      if (reqId !== reqIdRef.current) return;
      setCounterfactualData(res.data);
      initializedRef.current = true;
    } catch (err) {
      if (reqId !== reqIdRef.current) return;
      toast.error(err.message || 'Failed to compute counterfactual');
    } finally {
      if (reqId === reqIdRef.current) setIsCounterfactualLoading(false);
    }
  };

  useEffect(() => {
    initializedRef.current = false;
    if (selectedPatientIndex === null) {
      setCounterfactualData(null);
      return;
    }
    resetFeatureOverrides();
    fetchPrediction({});
  }, [selectedPatientIndex, sessionId, activeModelResult?.model_id]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPrediction(featureOverrides);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [featureOverrides]);

  const handleAutoFind = async () => {
    if (selectedPatientIndex === null) return;
    setAutoFindLoading(true);
    setAutoFindResult(null);
    try {
      const res = await api.post('/explainability/counterfactual/auto-find', {
        session_id: sessionId,
        model_id: activeModelResult.model_id,
        patient_index: selectedPatientIndex,
      });
      setAutoFindResult(res.data);
      if (!res.data.success) {
        toast(res.data.explanation, { icon: 'i', duration: 5500 });
      }
    } catch (err) {
      toast.error(err.message || 'Auto-find failed');
    } finally {
      setAutoFindLoading(false);
    }
  };

  const applyAutoFind = () => {
    if (autoFindResult?.success && autoFindResult.feature_name) {
      updateFeatureOverride(autoFindResult.feature_name, autoFindResult.suggested_value);
    }
  };

  if (selectedPatientIndex === null || !counterfactualData) return null;

  const {
    probability,
    predicted_class,
    predicted_label,
    baseline_probability,
    baseline_class,
    prediction_changed,
    is_multiclass,
    feature_ranges,
  } = counterfactualData;

  const formatVal = (v) => {
    if (Math.abs(v) >= 100) return Math.round(v).toString();
    if (Math.abs(v - Math.round(v)) < 0.05) return Math.round(v).toString();
    return v.toFixed(1);
  };

  return (
    <section className="bg-white rounded-xl shadow-card border border-border overflow-hidden mt-5 animate-fade-in">
      <div className="px-5 pt-4 pb-3 border-b border-border flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-dark">Counterfactual Explorer</h3>
            <p className="text-xs text-muted">Adjust this patient's values to see how the prediction would change.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoFind}
            disabled={autoFindLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            {autoFindLoading ? 'Searching...' : 'Auto-find smallest flip'}
          </button>
          <button
            type="button"
            onClick={resetFeatureOverrides}
            disabled={Object.keys(featureOverrides).length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-dark hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="px-5 py-4 bg-slate-50 border-b border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Current prediction</p>
            <div className="flex items-baseline gap-2">
              <span className={clsx('text-2xl font-bold', predicted_class === 'positive' ? 'text-danger' : 'text-success')}>
                {predicted_label}
              </span>
              <span className="text-sm font-mono text-muted">{(probability * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={clsx('h-full transition-all duration-300', predicted_class === 'positive' ? 'bg-danger' : 'bg-success')}
                style={{ width: `${probability * 100}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Baseline (no changes)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-dark">
                {is_multiclass ? `Class ${baseline_class}` : (baseline_class === 'positive' ? 'High risk' : 'Low risk')}
              </span>
              <span className="text-sm font-mono text-muted">{(baseline_probability * 100).toFixed(1)}%</span>
            </div>
            {prediction_changed && (
              <p className="text-xs font-semibold text-purple-700 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Prediction flipped vs baseline
              </p>
            )}
          </div>
        </div>
      </div>

      {autoFindResult && (
        <div className={clsx('px-5 py-3 border-b border-border', autoFindResult.success ? 'bg-purple-50' : 'bg-amber-50')}>
          <div className="flex items-start gap-2.5">
            <Sparkles className={clsx('w-4 h-4 shrink-0 mt-0.5', autoFindResult.success ? 'text-purple-600' : 'text-amber-600')} />
            <div className="flex-1">
              <p className="text-[13px] text-dark leading-relaxed">{autoFindResult.explanation}</p>
              {autoFindResult.success && (
                <button
                  type="button"
                  onClick={applyAutoFind}
                  className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                >
                  Apply this change
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Adjust feature values</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {feature_ranges.map((feat) => {
            const overrideVal = featureOverrides[feat.feature_name];
            const currentValue = overrideVal !== undefined ? overrideVal : feat.current_value;
            if (feat.feature_type === 'binary') {
              const enabled = Math.abs(currentValue - feat.max_value) < Math.abs(currentValue - feat.min_value);
              const isModified = overrideVal !== undefined && Math.abs(overrideVal - feat.current_value) > 1e-6;
              return (
                <div key={feat.feature_name} className={clsx('flex items-center justify-between p-3 rounded-lg transition-colors', isModified ? 'bg-purple-50/60' : 'bg-slate-50')}>
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm font-medium text-dark truncate block">{feat.display_name}</span>
                    <span className="text-[11px] font-mono text-muted">
                      Now: {formatVal(currentValue)} (was {formatVal(feat.current_value)})
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={enabled}
                    onChange={(newEnabled) => updateFeatureOverride(feat.feature_name, newEnabled ? feat.max_value : feat.min_value)}
                    label={feat.display_name}
                  />
                </div>
              );
            }
            const range = feat.max_value - feat.min_value;
            const step = range > 100 ? 1 : range > 10 ? 0.5 : range > 1 ? 0.1 : 0.01;
            const isModified = overrideVal !== undefined && Math.abs(overrideVal - feat.current_value) > 1e-6;
            return (
              <div key={feat.feature_name} className={clsx('p-3 rounded-lg transition-colors', isModified ? 'bg-purple-50/60' : 'bg-slate-50')}>
                <SliderControl
                  label={feat.display_name}
                  min={feat.min_value}
                  max={feat.max_value}
                  step={step}
                  value={currentValue}
                  onChange={(v) => updateFeatureOverride(feat.feature_name, v)}
                  displayFormat={formatVal}
                />
                <p className="text-[10px] text-muted mt-1">
                  Original: <span className="font-mono">{formatVal(feat.current_value)}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {isCounterfactualLoading && (
        <div className="px-5 py-2 text-[11px] text-muted text-center bg-slate-50 border-t border-border animate-pulse">
          Recomputing prediction...
        </div>
      )}
    </section>
  );
}
