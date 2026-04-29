import { Stethoscope } from 'lucide-react';

/**
 * Clinical Sense Check component for Step 6 (Explainability) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function ClinicalSenseCheck({ text }) {
  if (!text) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mt-5">
      <span className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
        <Stethoscope className="w-4 h-4" />
      </span>
      <div>
        <h4 className="text-[13px] font-semibold text-dark mb-1">Clinical Sense-Check</h4>
        <p className="text-[13px] text-slate-600 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
