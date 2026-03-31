# MedVix — Sprint 3 Demo Script

**Event**: Sprint 3 Review — Week 5 Showcase
**Date**: 1 April 2026
**Duration**: 5 minutes
**Presenter**: Berkay AKTAS (Lead Developer & Scrum Master)
**Supporting**: Ozge ALTINOK (UX Designer)
**Sprint Scope**: Steps 4 (Model Selection & Parameters) and 5 (Results & Evaluation)

---

## Demo Prerequisites Checklist

- [ ] Backend running on `http://localhost:8000` (verify `/health` returns OK)
- [ ] Frontend running on `http://localhost:5173`
- [ ] Browser: Chrome, cleared cache and cookies
- [ ] Cardiology domain pre-selected in the domain pill bar
- [ ] Built-in cardiology dataset loaded in Step 2
- [ ] Column mapper completed (target = `target`)
- [ ] Data preparation applied in Step 3 (80/20 split, median imputation, Z-score normalisation)
- [ ] No models trained yet (fresh session from Step 3)
- [ ] Screen sharing active, resolution ≥ 1280x720
- [ ] Backup: Live demo available at https://bewrkay-medvix.hf.space

---

## Demo Flow (5 minutes total)

---

### [Opening] — 30 seconds

**Speaker**: Berkay

"Good afternoon. Sprint 3 delivered 32 story points covering Steps 4 and 5 of MedVix — Model Selection and Results Evaluation. We implemented 8 machine learning models, 6 performance metrics with colour-coded thresholds, interactive confusion matrix, ROC curves, and a model comparison workflow. All backed by 52 automated tests with zero critical defects. Let me walk you through."

---

### [Step 4 — Model Selection] — 90 seconds

**Speaker**: Berkay

**[Action]** Navigate to Step 4 from the stepper.

"Step 4 presents our model selector. You see 8 model cards — the 6 required models plus XGBoost and LightGBM as advanced options. Each card shows a clinical description and difficulty badge."

**[Action]** Click the KNN card.

"Selecting KNN loads its hyperparameter panel. Here we have the K slider — range 1 to 50 — a distance metric dropdown with Euclidean, Manhattan, and Minkowski, and a weight function selector. Each parameter has a plain-language clinical description below it."

**[Action]** Point out the clinical description text below K slider.

"Notice the preset buttons — Quick Start resets to defaults, Optimized tunes toward commonly effective values."

**[Action]** Toggle Auto-retrain ON. Move K slider from 5 to 15.

"With auto-retrain enabled, moving any slider triggers a debounced retrain after 300 milliseconds. You can see the success toast — the model retrained automatically."

**[Action]** Click "Train Model" button manually.

"You can also train manually. KNN trained in about 12 milliseconds on our 303-patient cardiology dataset — well under the 3-second requirement."

**[Action]** Click Random Forest card. Train it.

"Switching to Random Forest — different parameters: number of trees, max depth, split criterion. Training succeeds. Now we have two models ready for comparison."

---

### [Step 5 — Results & Evaluation] — 120 seconds

**Speaker**: Berkay, with Ozge for UI details

**[Action]** Navigate to Step 5.

"Step 5 shows the complete evaluation dashboard for the active model."

**[Action]** Point to the metrics grid.

"Six performance metrics — Accuracy, Sensitivity, Specificity, Precision, F1, and AUC-ROC. Each card is colour-coded: green border for 80% and above, amber for 60-79%, red below 60%. Notice Sensitivity has a star icon — it is the priority metric in clinical screening because missing a sick patient is the most dangerous error."

**[Action]** Scroll to confusion matrix.

**Speaker**: Ozge

"The confusion matrix shows our 2-by-2 grid with True Negatives, False Positives, False Negatives, and True Positives. Below, you see clinical interpretation banners — a red banner counts False Negatives as missed diagnoses, and a blue banner explains False Positives as unnecessary follow-ups."

**[Action]** Scroll to ROC curve.

**Speaker**: Berkay

"The ROC curve plots the trade-off between true positive rate and false positive rate. The dashed diagonal is the random classifier baseline. AUC is annotated in the header badge. Below the chart, an explanatory note interprets the AUC value in plain language."

**[Action]** Point to PR curve and cross-validation charts.

"We also provide a Precision-Recall curve and k-fold cross-validation summary — these are bonus visualisations beyond the specification."

**[Action]** Show overfit detector.

"The overfitting detector compares training accuracy versus test accuracy with a visual gap indicator."

**[Action]** Now trigger the danger banner. Go back to Step 4, select Naive Bayes, set var_smoothing to minimum. Train. Return to Step 5.

"Now I will intentionally create a poor model to demonstrate the safety banner. Using Naive Bayes with extreme smoothing on this dataset — and the red danger banner appears: Sensitivity is below 50%. The tool warns that this model misses more than half of positive cases."

**[Action]** Click "+ Compare" button. Add KNN from dropdown.

**Speaker**: Ozge

"For model comparison, we click the Compare button and select models from the dropdown. Each model gets a row in the comparison table. The Sensitivity column is colour-coded — you can see green for acceptable values and red for the poor Naive Bayes model. The best metric per column is highlighted in bold green, and the overall best model has a trophy icon."

**[Action]** Click "Compare All" to show all 3 trained models.

---

### [Instructor Gate Check] — 30 seconds

**Speaker**: Berkay

**[Action]** Quickly train remaining 4 models (SVM, Decision Tree, Logistic Regression, Naive Bayes with better params). Show comparison table with 6 rows.

"For the gate check: all 6 core models train successfully. All 6 metrics update for each model. The comparison table shows 6 unique rows with no duplicates. Gate criteria met."

---

### [Closing] — 30 seconds

**Speaker**: Berkay

"Sprint 3 is complete — 32 out of 32 story points delivered, 52 automated backend tests passing, zero P1 or P2 defects. Three minor defects found and resolved. Sprint 4 begins today with SHAP explainability and ethics. Thank you."

---

## Backup Talking Points

**If asked about training speed:**
"Training takes under 200 milliseconds on our 303-row cardiology dataset. We tested across all 20 domains. The 3-second requirement is easily met."

**If asked about XGBoost/LightGBM:**
"These are bonus advanced models with lazy imports — they only load when selected, so they do not impact startup time. They demonstrate the tool's extensibility."

**If asked about multiclass datasets:**
"We fully support multiclass classification. Metrics use weighted averaging, the confusion matrix adapts to NxN, and ROC uses one-versus-rest. Five of our 20 domains are multiclass."

**If asked about SHAP:**
"SHAP is already in our requirements.txt and installed. Integration is planned for Sprint 4 — we kept Step 6 and 7 as placeholders in the frontend."

**If asked about the debounce timing:**
"Auto-retrain fires 300 milliseconds after the last slider change. We verified this in Chrome DevTools Network tab — consistent at 300ms plus or minus 20ms."

---

## Time Checkpoints

| Segment | Cumulative Time |
|---------|----------------|
| Opening | 0:30 |
| Step 4 — Model Selection | 2:00 |
| Step 5 — Results | 4:00 |
| Gate Check | 4:30 |
| Closing | 5:00 |
