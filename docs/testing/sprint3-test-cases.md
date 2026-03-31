# MedVix — Sprint 3 Test Cases

**Project**: MedVix — ML Visualization Tool for Healthcare
**Sprint**: Sprint 3 (Weeks 5-6)
**Document Version**: 1.0
**Author**: Arzu Tugce KOCA (QA Lead)
**Date**: 31 March 2026

---

## Legend

| Priority | Description |
|----------|------------|
| P1 | Critical — blocks sprint gate |
| P2 | High — major feature broken |
| P3 | Medium — minor feature gap |
| P4 | Low — cosmetic issue |

| Status | Meaning |
|--------|---------|
| Pass | Test executed and met expected result |
| Fail | Test executed and did not meet expected result |
| Blocked | Test could not be executed due to dependency |
| Not Run | Test not yet executed |

---

## Section 1: Model Selection (MV-US-013)

---

### TC-101

| Field | Value |
|-------|-------|
| **TC-ID** | TC-101 |
| **Story** | MV-US-013 |
| **Scenario** | Display 8 model cards in grid layout |
| **Preconditions** | Data prepared in Step 3; user navigates to Step 4 |
| **Steps** | 1. Navigate to Step 4. 2. Observe the model selector grid. |
| **Expected Result** | 8 model cards displayed: KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes, XGBoost, LightGBM. Each shows name, icon, description, and difficulty badge. |
| **Priority** | P1 |

---

### TC-102

| Field | Value |
|-------|-------|
| **TC-ID** | TC-102 |
| **Story** | MV-US-013 |
| **Scenario** | Click KNN card — hyperparameter panel appears |
| **Preconditions** | Step 4 visible with 8 model cards |
| **Steps** | 1. Click the KNN model card. 2. Observe the panel below. |
| **Expected Result** | Hyperparameter panel slides in showing KNN-specific controls: K slider, distance metric dropdown, weight function dropdown. KNN card shows selected state with checkmark. |
| **Priority** | P1 |

---

### TC-103

| Field | Value |
|-------|-------|
| **TC-ID** | TC-103 |
| **Story** | MV-US-013 |
| **Scenario** | Click SVM card — different parameters shown |
| **Preconditions** | KNN previously selected |
| **Steps** | 1. Click the SVM model card. 2. Observe parameter panel updates. |
| **Expected Result** | Panel updates to show SVM parameters: kernel dropdown (linear/rbf/poly), C slider, gamma dropdown (scale/auto). KNN card deselected. |
| **Priority** | P2 |

---

### TC-104

| Field | Value |
|-------|-------|
| **TC-ID** | TC-104 |
| **Story** | MV-US-013 |
| **Scenario** | All 6 core models load hyperparameters |
| **Preconditions** | Step 4 visible |
| **Steps** | 1. Click each of 6 core models one by one: KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes. 2. Verify parameter panel loads for each. |
| **Expected Result** | Each model loads a unique set of hyperparameter controls without errors. No console errors. |
| **Priority** | P1 |

---

### TC-105

| Field | Value |
|-------|-------|
| **TC-ID** | TC-105 |
| **Story** | MV-US-013 |
| **Scenario** | Model card shows difficulty badge |
| **Preconditions** | Step 4 visible |
| **Steps** | 1. Observe badges on model cards. |
| **Expected Result** | KNN, Decision Tree, Logistic Regression, Naive Bayes show "Beginner". SVM, Random Forest show "Intermediate". XGBoost, LightGBM show "Advanced". |
| **Priority** | P3 |

---

### TC-106

| Field | Value |
|-------|-------|
| **TC-ID** | TC-106 |
| **Story** | MV-US-013 |
| **Scenario** | Only one model selected at a time |
| **Preconditions** | Step 4 visible |
| **Steps** | 1. Click KNN. 2. Click Random Forest. 3. Observe selection state. |
| **Expected Result** | Only Random Forest shows selected state. KNN is deselected. Only one model is highlighted at any time. |
| **Priority** | P2 |

---

## Section 2: KNN Parameters (MV-US-014)

---

### TC-107

