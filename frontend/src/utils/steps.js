/**
 * Pipeline step definitions for the 7-step MedVix workflow.
 */
const STEPS = [
  {
    number: 1,
    label: 'Clinical Context',
    sublabel: 'Problem definition',
  },
  {
    number: 2,
    label: 'Data Exploration',
    sublabel: 'Upload & inspect',
  },
  {
    number: 3,
    label: 'Data Preparation',
    sublabel: 'Clean & transform',
  },
  {
    number: 4,
    label: 'Model & Parameters',
    sublabel: 'Select & tune',
  },
  {
    number: 5,
    label: 'Results',
    sublabel: 'Metrics & charts',
  },
  {
    number: 6,
    label: 'Explainability',
    sublabel: 'SHAP analysis',
  },
  {
    number: 7,
    label: 'Ethics & Bias',
    sublabel: 'Fairness audit',
  },
];

export default STEPS;
