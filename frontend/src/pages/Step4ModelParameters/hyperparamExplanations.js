/**
 * Bilingual explanations for Step 4 model hyperparameters.
 * Keyed by raw param name (matches backend hyperparam definitions).
 * Missing entries simply render no `(i)` icon (graceful fallback).
 */
export const HYPERPARAM_EXPLANATIONS = {
  // -------- KNN -----------------------------------------------------------
  n_neighbors: {
    title: 'Number of Neighbours (k)',
    clinical: (v) => `When predicting a new patient, the model looks at the ${v} most similar patients in the training data and lets them vote on the diagnosis.`,
    technical: (v) => `KNN k = ${v}. Smaller k → low bias, high variance (sensitive to noise). Larger k → smoother decision boundary, may underfit.`,
    why: 'Odd values avoid ties on binary problems. Sweet spot is often √N where N = training size.',
  },
  weights: {
    title: 'Neighbour Weighting',
    clinical: '"Uniform" gives every nearby patient an equal vote. "Distance" gives closer patients more weight than further ones.',
    technical: '`uniform` = equal contribution; `distance` = weight inversely proportional to distance.',
    why: 'Distance weighting helps when nearby points are more reliable than the k-th furthest point.',
  },
  metric: {
    title: 'Distance Metric',
    clinical: 'How "similarity" between two patients is measured. Different metrics emphasise different feature types.',
    technical: 'Euclidean (L2) is standard for continuous features. Manhattan (L1) is robust to outliers. Minkowski generalises both.',
    why: 'Euclidean is the safe default. Manhattan if your data has outliers or high-dimensional sparsity.',
  },

  // -------- SVM / Logistic Regression -------------------------------------
  C: {
    title: 'Regularisation Strength (C)',
    clinical: (v) => `Controls how strictly the model fits the training data. Larger values fit more aggressively (risk overfitting); smaller values force a simpler model.`,
    technical: (v) => `Inverse regularisation parameter, C = ${v}. Used in SVM and Logistic Regression. Larger C → less regularisation, narrower margin in SVM.`,
    why: 'Small C → high bias, low variance. Large C → low bias, high variance. Tune via cross-validation.',
  },
  kernel: {
    title: 'SVM Kernel',
    clinical: '"Linear" draws a straight boundary between classes. "RBF" / "Poly" can draw curved boundaries for more complex patterns.',
    technical: '`linear`, `rbf` (radial basis function), `poly` (polynomial), `sigmoid`. RBF is the default for non-linear problems.',
    why: 'Start linear; if accuracy plateaus and you suspect non-linear patterns, switch to RBF.',
  },
  gamma: {
    title: 'Kernel Coefficient (γ)',
    clinical: 'For RBF/poly kernels: how localised the influence of each training point is. Higher γ = each patient affects only nearby decisions.',
    technical: 'γ = 1/(2σ²) for RBF. `scale` (default) sets γ = 1/(n_features · X.var()). Larger γ → more complex boundary, risk overfit.',
    why: 'Pair with C: high γ + high C = aggressive overfitting. Tune jointly.',
  },
  degree: {
    title: 'Polynomial Degree',
    clinical: 'How "wiggly" the polynomial decision boundary can be. Higher = more flexible but more overfitting risk.',
    technical: 'Degree of the polynomial kernel. Only used when `kernel=poly`.',
    why: 'Degrees 2–3 are typical. Higher rarely helps and is computationally expensive.',
  },

  // -------- Tree-based ----------------------------------------------------
  max_depth: {
    title: 'Tree Depth',
    clinical: (v) => `How many "yes/no" questions the tree chains together. Deeper trees can capture more complex patterns but may memorise the training set.`,
    technical: (v) => `Maximum depth = ${v}. Increasing capacity raises overfit risk; below ~5 forces simple, interpretable trees.`,
    why: 'Classic capacity/overfit knob. Cross-validate to find the sweet spot.',
  },
  min_samples_split: {
    title: 'Min Samples per Split',
    clinical: 'A node is only allowed to split into subgroups if it has at least this many patients. Larger values prevent the tree from over-specialising on small slices of data.',
    technical: 'Minimum samples required to consider splitting an internal node. Higher → simpler tree.',
    why: 'Use values like 5–20 to combat overfitting on small datasets.',
  },
  min_samples_leaf: {
    title: 'Min Samples per Leaf',
    clinical: 'Every final group (leaf) must contain at least this many patients — prevents the tree from making predictions based on tiny samples.',
    technical: 'Minimum samples in each leaf node. A regularisation lever distinct from min_samples_split.',
    why: 'Higher values smooth predictions but may underfit. Often 1–5 is fine.',
  },
  criterion: {
    title: 'Split Quality Measure',
    clinical: 'How the tree decides which feature to split on at each step. Different criteria penalise impurity slightly differently.',
    technical: '`gini` (default, fast), `entropy` (information gain), `log_loss`. Practically interchangeable on most datasets.',
    why: 'Default `gini` is almost always fine. Switch to `entropy` only if specifically required.',
  },
  n_estimators: {
    title: 'Number of Trees',
    clinical: (v) => `How many separate trees vote on each prediction. ${v} trees vote, the majority wins (or the average is taken).`,
    technical: (v) => `Number of trees in the ensemble (Random Forest, XGBoost, LightGBM). More trees = more stable but slower.`,
    why: 'Returns diminish past 100–500 trees. Worth bumping if individual trees are weak.',
  },
  max_features: {
    title: 'Features per Split',
    clinical: 'Each tree considers a random subset of features at each split — this prevents trees from all looking the same.',
    technical: '`sqrt` (typical), `log2`, or an integer. Forces diversity in the ensemble; reduces variance.',
    why: '`sqrt` of n_features is a strong default for Random Forests.',
  },
  learning_rate: {
    title: 'Learning Rate (η)',
    clinical: 'How quickly the model corrects its mistakes between successive trees. Smaller = slower but steadier learning.',
    technical: 'Boosting step size, η. Smaller η usually requires more n_estimators. Common range 0.01–0.3.',
    why: 'Lower η + more trees often beats higher η + few trees on accuracy. Trade compute for performance.',
  },
  subsample: {
    title: 'Row Subsampling',
    clinical: 'Each tree is trained on a random fraction of the patients. Adds diversity and reduces overfitting.',
    technical: 'Fraction of training rows sampled (without replacement) per tree. 0.5–1.0 typical.',
    why: 'Values < 1.0 act as regularisation. Combine with column subsampling for more variance reduction.',
  },
  num_leaves: {
    title: 'Number of Leaves',
    clinical: 'How many final decision groups each tree can have. More leaves = more nuance, more overfitting risk.',
    technical: 'LightGBM\'s leaf-wise growth limit. Should stay below 2^max_depth for balanced trees.',
    why: 'LightGBM-specific. Tune with max_depth — too many leaves on shallow trees does nothing.',
  },

  // -------- Logistic Regression -------------------------------------------
  penalty: {
    title: 'Regularisation Type',
    clinical: '"L2" pulls all feature weights toward zero gently. "L1" can drive some weights exactly to zero (built-in feature selection).',
    technical: '`l2` = ridge (default), `l1` = lasso (sparsity), `elasticnet` = mix, `none`. Constraint depends on solver.',
    why: 'L2 is the safe default. L1 if you want a smaller, more interpretable model.',
  },
  solver: {
    title: 'Optimisation Solver',
    clinical: 'The algorithm that searches for the best weights. Different solvers handle different penalty types and dataset sizes.',
    technical: '`lbfgs` (default, L2), `liblinear` (small datasets, L1/L2), `saga` (large datasets, all penalties).',
    why: 'lbfgs is fine for most cases. Use liblinear for small data with L1.',
  },
  max_iter: {
    title: 'Max Iterations',
    clinical: 'How long the algorithm is allowed to keep refining the model before giving up.',
    technical: 'Convergence cap for the optimiser. If you see "ConvergenceWarning", raise this.',
    why: 'Default 100–1000 is usually enough. Bump if the model fails to converge.',
  },

  // -------- Naive Bayes ---------------------------------------------------
  var_smoothing: {
    title: 'Variance Smoothing',
    clinical: 'A tiny adjustment that keeps the math stable when a feature has very little variation in the training data.',
    technical: 'Portion of the largest variance added to all feature variances for calculation stability.',
    why: 'Default 1e-9 is fine in nearly all cases.',
  },
};
