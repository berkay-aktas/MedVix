import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const CASE_STUDIES = [
  {
    id: 1,
    title: 'IBM Watson for Oncology (2018)',
    preview: 'Unsafe treatment recommendations due to limited training data',
    severity: 'failure',
    color: 'bg-red-50 text-danger',
    numBg: 'bg-red-100 text-danger',
    detail:
      'IBM Watson for Oncology was found to make unsafe and incorrect treatment recommendations. The system was primarily trained on a small number of synthetic cases rather than real patient data, and its recommendations frequently contradicted established clinical guidelines. This case highlights the critical importance of training data quality and the risks of deploying AI systems without rigorous clinical validation.',
  },
  {
    id: 2,
    title: 'Epic Sepsis Model (2021)',
    preview: 'Missed 67% of sepsis cases in real-world deployment',
    severity: 'near-miss',
    color: 'bg-amber-50 text-warning',
    numBg: 'bg-amber-100 text-warning',
    detail:
      'A study published in JAMA Internal Medicine found that Epic\'s proprietary sepsis prediction model missed approximately two-thirds of sepsis cases when deployed in a real hospital setting, despite reporting high accuracy during development. The model generated a large number of false alarms, leading to alert fatigue among clinicians. This case demonstrates the gap between development metrics and real-world performance.',
  },
  {
    id: 3,
    title: 'UK Biobank Retinal AI (2023)',
    preview: 'Demographic bias caught during validation, model retrained with diverse data',
    severity: 'prevention',
    color: 'bg-emerald-50 text-primary',
    numBg: 'bg-emerald-100 text-primary',
    detail:
      'During validation of a retinal disease detection model, researchers identified significant performance disparities across ethnic groups. Rather than proceeding with deployment, the team expanded training data to include more diverse patient populations, implemented fairness constraints during training, and established ongoing monitoring for demographic bias. The resulting model showed equitable performance across all tested subgroups, demonstrating responsible AI development practices.',
  },
];

export default function CaseStudies() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
      <div className="px-5 pt-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-md bg-red-50 text-danger flex items-center justify-center">
          <AlertTriangle className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-semibold text-dark">AI failure case studies</h3>
      </div>
      <div className="px-5 py-3 space-y-2">
        {CASE_STUDIES.map((cs) => (
          <div key={cs.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === cs.id ? null : cs.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50/50 text-left hover:bg-slate-50 transition-colors"
            >
              <span className={`w-[26px] h-[26px] rounded-md flex items-center justify-center text-xs font-bold font-mono shrink-0 ${cs.numBg}`}>
                {cs.id}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-dark">{cs.title}</div>
                <div className="text-[12px] text-muted leading-snug">{cs.preview}</div>
              </div>
              <span className="text-muted shrink-0">
                {expandedId === cs.id ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
              </span>
            </button>
            {expandedId === cs.id && (
              <div className="px-4 py-3 text-[13px] text-slate-600 leading-relaxed border-t border-border bg-white">
                {cs.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
