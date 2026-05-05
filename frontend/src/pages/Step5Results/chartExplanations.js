/**
 * Bilingual explanations for the Step 5 chart containers (confusion matrix,
 * ROC, PR, cross-validation, overfit detector). Same shape as
 * `metricExplanations.js` so the same MetricInfoPopover component renders both.
 */
export const CHART_EXPLANATIONS = {
  confusion_matrix: {
    title: 'Confusion Matrix',
    clinical:
      'A 2×2 grid of predictions vs. reality. The diagonal cells (top-left and bottom-right) are correct calls — sick patients identified, healthy patients cleared. Off-diagonal cells are mistakes: missed diagnoses or false alarms.',
    technical:
      'Rows = actual class, columns = predicted class. Cells: TP (top-left), FN (top-right), FP (bottom-left), TN (bottom-right).',
    why: 'Different errors carry different clinical costs. A missed cancer diagnosis is not the same as a false-alarm referral. The matrix is the most honest single picture of where the model goes wrong.',
  },
  roc_curve: {
    title: 'ROC Curve',
    clinical:
      'Shows how well the model separates sick from healthy as we vary the decision threshold. The closer the curve hugs the top-left corner, the better. The dashed diagonal is what random guessing looks like.',
    technical:
      'Receiver Operating Characteristic: TPR (sensitivity) vs FPR (1 − specificity). AUC quantifies the area under the curve.',
    why: 'A threshold-independent measure of class separability. Two models with the same accuracy can have very different ROC curves.',
    thresholds: [
      { label: 'Excellent', range: 'AUC ≥ 0.90', color: 'success' },
      { label: 'Good', range: '0.80–0.89', color: 'success' },
      { label: 'Fair', range: '0.70–0.79', color: 'warning' },
      { label: 'Poor', range: '< 0.70', color: 'danger' },
    ],
  },
  pr_curve: {
    title: 'Precision-Recall Curve',
    clinical:
      'Shows the trade-off between catching more sick patients (recall) and being correct when alerting (precision). As the threshold changes, gaining one usually costs the other.',
    technical:
      'Precision (PPV) vs Recall (TPR). Preferred over ROC when classes are imbalanced because it focuses on the positive class.',
    why: 'When positive cases are rare (e.g., a rare disease), PR curves expose model behaviour that ROC can hide.',
  },
  cross_validation: {
    title: 'Cross-Validation',
    clinical:
      'The model was trained and tested several times on different splits of the same data. Consistent bars mean the model is stable; varying bars mean its score depends on which patients happen to land in the test set.',
    technical:
      'k-fold CV with k=5 by default. Each fold trains on 80% and tests on 20%. Mean ± std reflects model variance across folds.',
    why: 'A single train/test split can mislead. CV gives a more honest estimate of how the model would behave on new patients.',
  },
  overfit_detector: {
    title: 'Overfit Detector',
    clinical:
      'Compares how well the model performs on the data it was trained on (train) vs data it has never seen (test). A big gap means the model memorised the training set rather than learning general patterns — it will fail in deployment.',
    technical:
      'Overfitting gap = train_accuracy − test_accuracy. A healthy gap stays below 0.05; gaps above 0.10 suggest memorisation. Mitigations: regularisation, more data, simpler model.',
    why: 'A model scoring 98% on train and 70% on test is dangerous — it will look great in development and fail when it sees real patients.',
    thresholds: [
      { label: 'Healthy', range: 'gap < 0.05', color: 'success' },
      { label: 'Watch', range: '0.05–0.10', color: 'warning' },
      { label: 'Overfit', range: '> 0.10', color: 'danger' },
    ],
  },
};
