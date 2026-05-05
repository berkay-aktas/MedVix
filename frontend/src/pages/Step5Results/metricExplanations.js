/**
 * Plain-English + technical explanations for Step 5 performance metrics.
 * Each entry is a "bilingual card": clinical headline (clinician-friendly)
 * paired with a technical caption (data-scientist-friendly).
 *
 * `clinical` and `technical` may be functions taking the raw 0..1 value, so
 * the headline can interpolate the actual number ("catches 78 of every 100").
 */
export const METRIC_EXPLANATIONS = {
  accuracy: {
    title: 'Accuracy',
    clinical: (v) => `Out of every 100 patients, the model classifies ${Math.round(v * 100)} correctly.`,
    technical: (v) => `Accuracy = (TP + TN) / total · ${v.toFixed(2)}`,
    why: 'A quick overall view, but misleading on imbalanced datasets — a model that always predicts "healthy" can score 90% accuracy if 90% of patients are healthy.',
    thresholds: [
      { label: 'Strong', range: '≥ 0.85', color: 'success' },
      { label: 'OK', range: '0.70–0.84', color: 'warning' },
      { label: 'Weak', range: '< 0.70', color: 'danger' },
    ],
  },
  sensitivity: {
    title: 'Sensitivity',
    clinical: (v) => `Catches ${Math.round(v * 100)} of every 100 patients who actually have the condition.`,
    technical: (v) => `Sensitivity / Recall / TPR = TP / (TP + FN) · ${v.toFixed(2)}`,
    why: 'Critical when a missed diagnosis is costly — e.g., cancer screening, where letting a sick patient go untreated is worse than a false alarm.',
    thresholds: [
      { label: 'Strong', range: '≥ 0.80', color: 'success' },
      { label: 'OK', range: '0.50–0.79', color: 'warning' },
      { label: 'Unsafe', range: '< 0.50', color: 'danger' },
    ],
  },
  specificity: {
    title: 'Specificity',
    clinical: (v) => `Correctly clears ${Math.round(v * 100)} of every 100 patients who are actually healthy.`,
    technical: (v) => `Specificity / TNR = TN / (TN + FP) · ${v.toFixed(2)}`,
    why: 'Critical when false positives are costly — e.g., a high-stakes biopsy referral, where flagging a healthy patient causes anxiety and over-treatment.',
    thresholds: [
      { label: 'Strong', range: '≥ 0.80', color: 'success' },
      { label: 'OK', range: '0.60–0.79', color: 'warning' },
      { label: 'Weak', range: '< 0.60', color: 'danger' },
    ],
  },
  precision: {
    title: 'Precision',
    clinical: (v) => `When the model says a patient has the condition, it's right ${Math.round(v * 100)} times out of 100.`,
    technical: (v) => `Precision / PPV = TP / (TP + FP) · ${v.toFixed(2)}`,
    why: 'Reflects trust in a positive prediction. Low precision means many "positive" alerts are false alarms.',
    thresholds: [
      { label: 'Strong', range: '≥ 0.75', color: 'success' },
      { label: 'OK', range: '0.50–0.74', color: 'warning' },
      { label: 'Weak', range: '< 0.50', color: 'danger' },
    ],
  },
  f1: {
    title: 'F1 Score',
    clinical: (v) => `A balanced score combining sensitivity and precision: ${v.toFixed(2)} out of 1.0.`,
    technical: (v) => `F1 = 2 · (P × R) / (P + R) — harmonic mean · ${v.toFixed(2)}`,
    why: 'Useful when you need a single number that respects both "catching cases" and "being right when alerting." Harder to game than accuracy on imbalanced data.',
    thresholds: [
      { label: 'Strong', range: '≥ 0.75', color: 'success' },
      { label: 'OK', range: '0.50–0.74', color: 'warning' },
      { label: 'Weak', range: '< 0.50', color: 'danger' },
    ],
  },
  auc_roc: {
    title: 'AUC-ROC',
    clinical: (v) => `Pick one sick and one healthy patient at random — the model ranks the sick one as more likely sick ${Math.round(v * 100)}% of the time.`,
    technical: (v) => `Area Under the Receiver Operating Characteristic curve · ${v.toFixed(2)}`,
    why: 'Measures the model\'s ability to separate the two classes regardless of the decision threshold. 1.0 = perfect, 0.5 = no better than a coin flip.',
    thresholds: [
      { label: 'Excellent', range: '≥ 0.90', color: 'success' },
      { label: 'Good', range: '0.80–0.89', color: 'success' },
      { label: 'Fair', range: '0.70–0.79', color: 'warning' },
      { label: 'Poor', range: '< 0.70', color: 'danger' },
    ],
  },
};
