# MedVix — Sprint 2 Demo Script

**Event**: Sprint 2 Gate Review / Demo
**Date**: 18 March 2026
**Duration**: 5 minutes
**Presenter**: Berkay AKTAS (Scrum Master / Lead Developer)
**Supporting**: Ozge ALTINOK (UI walk-through of Step 3 visualisations)

---

## Demo Prerequisites Checklist

Before the demo begins, verify:

- [ ] Backend running at `http://localhost:8000` — confirm `GET /health` returns 200
- [ ] Frontend running at `http://localhost:5173` — confirm page loads
- [ ] Browser cleared (no stale session data, no cached errors)
- [ ] Chrome DevTools Network tab open in background (to show API calls if asked)
- [ ] All 20 built-in datasets confirmed present (`ls backend/data/*.csv | wc -l` = 20)
- [ ] Browser zoom level set to 100%
- [ ] Screen sharing confirmed working before audience joins

---

## Demo Flow (5 minutes total)

---

### Opening — 30 seconds

**Speaker**: Berkay AKTAS

"Good afternoon. I'm Berkay, Scrum Master and Lead Developer for Team MedVix. Our project is an ML visualisation tool for healthcare professionals at Cankaya University's SENG 430 lab.

Sprint 2 completes Steps 1 through 3 of our 7-step pipeline: Clinical Context, Data Exploration, and Data Preparation. We started the sprint with 50 story points and are delivering all 50 today. Let me show you what we built."

---

### Step 1 Demo — 60 seconds

**Speaker**: Berkay AKTAS

**[Action]** Application is open at `localhost:5173`. The domain pill bar is visible at the top.

"Step 1 is Clinical Context. Users start by selecting their medical specialty from this pill bar — we have all 20 clinical domains implemented."

**[Action]** Click the "Cardiology" pill.

"When I select Cardiology, the panel immediately updates with the clinical question — 'Does this patient have significant coronary artery disease?' — the target population, why this problem matters clinically, and a description of each feature the model will use. This helps clinicians understand the AI problem before touching any data."

**[Action]** Click the "Diabetes" pill while on Step 2 (or simulate having progressed past Step 1).

"Watch what happens when I switch domains after I've already started working — the system asks for confirmation that progress will reset. This protects the user from accidentally losing data."

**[Action]** Click "Cancel" on the warning dialog.

"I'll cancel and keep Cardiology for this demo. Before we move to Step 2, let me quickly show the Glossary."

**[Action]** Click the "Glossary" button in the navigation.

"We have 30 ML terms defined in plain language with clinical examples. Healthcare professionals can look up any concept they encounter in the pipeline without leaving the tool."

**[Action]** Type "SMOTE" in the search field. Show filtered result. Press Escape to close.

---

### Step 2 Demo — 90 seconds

**Speaker**: Berkay AKTAS

**[Action]** Navigate to Step 2.

"Step 2 is Data Exploration. Users can either upload their own CSV patient file or load one of our 20 built-in datasets. Let me load the Cardiology built-in dataset."

**[Action]** Click "Load Built-in Dataset" for Cardiology. Wait for response (~1 second).

"303 patient records loaded instantly. The data summary table appears with one row per column."

**[Action]** Point to the color-coded action tags on the table.

"Each column has a color-coded quality badge: green means less than 5% missing values — OK to proceed. Amber means 5 to 30% missing — handle with care. Red means over 30% missing — this column needs attention before training. Our Cardiology dataset scores 87 out of 100 on the data quality score."

**[Action]** Scroll down to show the class distribution section.

"Below the summary we see the outcome class breakdown. For Cardiology, 54% of patients have heart disease, 46% do not — a fairly balanced dataset. If the minority class dropped below 30%, this section would show a yellow imbalance warning and recommend SMOTE in Step 3."

**[Action]** Click "Open Column Mapper."

"The column mapper lets users assign each column as a Feature, Target, or Ignore. For built-in datasets, this is pre-configured. I'll set the target to 'target' and mark all 13 clinical features."

**[Action]** Click "Validate & Save."

"Saved — schema_ok is true. This unlocks Step 3. Without this step, clicking Apply in Step 3 would return an error telling the user to complete column mapping first. We tested this gate and confirmed zero bypass paths."

