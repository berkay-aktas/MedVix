import {
  Stethoscope,
  Database,
  Settings2,
  Brain,
  BarChart3,
  Eye,
  Shield,
  Activity,
  Receipt,
  GitCompareArrows,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import Modal from '../ui/Modal';
import useModalStore from '../../stores/useModalStore';

const STEPS = [
  { n: 1, name: 'Clinical Context', icon: Stethoscope, desc: 'Pick a medical specialty. The page explains what the model predicts, why it matters clinically, and what the AI cannot do.' },
  { n: 2, name: 'Data Exploration', icon: Database, desc: 'Upload a CSV or load the built-in dataset. The Data Inspector lets you click any column to see its distribution and quality.' },
  { n: 3, name: 'Data Preparation', icon: Settings2, desc: 'Pick missing-value strategy, train/test split, normalisation, and SMOTE. Each option has an info icon explaining the choice.' },
  { n: 4, name: 'Model & Parameters', icon: Brain, desc: 'Choose 1 of 8 models. Drag hyperparameter sliders — every slider has a clinical + technical explanation.' },
  { n: 5, name: 'Results', icon: BarChart3, desc: 'See accuracy, sensitivity, ROC, confusion matrix, etc. Click any (i) to read what the metric means in plain language.' },
  { n: 6, name: 'Explainability', icon: Eye, desc: 'Patient Risk Map (PCA scatter), SHAP feature importance, and the Counterfactual Explorer.' },
  { n: 7, name: 'Ethics & Bias', icon: Shield, desc: 'Subgroup fairness, EU AI Act checklist, Pipeline Receipt narrative, and downloadable PDF certificate.' },
];

const FEATURES = [
  {
    icon: HelpCircle,
    title: 'Bilingual (i) popovers',
    desc: 'Every metric, chart, and hyperparameter has a small (i) icon. Click it to see a clinical explanation, the technical formula, why it matters, and threshold guidance — all in one card.',
  },
  {
    icon: Activity,
    title: 'Counterfactual Explorer (Step 6)',
    desc: 'Pick a patient on the Risk Map. Drag the sliders to change their values. The prediction recomputes live (~600 ms). Click "Auto-find smallest flip" to let the system pick the smallest single-feature change that flips the diagnosis.',
  },
  {
    icon: Receipt,
    title: 'Pipeline Receipt (Step 7)',
    desc: 'A deterministic plain-English paragraph summarising the entire session — dataset, prep, training, fairness, compliance. No AI generation; pure templating from session state. Copyable.',
  },
  {
    icon: GitCompareArrows,
    title: 'Side-by-side comparison (Step 5)',
    desc: 'Train multiple models, then click "Compare side-by-side" to see ROC curves overlaid, confusion matrices side by side, and a metrics table — all for the models you select (up to 4).',
  },
  {
    icon: Sparkles,
    title: 'Sticky model switcher',
    desc: 'When you have multiple trained models, the active model pills stay reachable: a thin compact bar fades in below the navbar when you scroll past the inline switcher.',
  },
];

const TIPS = [
  'Click the (i) icons everywhere — they translate technical metrics into clinical language.',
  'The bottom Continue / Previous buttons are the easiest way to walk forward; the stepper at the top is for jumping.',
  'Refreshing the page no longer loses your progress — pipeline state is persisted to localStorage.',
  'In Step 6, click any patient on the risk map to drill into their counterfactual. The page auto-scrolls only when you came from above.',
];

export default function UserGuideModal() {
  const { userGuideOpen, closeUserGuide } = useModalStore();

  return (
    <Modal
      isOpen={userGuideOpen}
      onClose={closeUserGuide}
      title="How MedVix works"
      subtitle="A quick tour of the 7-step pipeline and where to find each feature"
      width="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Intro */}
        <p className="text-sm text-slate-700 leading-relaxed">
          MedVix walks you through a complete machine-learning project in healthcare —
          from picking a medical specialty, through training and evaluating a model,
          to auditing its fairness — without writing any code. Every screen is designed
          to serve <strong>both clinicians and data scientists</strong> on the same page.
        </p>

        {/* 7-step pipeline */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            The 7-step pipeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {STEPS.map(({ n, name, icon: Icon, desc }) => (
              <div key={n} className="flex items-start gap-2.5 border border-border rounded-lg p-3 bg-white">
                <span className="w-7 h-7 rounded-md bg-primary-bg text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-mono font-semibold text-primary">Step {n}</span>
                    <span className="text-[11px] font-semibold text-dark truncate">{name}</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Headline features */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Headline features
          </h3>
          <div className="space-y-2.5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-border">
                <span className="w-7 h-7 rounded-md bg-white border border-border text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-dark mb-0.5">{title}</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Tips
          </h3>
          <ul className="space-y-1.5">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-muted border-t border-border pt-4">
          MedVix is a learning tool. Predictions and certificates do not constitute clinical
          validation or regulatory approval — clinical judgement remains essential.
        </div>
      </div>
    </Modal>
  );
}
