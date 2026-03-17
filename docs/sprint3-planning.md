# MedVix — Sprint 3 Planning Notes

**Project**: MedVix — ML Visualization Tool for Healthcare
**Sprint**: Sprint 3 — Core ML (Steps 4-5)
**Sprint Start**: 18 March 2026
**Sprint Gate**: 1 April 2026
**Duration**: 2 weeks (14 days)
**Scrum Master**: Berkay AKTAS
**Product Owner**: Nisanur KONUR
**Planning Session Date**: 18 March 2026

---

## 1. Sprint 3 Theme and Goals

**Theme**: Core ML — Model Selection, Training, and Evaluation

Sprint 3 delivers Steps 4 and 5 of the MedVix pipeline:

- **Step 4 — Model and Parameters**: Users select one of six ML algorithms (KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes), tune hyperparameters via sliders and dropdowns, and optionally enable auto-retrain. The model is trained on the prepared data from Sprint 2.

- **Step 5 — Results**: Users see a comprehensive evaluation dashboard: accuracy, sensitivity, specificity, precision, F1 score, AUC-ROC, confusion matrix, and ROC curve. An optional side-by-side model comparison allows users to contrast two models.

At the end of Sprint 3, a user should be able to complete a full end-to-end ML pipeline run from domain selection through to a trained model with a visualised results dashboard.

---

## 2. Sprint 3 Stories

### 2.1 Refined Story List with Assignees and Estimates

| Story ID | Title | Epic | SP | Assignee | Priority |
|----------|-------|------|----|---------|---------|
| MV-US-013 | Select ML algorithm from dropdown | EP-04 | 5 | Berkay AKTAS | Must Have |
| MV-US-014 | Set K parameter for KNN | EP-04 | 5 | Berkay AKTAS | Must Have |
| MV-US-015 | Toggle auto-retrain on parameter change | EP-04 | 3 | Ozge ALTINOK | Should Have |
| MV-US-016 | Compare two models side-by-side | EP-04 | 5 | Ozge ALTINOK | Should Have |
| MV-US-017 | View accuracy, sensitivity, specificity, precision, F1, AUC | EP-05 | 5 | Berkay AKTAS | Must Have |
| MV-US-018 | View confusion matrix | EP-05 | 3 | Ozge ALTINOK | Must Have |
| MV-US-019 | View ROC curve | EP-05 | 3 | Berkay AKTAS | Must Have |
| MV-US-011 | Toggle SMOTE in preparation (Step 3 enhancement) | EP-03 | 3 | Berkay AKTAS | Should Have |

**Sprint 3 Total**: 32 story points

### 2.2 Must Have vs Should Have

**Must Have (18 SP)**: MV-US-013, MV-US-014, MV-US-017, MV-US-018, MV-US-019

These stories form the minimum viable Step 4-5 experience. Without them, users cannot train a model or see any evaluation results.

**Should Have (14 SP)**: MV-US-011, MV-US-015, MV-US-016

These enhance the experience significantly (auto-retrain, model comparison, SMOTE toggle) but the core pipeline functions without them. If Sprint 3 faces delays, these are the first candidates for deferral to Sprint 4.

---

## 3. Story Details and Acceptance Criteria Summary

### MV-US-013: Select ML Algorithm

**As a** healthcare professional, **I want to** select from six ML algorithms, **so that** I can train the model that best fits my clinical dataset.

**Acceptance Criteria**:
- Dropdown shows all 6 options: KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes
- Selecting an algorithm shows its relevant hyperparameter controls
- Default algorithm is Random Forest (generally highest accuracy out of the box)
- API `POST /api/model/train` accepts `algorithm` field
- Training is triggered by clicking "Train Model" (or automatically if auto-retrain is enabled)

**Backend work**: New router `routers/model.py`; new service `services/model_service.py`; scikit-learn model factory

### MV-US-014: Set K for KNN

**As a** healthcare professional, **I want to** adjust the K parameter for the KNN algorithm, **so that** I can control how many neighbours influence the prediction.

**Acceptance Criteria**:
- Slider visible when KNN is selected
- Range: 1-20 (default K=5)
- Changing K triggers retraining if auto-retrain is on
- API accepts `hyperparams: {"n_neighbors": K}`
- Out-of-range K values (< 1, > 20) rejected

**Backend work**: Hyperparameter validation in `PreparationConfig`-equivalent model config Pydantic model

### MV-US-015: Toggle Auto-Retrain

**As a** healthcare professional, **I want to** enable auto-retrain, **so that** the model automatically retrains whenever I change a hyperparameter without clicking Train manually.

