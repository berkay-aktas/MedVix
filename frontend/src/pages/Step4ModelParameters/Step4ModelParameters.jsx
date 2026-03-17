import { useState } from 'react';
import { Cpu } from 'lucide-react';
import Banner from '../../components/ui/Banner';
import useMLStore from '../../stores/useMLStore';
import useDataStore from '../../stores/useDataStore';
import ModelSelector from './ModelSelector';
import HyperparameterPanel from './HyperparameterPanel';

export default function Step4ModelParameters() {
  const selectedModel = useMLStore((s) => s.selectedModel);
  const activeModelResult = useMLStore((s) => s.activeModelResult);
  const sessionId = useDataStore((s) => s.sessionId);
  const [paramConfig, setParamConfig] = useState(null);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-primary-bg text-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            Step 4
          </span>
        </div>
        <h1 className="text-xl font-semibold text-dark">
          Model &amp; Parameters
        </h1>
        <p className="text-sm text-muted mt-1">
          Select a machine learning model and fine-tune its hyperparameters
          before training.
        </p>
      </div>

      {/* No session warning */}
      {!sessionId && (
        <Banner
          variant="warning"
          title="No data loaded"
          message="Please complete Steps 2 and 3 first to load and prepare your dataset."
          className="mb-5"
        />
      )}

      <div className="space-y-5">
        {/* Model selector grid */}
        <ModelSelector onParamsLoaded={setParamConfig} />

        {/* Hyperparameter panel — only after model selected */}
        {selectedModel && (
          <div className="animate-slide-up">
            <HyperparameterPanel paramConfig={paramConfig} />
          </div>
        )}

        {/* Training success summary */}
        {activeModelResult && (
          <div className="animate-slide-up">
            <Banner
              variant="success"
              icon={Cpu}
              title={`${activeModelResult.model_name || activeModelResult.model_type} trained successfully`}
              message={`Accuracy: ${((activeModelResult.test_accuracy ?? activeModelResult.metrics?.find((m) => m.name === 'accuracy')?.value ?? 0) * 100).toFixed(1)}% | Training time: ${activeModelResult.training_time_ms}ms. Proceed to Step 5 to view detailed results.`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