| Field | Value |
|-------|-------|
| **TC-ID** | TC-107 |
| **Story** | MV-US-014 |
| **Scenario** | K slider has correct range |
| **Preconditions** | KNN selected in Step 4 |
| **Steps** | 1. Observe K (n_neighbors) slider. 2. Drag to minimum. 3. Drag to maximum. |
| **Expected Result** | Slider min is 1, max is 50. Value displays update in real time. Step size is 1. |
| **Priority** | P1 |

---

### TC-108

| Field | Value |
|-------|-------|
| **TC-ID** | TC-108 |
| **Story** | MV-US-014 |
| **Scenario** | Distance metric dropdown options |
| **Preconditions** | KNN selected |
| **Steps** | 1. Click the distance metric dropdown. 2. Observe options. |
| **Expected Result** | Dropdown shows: euclidean, manhattan, minkowski. Default is euclidean. |
| **Priority** | P2 |

---

### TC-109

| Field | Value |
|-------|-------|
| **TC-ID** | TC-109 |
| **Story** | MV-US-014 |
| **Scenario** | Weight function dropdown options |
| **Preconditions** | KNN selected |
| **Steps** | 1. Click the weights dropdown. 2. Observe options. |
| **Expected Result** | Dropdown shows: uniform, distance. Default is uniform. |
| **Priority** | P2 |

---

### TC-110

| Field | Value |
|-------|-------|
| **TC-ID** | TC-110 |
| **Story** | MV-US-014 |
| **Scenario** | Parameter descriptions in clinical language |
| **Preconditions** | KNN selected |
| **Steps** | 1. Read description text below each parameter control. |
| **Expected Result** | Each parameter has a non-empty plain-language description explaining its clinical meaning. No technical jargon without explanation. |
| **Priority** | P2 |

---

### TC-111

| Field | Value |
|-------|-------|
| **TC-ID** | TC-111 |
| **Story** | MV-US-014 |
| **Scenario** | Quick Start preset resets to defaults |
| **Preconditions** | KNN selected; K slider moved to 20 |
| **Steps** | 1. Click "Quick Start" button. 2. Observe parameter values. |
| **Expected Result** | All parameters reset to their default values (K=5, metric=euclidean, weights=uniform). |
| **Priority** | P3 |

---

### TC-112

| Field | Value |
|-------|-------|
| **TC-ID** | TC-112 |
| **Story** | MV-US-014 |
| **Scenario** | Optimized preset adjusts values |
| **Preconditions** | KNN selected with default values |
| **Steps** | 1. Click "Optimized" button. 2. Observe parameter values. |
| **Expected Result** | K slider moves to an optimized value (approximately 60% through the range). Select parameters remain at defaults. |
| **Priority** | P3 |

---

## Section 3: Auto-Retrain Toggle (MV-US-011)

---

### TC-113

| Field | Value |
|-------|-------|
| **TC-ID** | TC-113 |
| **Story** | MV-US-011 |
| **Scenario** | Toggle auto-retrain ON |
| **Preconditions** | KNN selected; auto-retrain OFF |
| **Steps** | 1. Toggle auto-retrain switch to ON. 2. Read description text. |
| **Expected Result** | Toggle shows ON state. Description reads: "Automatically retrain the model 300ms after any parameter change." |
| **Priority** | P1 |

---

### TC-114

| Field | Value |
|-------|-------|
| **TC-ID** | TC-114 |
| **Story** | MV-US-011 |
| **Scenario** | Slider change triggers debounced retrain |
| **Preconditions** | KNN selected; auto-retrain ON; Chrome DevTools Network tab open |
| **Steps** | 1. Move K slider from 5 to 10. 2. Observe Network tab for POST /api/ml/train. |
| **Expected Result** | Single POST request fires approximately 300ms after slider release. Success toast appears. Model results update. |
| **Priority** | P1 |

---

### TC-115

| Field | Value |
|-------|-------|
| **TC-ID** | TC-115 |
| **Story** | MV-US-011 |
| **Scenario** | Auto-retrain OFF prevents auto-training |
| **Preconditions** | KNN selected; auto-retrain OFF |
| **Steps** | 1. Move K slider from 5 to 15. 2. Wait 2 seconds. 3. Check Network tab. |
| **Expected Result** | No POST /api/ml/train request is made. No toast notification. Model results do not change. |
| **Priority** | P2 |

