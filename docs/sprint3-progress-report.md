# MedVix — Weekly Progress Report

**Project**: MedVix — ML Visualization Tool for Healthcare
**Week**: 6 (Sprint 3 — Final Week)
**Scrum Master**: Berkay AKTAS
**Date**: 31 March 2026
**Sprint Gate**: 1 April 2026
**Domains Completed**: 20/20
**Sprint Velocity**: 32 SP delivered / 32 SP planned

---

## 1. Burndown Chart

**Sprint 3 Capacity**: 32 story points across 2 weeks (14 working days).

```
Sprint 3 Burndown — Story Points Remaining
-------------------------------------------
Day  | Ideal Remaining | Actual Remaining
-----|-----------------|------------------
 0   |      32         |       32
 1   |      30         |       32   (Day 1 sprint planning + API design)
 2   |      27         |       30   (Day 2 ML service scaffold)
 3   |      25         |       24   (Day 3 KNN + SVM + DT implemented)
 4   |      23         |       19   (Day 4 RF + LR + NB + XGB + LGBM)
 5   |      20         |       14   (Day 5 train endpoint + metrics)
 6   |      18         |       10   (Day 6 confusion matrix + ROC + CV)
 7   |      16         |        8   (Day 7 comparison endpoint + PR curve)
 8   |      14         |        8   (Day 8 frontend Step 4 model selector)
 9   |      11         |        5   (Day 9 hyperparameter panel + auto-retrain)
10   |       9         |        3   (Day 10 Step 5 metrics grid + charts)
11   |       7         |        2   (Day 11 comparison table + banners)
12   |       5         |        0   (Day 12 all stories closed)
13   |       2         |        0   (Day 13 test suite + bug fixes)
14   |       0         |        0   (Day 14 documentation + demo prep)
```

**Analysis**: Sprint 3 followed a backend-first approach. Days 1-7 focused on building the complete ML training service with all 8 models, metrics computation, and curve generation. The frontend work in Days 8-11 progressed rapidly because the API contract was already stable. All stories were closed two days ahead of the gate, with the final days dedicated to the 52-test automated suite, three bug fixes (P3+P4), and sprint documentation.

---

## 2. Completed This Week (All Sprint 3 Stories)

The following 8 user stories were completed and accepted during Sprint 3. All acceptance criteria pass as documented in the Sprint 3 Test Report.

| Story ID | Title | Story Points | Assignee | Status |
|----------|-------|-------------|---------|--------|
| MV-US-013 | Select ML algorithm from 6+ models | 5 | Berkay AKTAS | Done |
| MV-US-014 | Tune KNN K parameter with live slider | 3 | Berkay AKTAS | Done |
| MV-US-011 | Auto-retrain toggle with debounce | 3 | Berkay AKTAS | Done |
| MV-US-017 | View 6 performance metrics with color coding | 5 | Berkay AKTAS | Done |
| MV-US-018 | View confusion matrix with clinical banners | 5 | Ozge ALTINOK | Done |
| MV-US-019 | View ROC curve with AUC annotation | 3 | Ozge ALTINOK | Done |
| MV-US-015 | Compare two trained models side by side | 5 | Ozge ALTINOK | Done |
| MV-US-016 | View model comparison table | 3 | Ozge ALTINOK | Done |

**Total Delivered**: 32 story points (8 stories)

### Highlights

- **MV-US-013 (Model Selection)**: Delivered 8 model types instead of the required 6 — added XGBoost and LightGBM as advanced options with lazy imports to avoid startup overhead. Each model card shows clinical description and difficulty badge.
- **MV-US-017 (Metrics)**: All 6 required metrics (Accuracy, Sensitivity, Specificity, Precision, F1, AUC-ROC) plus Matthews Correlation Coefficient as a bonus. Color thresholds validated at boundary values. Sensitivity flagged as priority metric with star icon.
- **MV-US-018 (Confusion Matrix)**: Added clinical interpretation banners — red FN banner for missed diagnoses and blue FP banner for unnecessary follow-ups. Supports both binary (2x2) and multiclass (NxN).
- **MV-US-015 (Comparison)**: Implemented explicit "+ Compare" dropdown workflow with no-duplicate enforcement, per-row removal, "Compare All" shortcut, and sensitivity column color coding.

---

## 3. In Progress

None. All Sprint 3 stories are closed.

---

## 4. Blocked / At Risk

No stories are currently blocked.

**Watchlist for Sprint 4:**
- SHAP computation on larger datasets (>5,000 rows) may exceed acceptable response times — may need background processing or sampling
- PDF certificate generation requires a new library (e.g., ReportLab or jsPDF) not yet in dependencies
- Ethics subgroup analysis requires demographic columns that may not be present in all 20 datasets

---

## 5. Key Decisions Made This Sprint

### Decision 1: 8 Models Instead of 6

**Context**: The specification requires 6 ML models (KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes).
**Decision**: Added XGBoost and LightGBM as bonus "Advanced" models.
**Rationale**: Gradient boosting methods are industry-standard for tabular healthcare data and demonstrate the tool's extensibility.
**Trade-off**: Two additional dependencies (xgboost, lightgbm), but lazy-imported to avoid startup penalty.

### Decision 2: Recharts Over Plotly.js