---

### Step 3 Demo — 90 seconds

**Speaker**: Ozge ALTINOK (joins for this section)

**[Action]** Navigate to Step 3.

"Step 3 is Data Preparation. You can see the four preparation controls."

**[Action]** Point to the train/test split slider.

"First, the train/test split slider. It defaults to 80% training, 20% test — industry standard. The range is 60/40 to 90/10. Values outside this range are rejected by the API to prevent impractical splits."

**[Action]** Drag slider to 70/30.

"I'll set it to 70/30 for this demo — so 212 training patients and 91 test patients."

**[Action]** Open the "Missing Value Strategy" dropdown.

"For missing values, we offer three strategies: median imputation fills numeric gaps with the column median, mode fills with the most common value, and remove drops any row that has missing data. We'll use median for robustness."

**[Action]** Open the "Normalisation" dropdown.

"Normalisation prevents features with large absolute values — like total cholesterol at 200-500 mg/dL — from dominating features measured in single digits. Z-score is the standard choice; it gives each feature mean 0 and standard deviation 1. Min-max scales to 0-1. None leaves values unchanged."

**[Action]** Point to the SMOTE toggle.

"The SMOTE toggle. For this balanced dataset it's greyed out with a note that SMOTE only activates when class imbalance is detected. On an imbalanced dataset like Stroke prediction — where only 5% of patients had a stroke — SMOTE would be enabled here."

**[Action]** Click "Apply."

"Clicking Apply sends all four settings to the backend preparation pipeline."

**[Action]** Show the response. Point to the green success banner.

"The green success banner confirms: 212 training samples, 91 test samples, 13 features after encoding, z-score normalisation applied."

**[Action]** Scroll to the before/after normalisation visualisation.

"And here is the before/after comparison for the 'age' feature. Before: mean 54.4, range 29-77. After z-score: mean 0.0, range -2.79 to +2.49. This confirms the normalisation is mathematically correct."

"The data is now ready for Step 4 — model selection and training — which we will build in Sprint 3."

---

### Closing — 30 seconds

**Speaker**: Berkay AKTAS

"To summarise Sprint 2:

- 12 user stories, 50 story points delivered on schedule
- 100% CSV upload validation: 5 valid files accepted, 5 invalid rejected with friendly errors
- 20 out of 20 clinical domains with correct content and datasets
- Zero column mapper gate bypasses
- 100% test coverage across all stories

Sprint 3 begins tomorrow. We'll implement model selection — all 6 algorithms — hyperparameter tuning, and the full metrics dashboard including confusion matrix and ROC curve.

Thank you. We're happy to take questions."

---

## Backup Talking Points

If asked about technical architecture:
- "FastAPI backend with Pydantic models for all request/response validation. Session state managed in-memory with 60-minute TTL. React frontend with Tailwind CSS. All 20 datasets are synthetic, generated with numpy for reproducibility and licensing freedom."

If asked about testing:
- "Arzu executed 65 test cases covering all 12 stories. We have zero P1 or P2 defects. Three minor cosmetic issues are open at P3."

If the API call fails during demo:
- "Let me show you the same flow in Postman / the FastAPI Swagger docs at localhost:8000/docs — the API responses are the same." Demonstrate directly in Swagger UI as fallback.

If asked about dataset size:
- "Our 20 synthetic built-in datasets range from 195 rows (Parkinson's) to 5,110 rows (Stroke). The upload validation allows CSVs up to 50 MB — handling real clinical datasets of 50,000+ rows."

---

## Time Checkpoints

| Segment | Cumulative Time |
|---------|----------------|
| Opening complete | 0:30 |
| Step 1 — domain selection | 1:00 |
| Step 1 — domain switch warning | 1:20 |
| Step 1 — glossary | 1:30 |
| Step 2 — dataset load + summary | 2:15 |
| Step 2 — class distribution | 2:30 |
| Step 2 — column mapper | 3:00 |
| Step 3 — controls overview | 3:45 |
| Step 3 — Apply + success banner | 4:15 |
| Step 3 — before/after chart | 4:30 |
| Closing + metrics summary | 5:00 |