---

### TC-116

| Field | Value |
|-------|-------|
| **TC-ID** | TC-116 |
| **Story** | MV-US-011 |
| **Scenario** | Manual Train button works regardless of toggle |
| **Preconditions** | KNN selected; auto-retrain OFF |
| **Steps** | 1. Click "Train Model" button. 2. Observe results. |
| **Expected Result** | Model trains successfully. Success toast appears. Step 4 marked as complete. |
| **Priority** | P1 |

---

## Section 4: Performance Metrics (MV-US-017)

---

### TC-117

| Field | Value |
|-------|-------|
| **TC-ID** | TC-117 |
| **Story** | MV-US-017 |
| **Scenario** | All 6 metrics displayed after training |
| **Preconditions** | Model trained; user on Step 5 |
| **Steps** | 1. Navigate to Step 5. 2. Count metric cards. |
| **Expected Result** | 6 metric cards visible: Accuracy, Sensitivity, Specificity, Precision, F1, AUC-ROC. Each shows percentage value and description. |
| **Priority** | P1 |

---

### TC-118

| Field | Value |
|-------|-------|
| **TC-ID** | TC-118 |
| **Story** | MV-US-017 |
| **Scenario** | Metric >= 80% shows green border |
| **Preconditions** | Model trained with a metric >= 80% |
| **Steps** | 1. Find a metric card with value >= 80%. 2. Inspect border colour. |
| **Expected Result** | Card has emerald/green left border and light green background. |
| **Priority** | P1 |

---

### TC-119

| Field | Value |
|-------|-------|
| **TC-ID** | TC-119 |
| **Story** | MV-US-017 |
| **Scenario** | Metric 60-79% shows amber border |
| **Preconditions** | Model trained with a metric in 60-79% range |
| **Steps** | 1. Find a metric card with value between 60% and 79%. 2. Inspect border colour. |
| **Expected Result** | Card has amber/yellow left border and light amber background. |
| **Priority** | P1 |

---

### TC-120

| Field | Value |
|-------|-------|
| **TC-ID** | TC-120 |
| **Story** | MV-US-017 |
| **Scenario** | Metric < 60% shows red border |
| **Preconditions** | Model trained with a metric < 60% |
| **Steps** | 1. Find a metric card with value below 60%. 2. Inspect border colour. |
| **Expected Result** | Card has red left border and light red background. |
| **Priority** | P1 |

---

### TC-121

| Field | Value |
|-------|-------|
| **TC-ID** | TC-121 |
| **Story** | MV-US-017 |
| **Scenario** | Sensitivity shows priority star icon |
| **Preconditions** | Model trained; Step 5 visible |
| **Steps** | 1. Locate the Sensitivity metric card. 2. Check for star icon. |
| **Expected Result** | Sensitivity card has a filled amber star icon in the top-right corner. Other metrics do not have this icon. |
| **Priority** | P2 |

---

### TC-122

| Field | Value |
|-------|-------|
| **TC-ID** | TC-122 |
| **Story** | MV-US-017 |
| **Scenario** | Each metric shows clinical description |
| **Preconditions** | Model trained; Step 5 visible |
| **Steps** | 1. Read the description text on each of the 6 metric cards. |
| **Expected Result** | Each metric card has a non-empty plain-language clinical description below the percentage value. |
| **Priority** | P2 |

---

## Section 5: Confusion Matrix (MV-US-018)

---

### TC-123

| Field | Value |
|-------|-------|
| **TC-ID** | TC-123 |
| **Story** | MV-US-018 |
| **Scenario** | 2x2 grid with TN/FP/FN/TP labels |
| **Preconditions** | Binary model trained (cardiology); Step 5 visible |
| **Steps** | 1. Locate the confusion matrix. 2. Verify cell labels. |
| **Expected Result** | 2x2 grid showing 4 cells labelled TN, FP, FN, TP with numeric counts. |
| **Priority** | P1 |

---

