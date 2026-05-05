/**
 * Bilingual explanations of each ML model in Step 4.
 * Uses the same shape as MetricInfoPopover content for consistency.
 */
export const MODEL_EXPLANATIONS = {
  knn: {
    title: 'K-Nearest Neighbours',
    clinical:
      'When predicting a new patient, the model finds the K most similar patients in the training data (by clinical measurements) and lets them vote on the diagnosis.',
    technical:
      'Non-parametric, instance-based learner. Distance metric (Euclidean / Manhattan / Minkowski) plus K determines the decision. Training is essentially free; prediction is O(N) per query.',
    why:
      'Best when "patients who look similar tend to have similar outcomes." Sensitive to feature scaling and to noisy outliers. Avoid when the dataset is very large or very high-dimensional.',
  },
  svm: {
    title: 'Support Vector Machine',
    clinical:
      'Draws the most confident dividing line between sick and healthy patients in feature space. With non-linear kernels, the line can curve to capture complex patterns.',
    technical:
      'Maximum-margin classifier. Linear kernel for linearly separable data; RBF/poly for non-linear. The cost parameter C balances margin width against training-set errors.',
    why:
      'Strong on small-to-medium high-dimensional datasets. Slower than tree models on big data. Tuning C and gamma jointly is essential for non-linear kernels.',
  },
  decision_tree: {
    title: 'Decision Tree',
    clinical:
      'A series of yes/no questions about the patient (e.g., "Is resting BP > 140?") that ends in a diagnosis. The path from root to leaf is the model\'s reasoning.',
    technical:
      'Recursive partitioning by Gini impurity (default) or entropy. Highly interpretable but variance-prone — small changes in data can produce a very different tree.',
    why:
      'Pick when explainability is non-negotiable. Combine with max_depth and min_samples_leaf to fight overfitting. For accuracy, an ensemble (Random Forest, XGBoost) usually wins.',
  },
  random_forest: {
    title: 'Random Forest',
    clinical:
      'Trains many decision trees on slightly different patient samples and feature subsets, then has them vote. Averaging out their disagreements is what makes the prediction stable.',
    technical:
      'Bagging ensemble of CART trees, with row + column subsampling. Reduces variance versus a single tree at the cost of interpretability and memory.',
    why:
      'Great default for tabular clinical data. Handles missing values, mixed feature types, and class imbalance reasonably out of the box. SHAP works well on it.',
  },
  logistic_regression: {
    title: 'Logistic Regression',
    clinical:
      'A weighted score: each feature gets a coefficient, the model adds them up, and squashes the result into a probability between 0 and 1.',
    technical:
      'Linear model with sigmoid output and cross-entropy loss. Coefficients are odds-ratio interpretable. Regularised by L1 (sparsity) or L2 (shrinkage), tuned via C.',
    why:
      'The standard in clinical research because coefficients map directly to odds ratios. Strong baseline; underperforms when interactions / non-linearities matter.',
  },
  naive_bayes: {
    title: 'Naive Bayes',
    clinical:
      'Computes the probability of each diagnosis assuming features contribute independently — a "naive" assumption that often works surprisingly well.',
    technical:
      'Gaussian Naive Bayes for continuous features. P(class) × Π P(feature|class). Very fast, low-data efficient, but the independence assumption violates clinical reality.',
    why:
      'Fast baseline that handles small datasets gracefully. Typically beaten by tree ensembles when features are correlated (which clinical features often are).',
  },
  xgboost: {
    title: 'XGBoost',
    clinical:
      'Builds trees one after another, where each new tree focuses on the patients the previous trees misclassified. The result is a highly accurate ensemble.',
    technical:
      'Gradient boosting with second-order optimisation, regularisation (L1+L2), and shrinkage (learning_rate). Wins most tabular ML benchmarks.',
    why:
      'Top-tier accuracy on tabular data. Requires more tuning than Random Forest — pair learning_rate with n_estimators and max_depth. SHAP integrates natively.',
  },
  lightgbm: {
    title: 'LightGBM',
    clinical:
      'Like XGBoost but optimised for speed: it grows trees leaf-by-leaf instead of level-by-level, which is faster and often slightly more accurate on big datasets.',
    technical:
      'Histogram-based gradient boosting with leaf-wise tree growth. Faster training and lower memory than XGBoost on large datasets. Tune num_leaves jointly with max_depth.',
    why:
      'Pick over XGBoost when training is the bottleneck (large N or many features). Slightly more sensitive to overfitting on small datasets — keep max_depth modest.',
  },
};
