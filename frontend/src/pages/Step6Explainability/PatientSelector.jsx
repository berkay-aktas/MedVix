import { ChevronDown } from 'lucide-react';

/**
 * Patient Selector component for Step 6 (Explainability) of the MedVix pipeline.
 *
 * @param {object} props - Component props.
 * @returns {JSX.Element} Rendered component.
 */
export default function PatientSelector({ patients, selectedIndex, onSelect }) {
  if (!patients || patients.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-muted mb-1.5">
        Select patient
      </label>
      <div className="relative">
        <select
          value={selectedIndex ?? ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="w-full appearance-none px-3 py-2 border border-border rounded-lg text-[13px] text-slate-700 bg-white cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="" disabled>Choose a test patient...</option>
          {patients.map((p) => (
            <option key={p.index} value={p.index}>
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