### TC-124

| Field | Value |
|-------|-------|
| **TC-ID** | TC-124 |
| **Story** | MV-US-018 |
| **Scenario** | Colour intensity scales with cell value |
| **Preconditions** | Confusion matrix visible |
| **Steps** | 1. Compare background colours of cells with different values. |
| **Expected Result** | Cells with higher counts have darker green backgrounds. Cells with low counts have lighter backgrounds. |
| **Priority** | P3 |

---

### TC-125

| Field | Value |
|-------|-------|
| **TC-ID** | TC-125 |
| **Story** | MV-US-018 |
| **Scenario** | FN red banner appears |
| **Preconditions** | Binary model trained with False Negatives > 0 |
| **Steps** | 1. Scroll below confusion matrix. 2. Look for red banner. |
| **Expected Result** | Red error banner appears stating the number of False Negatives and explaining they represent missed diagnoses. |
| **Priority** | P1 |

---

### TC-126

| Field | Value |
|-------|-------|
| **TC-ID** | TC-126 |
| **Story** | MV-US-018 |
| **Scenario** | FP info banner appears |
| **Preconditions** | Binary model trained with False Positives > 0 |
| **Steps** | 1. Scroll below confusion matrix. 2. Look for blue info banner. |
| **Expected Result** | Blue info banner appears stating the number of False Positives and explaining they lead to unnecessary follow-up. |
| **Priority** | P2 |

---

### TC-127

| Field | Value |
|-------|-------|
| **TC-ID** | TC-127 |
| **Story** | MV-US-018 |
| **Scenario** | Row/column labels present |
| **Preconditions** | Confusion matrix visible |
| **Steps** | 1. Check axis labels on the matrix. |
| **Expected Result** | Vertical axis labelled "Actual", horizontal axis labelled "Predicted". Row and column headers show class names. |
| **Priority** | P2 |

---

## Section 6: ROC Curve (MV-US-019)

---

### TC-128

| Field | Value |
|-------|-------|
| **TC-ID** | TC-128 |
| **Story** | MV-US-019 |
| **Scenario** | ROC curve renders with filled area |
| **Preconditions** | Binary model trained; Step 5 visible |
| **Steps** | 1. Locate the ROC Curve card. 2. Verify chart renders. |
| **Expected Result** | Area chart displays with green curve and shaded area below. X-axis: False Positive Rate. Y-axis: True Positive Rate. |
| **Priority** | P1 |

---

### TC-129

| Field | Value |
|-------|-------|
| **TC-ID** | TC-129 |
| **Story** | MV-US-019 |
| **Scenario** | Diagonal dashed reference line |
| **Preconditions** | ROC curve visible |
| **Steps** | 1. Look for a dashed line from (0,0) to (1,1). |
| **Expected Result** | Grey dashed diagonal line visible, representing random classifier baseline. |
| **Priority** | P1 |

---

### TC-130

| Field | Value |
|-------|-------|
| **TC-ID** | TC-130 |
| **Story** | MV-US-019 |
| **Scenario** | AUC badge displayed |
| **Preconditions** | ROC curve visible |
| **Steps** | 1. Check the header area of the ROC curve card. |
| **Expected Result** | Green badge shows "AUC = X.XXX" with a value between 0 and 1. |
| **Priority** | P1 |

---

### TC-131

| Field | Value |
|-------|-------|
| **TC-ID** | TC-131 |
| **Story** | MV-US-019 |
| **Scenario** | Explanatory note below chart |
| **Preconditions** | ROC curve visible |
| **Steps** | 1. Scroll below the ROC chart area. 2. Read the note. |
| **Expected Result** | Plain-language paragraph explains what ROC curve shows, what the diagonal means, and interprets the current AUC value. |
| **Priority** | P2 |

---

## Section 7: Low Sensitivity Banner

---

### TC-132

| Field | Value |
|-------|-------|
| **TC-ID** | TC-132 |
| **Story** | MV-US-017 |
| **Scenario** | Red banner appears when Sensitivity < 50% |
| **Preconditions** | Train a model that produces Sensitivity < 50% (e.g., Naive Bayes with extreme smoothing) |
| **Steps** | 1. Train model with poor sensitivity. 2. Navigate to Step 5. 3. Check for red banner. |
| **Expected Result** | Red error banner appears with title "Dangerously Low Sensitivity" and message showing the exact percentage and clinical warning. |
| **Priority** | P1 |

