import { AlertTriangle } from 'lucide-react';
import useMLStore from '../../stores/useMLStore';

/**
 * Shows a warning banner when the user is on Step 2 or 3 (or anywhere
 * upstream that would invalidate trained models) and has trained models
 * in the store. Self-rendering — drop it in anywhere; renders nothing
 * when there is nothing to warn about.
 */
export default function StaleModelsWarning({ stepName = 'this step' }) {
  const trainedModels = useMLStore((s) => s.trainedModels);
  const count = trainedModels?.length || 0;
  if (count === 0) return null;

  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5 animate-fade-in">
      <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
      <div>
        <h4 className="text-[13px] font-semibold text-amber-900 mb-0.5">
          {count} trained {count === 1 ? 'model' : 'models'} on the previous configuration
        </h4>
        <p className="text-[12px] text-amber-800 leading-relaxed">
          Re-running {stepName} will not erase {count === 1 ? 'it' : 'them'}, but those metrics will no longer reflect the data the model{count === 1 ? '' : 's'} {count === 1 ? 'was' : 'were'} trained on.{' '}
          <span className="font-semibold">Retrain in Step 4</span> after applying changes here for accurate downstream results.
        </p>
      </div>
    </div>
  );
}
