import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import useMLStore from '../../stores/useMLStore';
import useDataStore from '../../stores/useDataStore';
import api from '../../utils/api';
import MetricInfoPopover from '../../components/ui/MetricInfoPopover';
import { MODEL_EXPLANATIONS } from './modelExplanations';

const MODELS = [
  {
    type: 'knn',
    name: 'K-Nearest Neighbors',
    desc: 'Finds similar past patients',
    icon: '\uD83C\uDFAF',
    color: '#3B82F6',
    difficulty: 'beginner',
  },
  {
    type: 'svm',
    name: 'Support Vector Machine',
    desc: 'Draws optimal decision boundaries',
    icon: '\uD83D\uDCD0',
    color: '#8B5CF6',
    difficulty: 'intermediate',
  },
  {
    type: 'decision_tree',
    name: 'Decision Tree',
    desc: 'Series of yes/no clinical questions',
    icon: '\uD83C\uDF33',
    color: '#10B981',
    difficulty: 'beginner',
  },
  {
    type: 'random_forest',
    name: 'Random Forest',
    desc: 'Multiple trees vote on diagnosis',
    icon: '\uD83C\uDF32',
    color: '#059669',
    difficulty: 'intermediate',
  },
  {
    type: 'logistic_regression',
    name: 'Logistic Regression',
    desc: 'Probability-based prediction',
    icon: '\uD83D\uDCCA',
    color: '#F59E0B',
    difficulty: 'beginner',
  },
  {
    type: 'naive_bayes',
    name: 'Naive Bayes',
    desc: 'Fast probability estimation',
    icon: '\uD83C\uDFB2',
    color: '#EC4899',
    difficulty: 'beginner',
  },
  {
    type: 'xgboost',
    name: 'XGBoost',
    desc: 'State-of-the-art gradient boosting',
    icon: '\u26A1',
    color: '#EF4444',
    difficulty: 'advanced',
  },
  {
    type: 'lightgbm',
    name: 'LightGBM',
    desc: 'Fast gradient boosting for large data',
    icon: '\uD83D\uDCA1',
    color: '#6366F1',
    difficulty: 'advanced',
  },
];

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  intermediate: { label: 'Intermediate', bg: 'bg-amber-100', text: 'text-amber-800' },
  advanced: { label: 'Advanced', bg: 'bg-red-100', text: 'text-red-800' },
};

/**
 * Model Selector component for Step 4 (Model & Parameters) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function ModelSelector({ onParamsLoaded }) {
  const selectedModel = useMLStore((s) => s.selectedModel);
  const setSelectedModel = useMLStore((s) => s.setSelectedModel);
  const setHyperparams = useMLStore((s) => s.setHyperparams);
  const sessionId = useDataStore((s) => s.sessionId);
  const [loadingModel, setLoadingModel] = useState(null);

  const handleSelect = async (modelType) => {
    if (loadingModel) return;

    setSelectedModel(modelType);
    setLoadingModel(modelType);

    try {
      const response = await api.get(`/ml/hyperparams/${modelType}`);
      const paramData = response.data;

      // Set defaults from API
      const defaults = {};
      paramData.params?.forEach((p) => {
        defaults[p.name] = p.default;
      });
      setHyperparams(defaults);

      onParamsLoaded(paramData);
    } catch {
      // If API unavailable, use empty params — panel will show message
      onParamsLoaded(null);
      toast.error('Could not load hyperparameters. API may be unavailable.');
    } finally {
      setLoadingModel(null);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-dark mb-3">Select a Model</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.type;
          const isLoading = loadingModel === model.type;
          const diff = DIFFICULTY_CONFIG[model.difficulty];

          return (
            <button
              key={model.type}
              type="button"
              onClick={() => handleSelect(model.type)}
              disabled={!!loadingModel}
              aria-pressed={isSelected}
              aria-label={`${model.name} - ${diff.label}`}
              className={clsx(
                'relative text-left border rounded-xl p-4 transition-all duration-150',
                isSelected
                  ? 'border-primary bg-primary-bg ring-2 ring-primary'
                  : 'border-border bg-white hover:border-primary/40 hover:shadow-sm',
                loadingModel && !isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Top-right: info popover (always present) + selected check */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {/* Wrap in span with stopPropagation so clicking (i) does not toggle the card */}
                <span onClick={(e) => e.stopPropagation()}>
                  <MetricInfoPopover
                    explanation={MODEL_EXPLANATIONS[model.type]}
                    align="right"
                  />
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Icon circle */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                style={{
                  background: `${model.color}15`,
                }}
              >
                {isLoading ? (
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: model.color }}
                  />
                ) : (
                  <span>{model.icon}</span>
                )}
              </div>

              {/* Name */}
              <div className="text-sm font-semibold text-dark mb-1">
                {model.name}
              </div>

              {/* Description */}
              <p className="text-xs text-muted leading-relaxed mb-3">
                {model.desc}
              </p>

              {/* Difficulty badge */}
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  diff.bg,
                  diff.text
                )}
              >
                {diff.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
