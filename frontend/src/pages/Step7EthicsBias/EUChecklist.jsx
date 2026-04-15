import { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import useEthicsStore from '../../stores/useEthicsStore';

const CHECKLIST_ITEMS = [
  { id: 'data_quality', title: 'Data quality documentation', description: 'Training data sources and preprocessing steps are documented' },
  { id: 'transparency', title: 'Transparency', description: 'Model decisions are explainable via SHAP analysis' },
  { id: 'human_oversight', title: 'Human oversight', description: 'System designed for clinician-in-the-loop use' },
  { id: 'accuracy_reporting', title: 'Accuracy reporting', description: 'Performance metrics reported per patient subgroup' },
  { id: 'bias_mitigation', title: 'Bias mitigation', description: 'Active steps taken to identify and reduce bias' },
  { id: 'technical_docs', title: 'Technical documentation', description: 'Architecture, limitations, and intended use documented' },
  { id: 'risk_classification', title: 'Risk classification', description: 'System classified as high-risk medical AI per EU AI Act' },
  { id: 'post_market', title: 'Post-market monitoring', description: 'Monitoring plan established for deployment performance' },
];

export default function EUChecklist() {
  const checklistStatus = useEthicsStore((s) => s.checklistStatus);
  const toggleChecklistItem = useEthicsStore((s) => s.toggleChecklistItem);

  const checkedCount = Object.values(checklistStatus).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
      <div className="px-5 pt-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-md bg-primary-bg text-primary flex items-center justify-center">
          <Shield className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-semibold text-dark">EU AI Act compliance checklist</h3>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checklistStatus[item.id] ?? false;
            return (
              <button
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                  isChecked
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-red-200 bg-red-50/30'
                }`}
              >
                <span
                  className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isChecked ? 'bg-primary text-white' : 'bg-danger text-white'
                  }`}
                >
                  {isChecked ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-dark">{item.title}</div>
                  <div className="text-[12px] text-muted leading-snug">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-border">
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-sm font-bold ${
            checkedCount >= 6 ? 'bg-amber-50 border border-amber-200 text-warning' : 'bg-red-50 border border-red-200 text-danger'
          }`}>
            <Shield className="w-4 h-4" />
            {checkedCount} / 8
          </span>
          <span className="text-[13px] text-muted">requirements met</span>
        </div>
      </div>
    </div>
  );
}