---

### TC-133

| Field | Value |
|-------|-------|
| **TC-ID** | TC-133 |
| **Story** | MV-US-017 |
| **Scenario** | Banner hidden when Sensitivity >= 50% |
| **Preconditions** | Model trained with Sensitivity >= 50% |
| **Steps** | 1. Train KNN with default params on cardiology. 2. Navigate to Step 5. 3. Check banner area. |
| **Expected Result** | No red sensitivity banner visible. Metrics display normally. |
| **Priority** | P1 |

---

### TC-134

| Field | Value |
|-------|-------|
| **TC-ID** | TC-134 |
| **Story** | MV-US-017 |
| **Scenario** | Banner shows correct percentage |
| **Preconditions** | Model with Sensitivity 35% trained |
| **Steps** | 1. Read the banner message text. |
| **Expected Result** | Banner message includes "35.0%" (matching the metric card value). Suggests adjusting hyperparameters or trying a different model. |
| **Priority** | P2 |

---

## Section 8: Model Comparison (MV-US-015, MV-US-016)

---

### TC-135

| Field | Value |
|-------|-------|
| **TC-ID** | TC-135 |
| **Story** | MV-US-015 |
| **Scenario** | + Compare button visible with 1+ model |
| **Preconditions** | At least 1 model trained; Step 5 visible |
| **Steps** | 1. Scroll to Model Comparison section. 2. Check for button. |
| **Expected Result** | Green "+ Compare" button visible in the card header. Shows count badge (e.g., "1 / 2"). |
| **Priority** | P1 |

---

### TC-136

| Field | Value |
|-------|-------|
| **TC-ID** | TC-136 |
| **Story** | MV-US-015 |
| **Scenario** | Dropdown shows available models |
| **Preconditions** | 2+ models trained; 1 already in comparison |
| **Steps** | 1. Click "+ Compare" button. 2. Observe dropdown. |
| **Expected Result** | Dropdown lists models not yet in the comparison table. Each shows model name. |
| **Priority** | P1 |

---

### TC-137

| Field | Value |
|-------|-------|
| **TC-ID** | TC-137 |
| **Story** | MV-US-015 |
| **Scenario** | Adding model creates new row |
| **Preconditions** | Dropdown open with available model |
| **Steps** | 1. Click a model name in the dropdown. 2. Observe table. |
| **Expected Result** | New row appears in comparison table with the selected model's metrics. Dropdown closes. |
| **Priority** | P1 |

---

### TC-138

| Field | Value |
|-------|-------|
| **TC-ID** | TC-138 |
| **Story** | MV-US-016 |
| **Scenario** | No duplicate rows in comparison |
| **Preconditions** | Model already in comparison table |
| **Steps** | 1. Click "+ Compare". 2. Check if the already-compared model appears in dropdown. |
| **Expected Result** | The already-compared model does NOT appear in the dropdown. Cannot add duplicates. |
| **Priority** | P1 |

---

### TC-139

| Field | Value |
|-------|-------|
| **TC-ID** | TC-139 |
| **Story** | MV-US-016 |
| **Scenario** | Sensitivity column colour-coded |
| **Preconditions** | 2+ models in comparison with varying sensitivity |
| **Steps** | 1. Observe the Sensitivity column in the comparison table. |
| **Expected Result** | Sensitivity values >=80% in emerald green, 60-79% in amber, <60% in red. |
| **Priority** | P1 |

---

### TC-140

| Field | Value |
|-------|-------|
| **TC-ID** | TC-140 |
| **Story** | MV-US-016 |
| **Scenario** | Best metric per column highlighted |
| **Preconditions** | 2+ models in comparison |
| **Steps** | 1. Compare values across each metric column. |
| **Expected Result** | The highest value in each column (Accuracy, Sensitivity, etc.) is shown in bold emerald green. |
| **Priority** | P2 |