**Context**: CLAUDE.md listed Plotly.js or Recharts as TBD for chart visualization.
**Decision**: Chose Recharts 3.8.0 for all Step 5 visualizations.
**Rationale**: Recharts is React-native (composable JSX components), has a smaller bundle (~150KB vs ~3MB for Plotly), and integrates naturally with Zustand state management.
**Trade-off**: Plotly has richer interactivity (zoom, pan, export), but Recharts meets all Sprint 3 requirements with less complexity.

### Decision 3: Client-Side Sensitivity Threshold

**Context**: Low sensitivity danger banner needs to appear when Sensitivity < 50%.
**Decision**: Computed entirely in the frontend from the metrics array returned by the training endpoint.
**Rationale**: Avoids adding a special-purpose boolean to the API response. The frontend already receives the full metrics list and can compute any threshold check.
**Trade-off**: If threshold logic changes, it must be updated in the frontend rather than centrally in the backend.

### Decision 4: 300ms Auto-Retrain Debounce

**Context**: Initial prototype used 500ms debounce for auto-retrain on slider changes.
**Decision**: Reduced to 300ms to match the Sprint 3 specification requirement (300ms ± 50ms).
**Rationale**: 300ms provides responsive feedback without overwhelming the API. Testing confirmed training completes in <200ms for typical datasets.
**Trade-off**: None significant — 300ms is well within acceptable UX latency.

---

## 6. Test Results

Complete test results are documented in [`docs/testing/sprint3-test-report.md`](testing/sprint3-test-report.md).

| Story ID | Story Title | AC Count | Passed | Failed | Status |
|----------|------------|----------|--------|--------|--------|
| MV-US-013 | Select ML algorithm | 6 | 6 | 0 | Pass |
| MV-US-014 | KNN K parameter slider | 6 | 6 | 0 | Pass |
| MV-US-011 | Auto-retrain toggle | 4 | 4 | 0 | Pass |
| MV-US-017 | 6 performance metrics | 6 | 6 | 0 | Pass |
| MV-US-018 | Confusion matrix | 5 | 5 | 0 | Pass |
| MV-US-019 | ROC curve | 4 | 4 | 0 | Pass |
| MV-US-015 | Compare two models | 5 | 5 | 0 | Pass |
| MV-US-016 | Comparison table | 4 | 4 | 0 | Pass |
| **Total** | **8 stories, 32 SP** | **40** | **40** | **0** | **100%** |

**Defects**: 0 P1, 0 P2, 1 P3 (F1 key mismatch — fixed), 2 P4 (description typo + comparison threshold — fixed)

**Automated Tests**: 52 pytest tests passing (23 Step 4 + 12 Step 5 + 17 existing Steps 1-3)

---

## 7. Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Stories completed | 8 | 8 | ✅ |
| Story points delivered | 32 | 32 | ✅ |
| ML models implemented | 6 | 8 | ✅ |
| Training latency (303 rows) | < 3,000 ms | < 200 ms | ✅ |
| Auto-retrain debounce | 300 ms ± 50 ms | 300 ms | ✅ |
| Metric color thresholds | 6/6 correct | 6/6 correct | ✅ |
| Automated test cases | ≥ 20 | 52 | ✅ |
| P1/P2 defects | 0 | 0 | ✅ |

---

## 8. Next Sprint Plan (Sprint 4 — Full Pipeline, Steps 6-7)

**Goal**: Implement SHAP explainability (Step 6) and ethics/bias audit (Step 7) to complete the full 7-step pipeline.

**Sprint Dates**: 1 April — 15 April 2026
**Sprint Gate**: 15 April 2026

| Story ID | Title | Story Points | Assignee | Priority |
|----------|-------|-------------|---------|----------|
| MV-US-020 | SHAP feature importance bar chart | 5 | Berkay AKTAS | Must |
| MV-US-021 | Single-patient waterfall explanation | 5 | Berkay AKTAS | Must |
| MV-US-022 | Subgroup fairness performance table | 5 | Ozge ALTINOK | Must |
| MV-US-023 | EU AI Act compliance checklist | 3 | Nisanur KONUR | Must |
| MV-US-024 | Bias detection red banner | 3 | Ozge ALTINOK | Must |
| MV-US-025 | Training data representation chart | 3 | Ozge ALTINOK | Should |
| MV-US-026 | Real-world AI failure case studies | 2 | Nisanur KONUR | Should |
| MV-US-027 | Download summary certificate (PDF) | 5 | Berkay AKTAS | Should |
| **Total** | | **31** | | |

**Technical Dependencies**:
- SHAP 0.46.0 already installed in requirements.txt
- PDF generation library (ReportLab or jsPDF) to be added
- Ethics endpoints require demographic column detection logic

---

## 9. Retrospective Note

Sprint 3 retrospective held 31 March 2026 with all 4 team members.

### Keep
- **Backend-first development with clear API contracts** saved significant integration time — frontend development proceeded smoothly against stable endpoints.

### Improve
- **Write automated tests alongside feature code**, not as a separate phase after implementation. The 2-day gap between feature completion and test writing could have caught the F1 key mismatch earlier.

### Try
- **Use Storybook for isolated UI component development** in Sprint 4, particularly for the SHAP waterfall chart and ethics checklist components.

---

*Submitted by*: Berkay AKTAS, Scrum Master
*Date*: 31 March 2026