**Acceptance Criteria**:
- Toggle switch visible in Step 4
- When on: any hyperparameter change triggers `POST /api/model/train` immediately
- When off: user must click "Train Model" manually
- Auto-retrain adds a debounce delay of 500ms to prevent excessive API calls during slider dragging

### MV-US-016: Compare Two Models

**As a** healthcare professional, **I want to** compare two model configurations side-by-side, **so that** I can choose the better algorithm for my dataset.

**Acceptance Criteria**:
- "Add Comparison Model" button in Step 5
- Second model panel appears with independent algorithm and hyperparameter selection
- Metrics for both models shown side-by-side (accuracy, F1, AUC)
- ROC curves for both models overlaid on single chart
- "Clear Comparison" button removes the secondary model

### MV-US-017: View Evaluation Metrics

**As a** healthcare professional, **I want to** view all key ML performance metrics, **so that** I can evaluate whether the model is clinically trustworthy.

**Acceptance Criteria**:
- After training: Accuracy, Sensitivity (Recall), Specificity, Precision, F1 Score, AUC-ROC displayed
- Values shown as percentages (0-100%) with 2 decimal places
- Each metric has a tooltip explaining its clinical meaning
- API `GET /api/model/results?session_id=X` returns all metrics
- "No model trained" state shown if training hasn't occurred

### MV-US-018: View Confusion Matrix

**As a** healthcare professional, **I want to** see the confusion matrix, **so that** I can understand the error types the model makes (false positives vs false negatives).

**Acceptance Criteria**:
- 2×2 grid for binary classification; N×N for multi-class
- Cells colour-coded: diagonal (correct predictions) in green shades, off-diagonal (errors) in red shades
- Cell values show count and percentage
- Row/column labels show actual and predicted class names (not "0"/"1")
- Clicking a cell shows a tooltip with contextual clinical interpretation (e.g., "False Negatives: These are the X patients with actual disease who were missed")

### MV-US-019: View ROC Curve

**As a** healthcare professional, **I want to** see the ROC curve with AUC score, **so that** I can understand the model's discrimination ability at different clinical decision thresholds.

**Acceptance Criteria**:
- ROC curve plotted (Sensitivity vs 1-Specificity) using Recharts
- AUC value displayed prominently on the chart (e.g., "AUC = 0.89")
- Diagonal reference line ("random classifier") shown
- Hovering on the curve shows the Sensitivity and Specificity values at that threshold point
- Chart is responsive (adapts to container width)

### MV-US-011: Toggle SMOTE (Step 3 Enhancement)

**As a** healthcare professional, **I want to** explicitly toggle SMOTE on/off for imbalanced datasets, **so that** I control whether synthetic samples are used in my training.

**Acceptance Criteria**:
- SMOTE toggle is enabled (not greyed out) when `is_imbalanced: true` from data summary
- When `is_imbalanced: false`, toggle is disabled with tooltip: "No class imbalance detected — SMOTE not required"
- SMOTE toggle state persists on the session
- `apply_smote: true/false` correctly passed to `POST /api/data/prepare`

---

## 4. Sprint 3 Technical Dependencies

### 4.1 Dependencies from Sprint 2 (Must Be Stable)

| Dependency | Owner | Risk |
|-----------|-------|------|
| `session.X_train`, `session.X_test`, `session.y_train`, `session.y_test` as numpy arrays on session | Berkay | Low — implemented and tested in Sprint 2 |
| `session.is_prepared: true` gate for model training | Berkay | Low — tested in Sprint 2 |
| `session.feature_columns` list for feature name display | Berkay | Low |
| `session.target_column` for confusion matrix label names | Berkay | Low |

### 4.2 New Backend Components Required in Sprint 3

**New Router**: `backend/app/routers/model.py`