---

### TC-141

| Field | Value |
|-------|-------|
| **TC-ID** | TC-141 |
| **Story** | MV-US-016 |
| **Scenario** | Best overall model has trophy icon |
| **Preconditions** | 2+ models compared |
| **Steps** | 1. Look for trophy icon in the table. |
| **Expected Result** | The overall best model row has an amber trophy icon next to the model name and a highlighted background. |
| **Priority** | P3 |

---

### TC-142

| Field | Value |
|-------|-------|
| **TC-ID** | TC-142 |
| **Story** | MV-US-015 |
| **Scenario** | Compare All adds all trained models |
| **Preconditions** | 3+ models trained; some not in comparison |
| **Steps** | 1. Click "Compare All" button. 2. Observe table. |
| **Expected Result** | All trained models appear in the comparison table. "+ Compare" dropdown becomes empty. |
| **Priority** | P3 |

---

### TC-143

| Field | Value |
|-------|-------|
| **TC-ID** | TC-143 |
| **Story** | MV-US-015 |
| **Scenario** | X button removes model from comparison |
| **Preconditions** | 2+ models in comparison |
| **Steps** | 1. Click the X button on a model row. 2. Observe table. |
| **Expected Result** | Model row removed from table. Model reappears in "+ Compare" dropdown. |
| **Priority** | P3 |

---

## Section 9: Performance Tests

---

### TC-144

| Field | Value |
|-------|-------|
| **TC-ID** | TC-144 |
| **Story** | Cross-cutting |
| **Scenario** | Training latency < 3,000 ms |
| **Preconditions** | Cardiology dataset prepared (303 rows) |
| **Steps** | 1. Train KNN via API. 2. Check training_time_ms in response. |
| **Expected Result** | training_time_ms < 3,000. Typical: < 200 ms. |
| **Priority** | P1 |

---

### TC-145

| Field | Value |
|-------|-------|
| **TC-ID** | TC-145 |
| **Story** | MV-US-011 |
| **Scenario** | Debounce timing approximately 300 ms |
| **Preconditions** | Auto-retrain ON; Chrome DevTools Network tab open |
| **Steps** | 1. Move slider. 2. Measure time from slider release to POST request in Network tab. |
| **Expected Result** | POST /api/ml/train fires 300 ms ± 50 ms after slider release. |
| **Priority** | P2 |

---

### TC-146

| Field | Value |
|-------|-------|
| **TC-ID** | TC-146 |
| **Story** | MV-US-013 |
| **Scenario** | Train all 6 core models sequentially |
| **Preconditions** | Cardiology dataset prepared |
| **Steps** | 1. Train KNN. 2. Train SVM. 3. Train Decision Tree. 4. Train Random Forest. 5. Train Logistic Regression. 6. Train Naive Bayes. |
| **Expected Result** | All 6 models train successfully with 200 status. Each returns metrics, confusion matrix, and ROC curve. |
| **Priority** | P1 |

---

### TC-147

| Field | Value |
|-------|-------|
| **TC-ID** | TC-147 |
| **Story** | Cross-cutting |
| **Scenario** | Train across 5 different domains |
| **Preconditions** | Backend running |
| **Steps** | 1. Load and prepare cardiology. Train KNN. 2. Repeat for nephrology, oncology-breast, neurology, endocrinology. |
| **Expected Result** | KNN trains successfully on all 5 domains. Metrics returned for each. |
| **Priority** | P1 |

---

### TC-148

| Field | Value |
|-------|-------|
| **TC-ID** | TC-148 |
| **Story** | MV-US-017 |
| **Scenario** | Metric colour thresholds at boundary values |
| **Preconditions** | Models trained producing metrics near 0.60 and 0.80 boundaries |
| **Steps** | 1. Find a metric at exactly 0.80. Verify green. 2. Find a metric at 0.79. Verify amber. 3. Find a metric at 0.60. Verify amber. 4. Find a metric at 0.59. Verify red. |
| **Expected Result** | Boundary values: >= 0.80 = green, >= 0.60 and < 0.80 = amber, < 0.60 = red. |
| **Priority** | P1 |
