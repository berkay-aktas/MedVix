import { AlertTriangle } from 'lucide-react';

export default function BiasDetectionBanner({ biasDetected, biasMessage }) {
  if (!biasDetected) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
      <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
      <div>
        <h4 className="text-[13px] font-semibold text-red-900 mb-0.5">Bias Detected</h4>
        <p className="text-[13px] text-red-800 leading-relaxed">{biasMessage}</p>
      </div>
    </div>
  );
}