Endpoints to implement:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/model/train` | Train a model on prepared session data |
| GET | `/api/model/results` | Get evaluation metrics and predictions for the trained model |
| GET | `/api/model/confusion-matrix` | Get confusion matrix data |
| GET | `/api/model/roc-curve` | Get ROC curve data points |

**New Service**: `backend/app/services/model_service.py`

Functions to implement:
- `train_model(session, config)` — factory pattern supporting all 6 algorithms
- `compute_metrics(y_test, y_pred, y_proba)` — accuracy, sensitivity, specificity, precision, F1, AUC
- `compute_confusion_matrix(y_test, y_pred, classes)` — labelled confusion matrix
- `compute_roc_curve(y_test, y_proba)` — FPR/TPR arrays for plotting

**New Pydantic Models**: `backend/app/models/model.py`

- `ModelConfig` — algorithm selection, hyperparameters
- `TrainingResult` — training time, model performance summary
- `EvaluationMetrics` — all six metrics
- `ConfusionMatrixData` — labelled matrix
- `ROCCurveData` — FPR/TPR/threshold arrays

**Session State Additions**:

```python
# New fields to add to SessionState
trained_model: Optional[Any] = None       # scikit-learn fitted estimator
y_pred: Optional[np.ndarray] = None       # predicted classes
y_proba: Optional[np.ndarray] = None      # predicted probabilities
model_config: Optional[dict] = None       # algorithm + hyperparameters used
evaluation_metrics: Optional[dict] = None # computed metrics
```

**Supported Algorithms and Default Hyperparameters**:

| Algorithm | Class | Key Hyperparameters |
|-----------|-------|---------------------|
| KNN | `KNeighborsClassifier` | `n_neighbors=5`, metric=euclidean |
| SVM | `SVC` | `C=1.0`, `kernel=rbf`, `probability=True` |
| Decision Tree | `DecisionTreeClassifier` | `max_depth=5`, `min_samples_split=2` |
| Random Forest | `RandomForestClassifier` | `n_estimators=100`, `max_depth=5` |
| Logistic Regression | `LogisticRegression` | `C=1.0`, `max_iter=1000` |
| Naive Bayes | `GaussianNB` | No key hyperparameters |

**Frontend Components Required**:

- `AlgorithmSelector` — dropdown with 6 options
- `HyperparameterPanel` — dynamic controls based on selected algorithm
- `MetricsGrid` — 6-metric display with tooltip explanations
- `ConfusionMatrixChart` — colour-coded grid using Recharts
- `ROCCurveChart` — line chart with AUC annotation
- `ModelComparisonPanel` — side-by-side metric and ROC comparison

---

## 5. Technical Risks

### Risk 1: Model Training Latency

**Description**: SVM with RBF kernel has O(n²) to O(n³) complexity. On the Framingham dataset (4,238 rows × 15 features), training time may exceed 10 seconds, causing the React frontend to appear frozen.

**Likelihood**: Medium (SVM is the most computationally expensive algorithm; most built-in datasets are small)

**Impact**: High (user frustration, perceived failure)

**Mitigation**:
- Implement a training loading state (`is_training: true`) with a spinner in the UI
- Set `C=1.0` as default (not a large value) to limit SVM complexity
- For datasets > 2,000 rows, suggest Logistic Regression or Naive Bayes as faster alternatives
- If training exceeds 30 seconds, implement FastAPI BackgroundTasks to run training asynchronously
- Consider limiting SVM to max 2,000 training rows with a UI warning for larger datasets

### Risk 2: SHAP Computation Time (Visible from Sprint 4)

**Description**: SHAP TreeExplainer for Random Forest with 100 trees on datasets with >500 rows and >20 features can take 15-30 seconds.

**Likelihood**: High (SHAP is used in every session where RF is selected)

**Impact**: Medium (delays Step 6, but not critical for Sprint 3)

**Mitigation**:
- Pre-compute SHAP values as part of the model training response (background task)
- Cache SHAP values on session object so repeat requests are instant
- Limit SHAP computation to max 100 background test samples by default (configurable)

### Risk 3: Multi-class Metric Computation

**Description**: Some domains (Dermatology, Thyroid, Arrhythmia, Fetal Health, Spine) use multi-class targets. Standard binary metrics (sensitivity, specificity, AUC) require multi-class adaptations (weighted-average or per-class).

**Likelihood**: High (4 out of 20 domains are multi-class)

**Impact**: Medium (metrics display incorrectly or crashes for multi-class)

**Mitigation**:
- Use `average='weighted'` for sklearn metrics on multi-class
- Use `roc_auc_score` with `multi_class='ovr'` for AUC on multi-class
- Add a `problem_type` field to session from domain metadata to select correct metric variants
- Confusion matrix must be N×N for multi-class — the ConfusionMatrixChart must handle variable dimensions

### Risk 4: ROC Curve for Multi-class

**Description**: The standard ROC curve is defined for binary classification. Multi-class ROC requires one-vs-rest (OvR) curves or micro/macro averaging.

**Likelihood**: High (same 4 domains)

**Impact**: Low (ROC display can be deferred to per-class view for multi-class in Sprint 4 if needed)

**Mitigation**:
- For binary: standard single ROC curve
- For multi-class: plot one ROC curve per class (OvR) with a legend
- If complexity is too high for Sprint 3, show AUC score only for multi-class without the full curve (deferred to Sprint 4)

### Risk 5: Logistic Regression Convergence Warnings

**Description**: scikit-learn's LogisticRegression emits `ConvergenceWarning` if `max_iter` is insufficient for the dataset. These warnings surface in the backend logs and may confuse the team.

**Likelihood**: High (common with many datasets at default settings)

**Impact**: Low (model still trains; warning is non-breaking)

**Mitigation**:
- Set `max_iter=1000` as default for LogisticRegression (higher than sklearn default of 100)
- Catch ConvergenceWarning and include a note in the API response: "Model converged successfully" or "Note: solver required extra iterations"

---

## 6. Definition of Done for Sprint 3

Each user story in Sprint 3 is "Done" when:

- [ ] All acceptance criteria from the Jira story pass (verified by Arzu)
- [ ] Backend endpoint(s) documented in `docs/api-docs-sprint3.md` (to be created)
- [ ] At least one pytest test case for each new API endpoint
- [ ] UI component matches Figma wireframe (verified by Ozge)
- [ ] Model training gate tested: `POST /api/model/train` returns 400 if `is_prepared: false`
- [ ] Metrics are numerically correct: verified against sklearn's built-in metric functions in unit tests
- [ ] ROC curve renders for both balanced and imbalanced datasets
- [ ] Confusion matrix renders for both binary and multi-class targets
- [ ] No `console.error` in browser DevTools during the complete Step 4-5 happy path
- [ ] Code merged to `main` via feature branch PR with at least one review
- [ ] Story marked "Done" in Jira with link to passing test evidence

---

## 7. Sprint 3 Ceremonies

| Ceremony | Date | Duration | Location |
|----------|------|----------|----------|
| Sprint Planning | 18 March 2026 | 2 hours | Teams / in-person |
| Daily Standup | Daily 09:30 | 15 min | Teams |
| Sprint Review / Demo | 1 April 2026 | 30 min | Classroom |
| Sprint Retrospective | 1 April 2026 | 30 min | Teams |
| Backlog Refinement | 25 March 2026 | 1 hour | Teams |

---

## 8. Sprint 3 Backlog Refinement Notes

During Sprint 2's backlog refinement session, the following decisions were made for Sprint 3 stories:

**MV-US-013 (Algorithm Selection)**:
- Split point agreed: the algorithm dropdown and "Train" button constitute the minimum viable story. Advanced hyperparameter UI (beyond KNN's K slider) will be incremental.
- The model training endpoint will return training duration in milliseconds as a UI quality metric.

**MV-US-014 (KNN K Slider)**:
- Range limited to K=1 through K=20 to prevent overfitting (K=1) and underfitting (K >20 for most dataset sizes).
- The slider label should show "K=5 neighbours" rather than just "5" for clarity.
- MV-US-014 depends on MV-US-013 — KNN hyperparameter controls only appear when KNN is selected.

**MV-US-016 (Model Comparison)**:
- Complexity concern raised: full comparison requires storing two independent model states on the session. Decision: Session will hold `model_a` and `model_b` slots.
- Story may be split in Sprint 3 if 5 SP is insufficient. Acceptance criteria allow comparison to show only metrics (not full SHAP comparison — that is Sprint 4 scope).

**MV-US-017 (Metrics Dashboard)**:
- Product Owner confirmed: all 6 metrics (Accuracy, Sensitivity, Specificity, Precision, F1, AUC) are required for the course submission. The evaluation panel must resemble the mockup in `Submission 1/ML_Tool_User_Guide.pdf` Step 5 screens.

**MV-US-018 (Confusion Matrix)**:
- Decision: class labels shown in confusion matrix will use the original target class names from `domain.target_classes` (e.g., "Heart Disease" / "Healthy", not "1" / "0"), requiring the session to carry the label encoder mapping.

---

## 9. Team Capacity

| Team Member | Available Days (Sprint 3) | Notes |
|-------------|--------------------------|-------|
| Berkay AKTAS | 10 / 10 | Full availability |
| Arzu Tugce KOCA | 9 / 10 | Midterm exams Week 5 |
| Nisanur KONUR | 8 / 10 | Product Owner — partial availability during midterms |
| Ozge ALTINOK | 10 / 10 | Full availability |

**Total Team Capacity**: ~37 effective person-days. Sprint 3 is 32 SP, which is within comfortable capacity given Sprint 2's 50 SP delivery rate.

---

## 10. Sprint 3 Success Metrics

| Metric | Target |
|--------|--------|
| Training Success Rate | All 6 algorithms train successfully on all 20 built-in datasets |
| Metrics Accuracy | Sklearn metrics match manually computed values within 0.001 |
| ROC Curve Rendering | Binary ROC renders for all 16 binary domains |
| Confusion Matrix | Correct N×N dimensions for both binary and multi-class |
| Training Latency | < 5 seconds for all built-in datasets on all algorithms except SVM |
| Test Coverage | 100% of Sprint 3 stories have passing tests by gate date |
| Gate Demo | Full pipeline (domain → upload → prepare → train → metrics) demonstrated in < 3 minutes |
