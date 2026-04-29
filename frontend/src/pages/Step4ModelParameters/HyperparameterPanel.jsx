import { useEffect, useRef, useCallback } from 'react';
import { Play, Loader2, RotateCcw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SliderControl from '../../components/ui/SliderControl';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import useMLStore from '../../stores/useMLStore';
import useDataStore from '../../stores/useDataStore';
import usePipelineStore from '../../stores/usePipelineStore';
import api from '../../utils/api';

/**
 * Hyperparameter Panel component for Step 4 (Model & Parameters) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function HyperparameterPanel({ paramConfig }) {
  const hyperparams = useMLStore((s) => s.hyperparams);
  const setHyperparam = useMLStore((s) => s.setHyperparam);
  const setHyperparams = useMLStore((s) => s.setHyperparams);
  const isTraining = useMLStore((s) => s.isTraining);
  const setIsTraining = useMLStore((s) => s.setIsTraining);
  const addTrainedModel = useMLStore((s) => s.addTrainedModel);
  const autoRetrain = useMLStore((s) => s.autoRetrain);
  const setAutoRetrain = useMLStore((s) => s.setAutoRetrain);
  const selectedModel = useMLStore((s) => s.selectedModel);

  const sessionId = useDataStore((s) => s.sessionId);
  const completeStep = usePipelineStore((s) => s.completeStep);

  const debounceRef = useRef(null);

  const params = paramConfig?.params || [];
  const modelName = paramConfig?.model_name || selectedModel || 'Model';

  // Build defaults map
  const defaults = {};
  params.forEach((p) => {
    defaults[p.name] = p.default;
  });

  // Build "optimized" preset — slightly tuned values
  const optimized = {};
  params.forEach((p) => {
    if (p.type === 'int' || p.type === 'float') {
      // Push toward 60% of range from default
      const range = p.max - p.min;
      const target = p.min + range * 0.6;
      // Round to step
      const rounded =
        p.type === 'int'
          ? Math.round(target / (p.step || 1)) * (p.step || 1)
          : Math.round(target / (p.step || 0.01)) * (p.step || 0.01);
      optimized[p.name] = Math.min(p.max, Math.max(p.min, rounded));
    } else {
      optimized[p.name] = p.default;
    }
  });

  const handleTrain = useCallback(async () => {
    if (!sessionId) {
      toast.error('No data session. Please load data in Step 2 first.');
      return;
    }

    setIsTraining(true);
    try {
      const response = await api.post('/ml/train', {
        session_id: sessionId,
        model_type: selectedModel,
        hyperparams: hyperparams,
      });
      addTrainedModel(response.data);
      completeStep(4);
      toast.success(`${modelName} trained successfully!`);
    } catch (err) {
      toast.error(err.message || 'Training failed. Please try again.');
    } finally {
      setIsTraining(false);
    }
  }, [
    sessionId,
    selectedModel,
    hyperparams,
    modelName,
    setIsTraining,
    addTrainedModel,
    completeStep,
  ]);

  // Auto-retrain with debounce
  useEffect(() => {
    if (!autoRetrain || !sessionId || !selectedModel) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleTrain();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [hyperparams, autoRetrain, sessionId, selectedModel, handleTrain]);

  const handleParamChange = (name, value) => {
    setHyperparam(name, value);
  };

  if (!paramConfig) {
    return (
      <Card className="mt-5">
        <div className="text-center py-8">
          <p className="text-sm text-muted">
            Hyperparameter configuration is unavailable. The API may not be
            connected.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-4"
            onClick={handleTrain}
            disabled={isTraining || !sessionId}
            icon={isTraining ? Loader2 : Play}
          >
            {isTraining ? 'Training...' : 'Train with Defaults'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-dark">
          Hyperparameters for {modelName}
        </h3>
        {paramConfig.description && (
          <span className="text-xs text-muted hidden sm:inline">
            {paramConfig.description}
          </span>
        )}
      </div>

      {/* Preset buttons */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => setHyperparams(defaults)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted border border-border rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Quick Start
        </button>
        <button
          type="button"
          onClick={() => setHyperparams(optimized)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted border border-border rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Optimized
        </button>
      </div>

      {/* Parameter controls */}
      <div className="space-y-5">
        {params.map((param) => {
          if (param.type === 'select') {
            return (
              <div key={param.name} className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor={`param-${param.name}`}
                    className="text-sm font-medium text-dark"
                  >
                    {param.label || param.name}
                  </label>
                  <span className="text-sm font-mono font-semibold text-primary bg-primary-bg rounded-full px-3 py-0.5">
                    {hyperparams[param.name] ?? param.default}
                  </span>
                </div>
                <select
                  id={`param-${param.name}`}
                  value={hyperparams[param.name] ?? param.default}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  aria-label={param.label || param.name}
                >
                  {param.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {param.description && (
                  <p className="text-xs text-muted mt-1">{param.description}</p>
                )}
              </div>
            );
          }

          // Default: slider for int/float
          const value = hyperparams[param.name] ?? param.default ?? param.min;
          return (
            <div key={param.name}>
              <SliderControl
                label={param.label || param.name}
                min={param.min}
                max={param.max}
                step={param.step || (param.type === 'float' ? 0.01 : 1)}
                value={value}
                onChange={(v) => handleParamChange(param.name, v)}
                displayFormat={
                  param.type === 'float' ? (v) => v.toFixed(2) : undefined
                }
              />
              {param.description && (
                <p className="text-xs text-muted mt-1">{param.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-retrain toggle */}
      <div className="mt-6 pt-4 border-t border-border">
        <ToggleSwitch
          enabled={autoRetrain}
          onChange={setAutoRetrain}
          label="Auto-retrain"
          description="Automatically retrain the model 300ms after any parameter change."
        />
      </div>

      {/* Train button */}
      <div className="flex justify-center mt-6">
        <Button
          variant="primary"
          size="lg"
          onClick={handleTrain}
          disabled={isTraining || !sessionId}
          icon={isTraining ? Loader2 : Play}
          className={isTraining ? 'animate-pulse' : ''}
        >
          {isTraining ? 'Training Model...' : 'Train Model'}
        </Button>
      </div>
    </Card>
  );
}
