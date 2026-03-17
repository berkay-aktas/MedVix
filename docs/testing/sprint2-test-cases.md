# MedVix — Sprint 2 Test Cases

**Project**: MedVix — ML Visualization Tool for Healthcare
**Sprint**: Sprint 2 (Weeks 3-4)
**Document Version**: 1.0
**Author**: Arzu Tugce KOCA (QA Lead)
**Date**: 17 March 2026

---

## Legend

| Priority | Description |
|----------|-------------|
| P1 | Critical — must pass for sprint gate |
| P2 | High — must pass for sprint gate |
| P3 | Medium — should pass |
| P4 | Low — nice to have |

| Status | Meaning |
|--------|---------|
| Pass | Test executed and result matches expected |
| Fail | Test executed and result does not match expected |
| Blocked | Test cannot be executed due to dependency |
| Not Run | Test not yet executed |

---

## Section 1: Step 1 — Clinical Context (MV-US-001, MV-US-002, MV-US-025)

---

### TC-001

| Field | Value |
|-------|-------|
| **TC-ID** | TC-001 |
| **Story** | MV-US-001 |
| **Scenario** | Select Cardiology from pill bar |
| **Preconditions** | Application loaded at localhost:5173; no domain previously selected |
| **Steps** | 1. Open browser to `http://localhost:5173`. 2. Locate the domain pill bar at the top of the page. 3. Click the "Cardiology" pill. |
| **Expected Result** | The domain label in the Step 1 panel updates to "Cardiology". The clinical context text updates to show heart disease content. The pill has an active/selected visual state (highlighted border or background). |
| **Priority** | P1 |

---

### TC-002

| Field | Value |
|-------|-------|
| **TC-ID** | TC-002 |
| **Story** | MV-US-001 |
| **Scenario** | Select all 20 domains in sequence — each updates content |
| **Preconditions** | Application loaded at localhost:5173 |
| **Steps** | 1. Click each of the 20 domain pills in turn: Cardiology, Radiology, Nephrology, Oncology-Breast, Neurology (Parkinson's), Endocrinology (Diabetes), Hepatology (Liver), Cardiology-Stroke, Mental Health, Pulmonology-COPD, Haematology-Anaemia, Dermatology, Ophthalmology, Orthopaedics-Spine, ICU/Sepsis, Obstetrics (Fetal Health), Cardiology-Arrhythmia, Oncology-Cervical, Thyroid, Pharmacy-Readmission. 2. After each click, note whether the Step 1 clinical context text changes. |
| **Expected Result** | Each domain pill click updates the clinical context text to domain-specific content. No domain shows generic placeholder text. All 20 domains produce unique, non-empty clinical descriptions. |
| **Priority** | P1 |

---

### TC-003

| Field | Value |
|-------|-------|
| **TC-ID** | TC-003 |
| **Story** | MV-US-001 |
| **Scenario** | Switch domain when already past Step 1 — warning dialog appears |
| **Preconditions** | Cardiology domain selected; user has progressed to Step 2 by loading a built-in dataset |
| **Steps** | 1. Select Cardiology and load the built-in dataset (advance to Step 2). 2. Click the "Diabetes" pill in the domain bar. |
| **Expected Result** | A confirmation dialog appears warning: "Switching domain will reset your current pipeline progress. Are you sure?" The dialog has "Confirm" and "Cancel" buttons. The domain is NOT switched until the user confirms. |
| **Priority** | P1 |

---

### TC-004

| Field | Value |
|-------|-------|
| **TC-ID** | TC-004 |
| **Story** | MV-US-001 |
| **Scenario** | Confirm domain switch — progress resets |
| **Preconditions** | Warning dialog is open (per TC-003 preconditions) |
| **Steps** | 1. With the warning dialog open, click "Confirm". |
| **Expected Result** | Domain changes to "Diabetes". Step 1 clinical context updates to diabetes content. Pipeline progress resets to Step 1 (Steps 2-7 are locked/greyed out). Session data from the previous domain is cleared. |
| **Priority** | P1 |

---

### TC-005

| Field | Value |
|-------|-------|
| **TC-ID** | TC-005 |
| **Story** | MV-US-001 |
| **Scenario** | Cancel domain switch — progress preserved |
| **Preconditions** | Warning dialog is open (per TC-003 preconditions) |
| **Steps** | 1. With the warning dialog open, click "Cancel". |
| **Expected Result** | Dialog closes. Domain remains "Cardiology". Pipeline progress is unchanged — the user is still on Step 2 with the previously loaded data. |
| **Priority** | P1 |

---

### TC-006

| Field | Value |
|-------|-------|
| **TC-ID** | TC-006 |
| **Story** | MV-US-002 |
| **Scenario** | Clinical question displayed for selected domain |
| **Preconditions** | Application loaded; no domain previously selected |
| **Steps** | 1. Click "Cardiology" pill. 2. Inspect the Step 1 panel for the clinical question text. |
| **Expected Result** | The text "Does this patient have significant coronary artery disease?" is visible in the Step 1 panel. |
| **Priority** | P1 |

---

### TC-007

| Field | Value |
|-------|-------|
| **TC-ID** | TC-007 |
| **Story** | MV-US-002 |
| **Scenario** | API returns correct clinical context for Diabetes domain |
| **Preconditions** | Backend running on localhost:8000 |
| **Steps** | 1. Send `GET /api/domains/endocrinology` via Postman or curl. |
| **Expected Result** | HTTP 200. Response JSON contains: `id: "endocrinology"`, `name: "Diabetes"` (or equivalent), non-empty `clinical_question`, non-empty `why_it_matters`, non-empty `patient_population`, and `feature_descriptions` with at least 3 entries. |
| **Priority** | P2 |

---

### TC-008

| Field | Value |
|-------|-------|
| **TC-ID** | TC-008 |
| **Story** | MV-US-002 |
| **Scenario** | "Why it matters" text shown |
| **Preconditions** | Nephrology domain selected in UI |
| **Steps** | 1. Click "Nephrology" pill. 2. Read the "Why it matters" section of the Step 1 panel. |
| **Expected Result** | Text containing information about CKD affecting 10% of the global population is visible. Text is ≥ 2 sentences. |
| **Priority** | P2 |

---

### TC-009

| Field | Value |
|-------|-------|
| **TC-ID** | TC-009 |
| **Story** | MV-US-002 |
| **Scenario** | 404 for unknown domain ID |
| **Preconditions** | Backend running |
| **Steps** | 1. Send `GET /api/domains/nonexistent_domain`. |
| **Expected Result** | HTTP 404. Response JSON: `{"detail": "Domain 'nonexistent_domain' not found."}`. |
| **Priority** | P2 |

---

### TC-010-A

| Field | Value |
|-------|-------|
| **TC-ID** | TC-010-A |
| **Story** | MV-US-002 |
| **Scenario** | API lists all 20 domains |
| **Preconditions** | Backend running |
| **Steps** | 1. Send `GET /api/domains`. |
| **Expected Result** | HTTP 200. Response JSON `count` field equals 20. `domains` array has exactly 20 objects. Each object has non-empty `id`, `name`, `icon`, `short_description`. |
| **Priority** | P1 |

---

### TC-062

| Field | Value |
|-------|-------|
| **TC-ID** | TC-062 |
| **Story** | MV-US-025 |
| **Scenario** | Glossary modal opens |
| **Preconditions** | Application loaded |
| **Steps** | 1. Locate the "Glossary" button or link (typically in the navigation bar or Step 1 panel). 2. Click it. |
| **Expected Result** | A modal dialog opens containing a list of ML terms. At minimum 10 terms are visible. A search input is present. |
| **Priority** | P2 |

---

### TC-063

| Field | Value |
|-------|-------|
| **TC-ID** | TC-063 |
| **Story** | MV-US-025 |
| **Scenario** | Glossary search filters terms |
| **Preconditions** | Glossary modal is open |
| **Steps** | 1. Type "SMOTE" in the search field. |
| **Expected Result** | The term list filters to show only entries containing "SMOTE". The SMOTE definition is shown. Other unrelated terms disappear from the list. |
| **Priority** | P2 |

---

### TC-064

| Field | Value |
|-------|-------|
| **TC-ID** | TC-064 |
| **Story** | MV-US-025 |
| **Scenario** | Glossary modal closes with Escape key |
| **Preconditions** | Glossary modal is open |
| **Steps** | 1. Press the Escape key on the keyboard. |
| **Expected Result** | The modal closes. Focus returns to the element that triggered the modal open. Page content is visible and undisturbed. |
| **Priority** | P2 |

---

### TC-064-B

| Field | Value |
|-------|-------|
| **TC-ID** | TC-064-B |
| **Story** | MV-US-025 |
| **Scenario** | Glossary modal closes with × button |
| **Preconditions** | Glossary modal is open |
| **Steps** | 1. Click the × (close) button in the top-right corner of the modal. |
| **Expected Result** | The modal closes. Underlying page content is interactive. |
| **Priority** | P2 |

---

## Section 2: Step 2 — Data Exploration (MV-US-003, MV-US-004, MV-US-005, MV-US-006, MV-US-007)

---

### TC-010

| Field | Value |
|-------|-------|
| **TC-ID** | TC-010 |
| **Story** | MV-US-003 |
| **Scenario** | Upload valid CSV file — session created |
| **Preconditions** | Backend running; Cardiology domain selected in UI |
| **Steps** | 1. Navigate to Step 2. 2. Click "Upload CSV". 3. Select `heart_valid.csv` (303 rows, 13 columns). 4. Click Upload/Submit. |
| **Expected Result** | HTTP 200 from `POST /api/data/upload`. Response includes `session_id` (non-empty string), `row_count: 303`, `column_count: 14` (13 features + target), friendly success message. UI shows data loaded confirmation. |
| **Priority** | P1 |

---

### TC-011

| Field | Value |
|-------|-------|
| **TC-ID** | TC-011 |
| **Story** | MV-US-003 |
| **Scenario** | Upload .xlsx file — rejected with friendly error |
| **Preconditions** | Backend running; domain selected |
| **Steps** | 1. Navigate to Step 2. 2. Attempt to upload `patients.xlsx`. |
| **Expected Result** | HTTP 400. Error message: "Unsupported file type '.xlsx'. Only CSV files are accepted." UI shows red error banner with this message. |
| **Priority** | P1 |

---

### TC-012

| Field | Value |
|-------|-------|
| **TC-ID** | TC-012 |
| **Story** | MV-US-003 |
| **Scenario** | Upload file >50 MB — rejected with size error |
| **Preconditions** | Backend running; a file padded to 51 MB available |
| **Steps** | 1. Navigate to Step 2. 2. Attempt to upload `too_large.csv` (51 MB). |
| **Expected Result** | HTTP 413. Error message contains "51.0 MB" and "50 MB limit". UI shows red error banner. |
| **Priority** | P1 |

---

### TC-013

| Field | Value |
|-------|-------|
| **TC-ID** | TC-013 |
| **Story** | MV-US-003 |
| **Scenario** | Upload CSV with only 5 rows — rejected |
| **Preconditions** | Backend running; `too_few_rows.csv` (5 rows) available |
| **Steps** | 1. Navigate to Step 2. 2. Upload `too_few_rows.csv`. |
| **Expected Result** | HTTP 422. Error message: "Dataset must contain at least 10 rows, but this file has only 5." |
| **Priority** | P1 |

---

### TC-014

| Field | Value |
|-------|-------|
| **TC-ID** | TC-014 |
| **Story** | MV-US-003 |
| **Scenario** | Upload CSV with no numeric columns — rejected |
| **Preconditions** | Backend running; `no_numeric.csv` (all string/categorical columns) available |
| **Steps** | 1. Navigate to Step 2. 2. Upload `no_numeric.csv`. |
| **Expected Result** | HTTP 422. Error message: "Dataset must contain at least 1 numeric column(s), but none were found." |
| **Priority** | P1 |

---

### TC-015

| Field | Value |
|-------|-------|
| **TC-ID** | TC-015 |
| **Story** | MV-US-003 |
| **Scenario** | Upload empty file (0 bytes) — rejected |
| **Preconditions** | Backend running; `empty.csv` (0 bytes) available |
| **Steps** | 1. Navigate to Step 2. 2. Upload `empty.csv`. |
| **Expected Result** | HTTP 422 or 400. Error message mentions parse failure or insufficient rows. UI shows red error banner. |
| **Priority** | P1 |

---

### TC-016 through TC-035 (Built-in Dataset Loading — All 20 Domains)

The following 20 test cases share the same structure. Each verifies that the built-in dataset for the corresponding domain loads successfully via `POST /api/data/builtin`.

| TC-ID | Domain ID | Expected Domain Name | Expected Min Rows |
|-------|-----------|---------------------|-------------------|
| TC-016 | cardiology | Heart Disease | 300 |
| TC-017 | radiology | Chest X-Ray (Pneumonia) | 500 |
| TC-018 | nephrology | Chronic Kidney Disease | 390 |
| TC-019 | oncology-breast | Breast Cancer | 560 |
| TC-020 | neurology | Parkinson's Disease | 190 |
| TC-021 | endocrinology | Diabetes | 750 |
| TC-022 | hepatology | Liver Disease | 580 |
| TC-023 | stroke | Stroke Prediction | 500 |
| TC-024 | mental-health | Mental Health (Depression) | 500 |
| TC-025 | pulmonology | COPD Risk | 500 |
| TC-026 | haematology | Anaemia Detection | 500 |
| TC-027 | dermatology | Skin Condition | 500 |
| TC-028 | ophthalmology | Diabetic Retinopathy | 500 |
| TC-029 | orthopaedics | Spine Condition | 500 |
| TC-030 | icu-sepsis | Sepsis Prediction | 500 |
| TC-031 | obstetrics | Fetal Health | 500 |
| TC-032 | arrhythmia | Cardiac Arrhythmia | 500 |
| TC-033 | oncology-cervical | Cervical Cancer | 500 |
| TC-034 | thyroid | Thyroid Disorder | 500 |
| TC-035 | pharmacy | Hospital Readmission | 500 |

**For each TC-016 to TC-035**:

- **Story**: MV-US-004
- **Preconditions**: Backend running; built-in CSV exists in `backend/data/`
- **Steps**: 1. Send `POST /api/data/builtin` with body `{"domain_id": "<domain_id>"}`. 2. Note response.
- **Expected Result**: HTTP 200. Response includes `session_id` (non-empty), `row_count` ≥ expected min rows, `column_count` ≥ 5, non-empty `message` containing domain name.
- **Priority**: P1

---

### TC-036

| Field | Value |
|-------|-------|
| **TC-ID** | TC-036 |
| **Story** | MV-US-005 |
| **Scenario** | Data summary table shows row count and column count |
| **Preconditions** | Session with loaded cardiology dataset (`session_id` from TC-016) |
| **Steps** | 1. Send `GET /api/data/summary?session_id=<session_id>`. |
| **Expected Result** | HTTP 200. Response contains `row_count` ≥ 300, `column_count` ≥ 13, `columns` array with one entry per column. Each column entry has `name`, `dtype`, `missing_count`, `missing_pct`, `unique_count`, `action_tag`, `action_color`. |
| **Priority** | P1 |

---

### TC-037

| Field | Value |
|-------|-------|
| **TC-ID** | TC-037 |
| **Story** | MV-US-005 |
| **Scenario** | Color-coded action tags — green, amber, red — correct based on missing % |
| **Preconditions** | Session with a dataset that has: columns with 0% missing (green), 10% missing (amber), 40% missing (red) |
| **Steps** | 1. Upload a custom CSV with three columns: `col_complete` (0% null), `col_partial` (10% null), `col_heavy` (40% null). 2. Call `GET /api/data/summary`. 3. Check `action_tag` and `action_color` for each column. |
| **Expected Result** | `col_complete`: `action_tag: "OK"`, `action_color: "green"`. `col_partial`: `action_tag: "Some Missing"`, `action_color: "amber"`. `col_heavy`: `action_tag: "High Missing"`, `action_color: "red"`. |
| **Priority** | P1 |

---

### TC-038

| Field | Value |
|-------|-------|
| **TC-ID** | TC-038 |
| **Story** | MV-US-005 |
| **Scenario** | Data quality score returned in range 0-100 |
| **Preconditions** | Session with loaded dataset |
| **Steps** | 1. Call `GET /api/data/summary?session_id=<session_id>`. 2. Read `data_quality_score` field. |
| **Expected Result** | `data_quality_score` is an integer between 0 and 100 (inclusive). For the clean built-in cardiology dataset, score should be ≥ 70. |
| **Priority** | P2 |

---

### TC-039

| Field | Value |
|-------|-------|
| **TC-ID** | TC-039 |
| **Story** | MV-US-005 |
| **Scenario** | Duplicate row warning shown when dataset has duplicates |
| **Preconditions** | Session with a CSV that has 5 duplicate rows inserted |
| **Steps** | 1. Upload CSV with intentional duplicate rows. 2. Call `GET /api/data/summary`. 3. Inspect `warnings` array. |
| **Expected Result** | `warnings` contains an entry with `level: "warning"` and message containing "duplicate rows". |
| **Priority** | P2 |

---

### TC-040

| Field | Value |
|-------|-------|
| **TC-ID** | TC-040 |
| **Story** | MV-US-006 |
| **Scenario** | Class distribution percentages displayed for target column |
| **Preconditions** | Session with loaded diabetes dataset (target: Outcome, classes 0 and 1) |
| **Steps** | 1. Call `GET /api/data/summary?session_id=<session_id>`. 2. Read `class_distribution` array. |
| **Expected Result** | `class_distribution` has exactly 2 entries with `class_name` values "0" and "1". Each entry has `count` > 0 and `percentage` > 0. Percentages sum to approximately 100. |
| **Priority** | P1 |

---

### TC-041

| Field | Value |
|-------|-------|
| **TC-ID** | TC-041 |
| **Story** | MV-US-006 |
| **Scenario** | Imbalance warning when minority class < 30% |
| **Preconditions** | Session with `imbalanced_valid.csv` (minority class ~5%) |
| **Steps** | 1. Upload `imbalanced_valid.csv`. 2. Call `GET /api/data/summary`. 3. Check `is_imbalanced` and `imbalance_warning`. |
| **Expected Result** | `is_imbalanced: true`. `imbalance_warning` non-null and mentions "SMOTE". `warnings` array contains an entry with `level: "warning"` and the same imbalance message. |
| **Priority** | P1 |

---

### TC-041-B

| Field | Value |
|-------|-------|
| **TC-ID** | TC-041-B |
| **Story** | MV-US-006 |
| **Scenario** | No imbalance warning when classes are balanced |
| **Preconditions** | Session with a 50/50 balanced dataset |
| **Steps** | 1. Upload a balanced CSV (equal class counts). 2. Call `GET /api/data/summary`. |
| **Expected Result** | `is_imbalanced: false`. `imbalance_warning: null`. |
| **Priority** | P2 |

---

### TC-042

| Field | Value |
|-------|-------|
| **TC-ID** | TC-042 |
| **Story** | MV-US-007 |
| **Scenario** | Column mapper UI opens and lists all CSV columns |
| **Preconditions** | Dataset loaded in UI; user is on Step 2 |
| **Steps** | 1. Click "Open Column Mapper" button. 2. Observe the modal. |
| **Expected Result** | Modal opens listing all column names from the uploaded CSV. Each column has a role selector (Feature / Target / Ignore). Default selections are pre-populated based on domain metadata. |
| **Priority** | P1 |

---

### TC-043

| Field | Value |
|-------|-------|
| **TC-ID** | TC-043 |
| **Story** | MV-US-007 |
| **Scenario** | Valid column mapping saved — schema_ok: true |
| **Preconditions** | Session with loaded cardiology dataset |
| **Steps** | 1. Send `POST /api/data/column-mapping` with body: `{"session_id": "<id>", "target_column": "target", "mappings": [{"csv_column": "age", "role": "feature"}, {"csv_column": "chol", "role": "feature"}, {"csv_column": "target", "role": "target"}]}`. |
| **Expected Result** | HTTP 200. `schema_ok: true`. `target_column: "target"`. `feature_count` ≥ 1. `warnings` array empty or contains only info-level messages. |
| **Priority** | P1 |

---

### TC-044

| Field | Value |
|-------|-------|
| **TC-ID** | TC-044 |
| **Story** | MV-US-007 |
| **Scenario** | Column mapping fails — target column not in dataset |
| **Preconditions** | Session with loaded dataset |
| **Steps** | 1. Send `POST /api/data/column-mapping` with `target_column: "nonexistent_col"`. |
| **Expected Result** | HTTP 200 (validation handled in service layer). `schema_ok: false`. `warnings` contains error-level entry: "Target column 'nonexistent_col' not found in the dataset." |
| **Priority** | P1 |

---

### TC-045

| Field | Value |
|-------|-------|
| **TC-ID** | TC-045 |
| **Story** | MV-US-007 |
| **Scenario** | Column mapping fails — zero feature columns |
| **Preconditions** | Session with loaded dataset |
| **Steps** | 1. Send `POST /api/data/column-mapping` with all columns set to `role: "ignore"` or `role: "target"`, no `role: "feature"`. |
| **Expected Result** | `schema_ok: false`. `warnings` contains error: "At least one feature column must be selected." |
| **Priority** | P1 |

---

### TC-046

| Field | Value |
|-------|-------|
| **TC-ID** | TC-046 |
| **Story** | MV-US-007 |
| **Scenario** | Target column included in feature list — validation error |
| **Preconditions** | Session with loaded dataset |
| **Steps** | 1. Send `POST /api/data/column-mapping` with `target_column: "target"` AND a mapping entry `{"csv_column": "target", "role": "feature"}`. |
| **Expected Result** | `schema_ok: false`. `warnings` contains error: "The target column must not also be a feature column." |
| **Priority** | P2 |

---

## Section 3: Step 3 — Data Preparation (MV-US-008, MV-US-009, MV-US-010, MV-US-012)

---

### TC-047

| Field | Value |
|-------|-------|
| **TC-ID** | TC-047 |
| **Story** | MV-US-008 |
| **Scenario** | Train/test slider renders with default 80/20 split |
| **Preconditions** | Column mapping saved (schema_ok: true); user on Step 3 |
| **Steps** | 1. Navigate to Step 3 in the UI. 2. Observe the train/test split slider. |
| **Expected Result** | Slider shows default value of 80% train / 20% test. Split percentages displayed as text labels next to the slider. |
| **Priority** | P1 |

---

### TC-048

| Field | Value |
|-------|-------|
| **TC-ID** | TC-048 |
| **Story** | MV-US-008 |
| **Scenario** | API accepts test_size values in valid range (0.1 to 0.4) |
| **Preconditions** | Session with valid column mapping |
| **Steps** | 1. Send `POST /api/data/prepare` with `test_size: 0.3` and valid other fields. 2. Send again with `test_size: 0.1`. 3. Send again with `test_size: 0.4`. |
| **Expected Result** | All three requests return HTTP 200. `train_rows` and `test_rows` reflect the requested split ratio. |
| **Priority** | P1 |

---

### TC-049

| Field | Value |
|-------|-------|
| **TC-ID** | TC-049 |
| **Story** | MV-US-008 |
| **Scenario** | API rejects test_size outside valid range |
| **Preconditions** | Session with valid column mapping |
| **Steps** | 1. Send `POST /api/data/prepare` with `test_size: 0.05`. 2. Send with `test_size: 0.5`. |
| **Expected Result** | HTTP 422 for both. Pydantic validation error returned indicating `test_size` must be ≥ 0.1 and ≤ 0.4. |
| **Priority** | P1 |

---

### TC-049-B

| Field | Value |
|-------|-------|
| **TC-ID** | TC-049-B |
| **Story** | MV-US-008 |
| **Scenario** | UI shows warning at extreme 50/50 split (if user manually types) |
| **Preconditions** | Step 3 UI visible |
| **Steps** | 1. Attempt to enter 50% in the test size field if text input is available. |
| **Expected Result** | UI either prevents input beyond 40% or shows warning text. API returns 422 if 0.5 is sent. |
| **Priority** | P3 |

---

### TC-050

| Field | Value |
|-------|-------|
| **TC-ID** | TC-050 |
| **Story** | MV-US-009 |
| **Scenario** | Missing value strategy "median" fills NaN with median value |
| **Preconditions** | Session with a dataset containing NaN values in a numeric column; column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `missing_strategy: "median"`, `normalisation: "none"`, `apply_smote: false`. 2. Inspect `missing_after` in response. |
| **Expected Result** | HTTP 200. `missing_after: 0` (all NaN filled). `before_after_stats` shows mean/std changed from pre-imputation values. |
| **Priority** | P1 |

---

### TC-051

| Field | Value |
|-------|-------|
| **TC-ID** | TC-051 |
| **Story** | MV-US-009 |
| **Scenario** | Missing value strategy "mode" fills NaN with mode |
| **Preconditions** | Session with NaN values; column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `missing_strategy: "mode"`. |
| **Expected Result** | HTTP 200. `missing_after: 0`. For categorical columns, NaN is filled with the most frequent value. |
| **Priority** | P1 |

---

### TC-052

| Field | Value |
|-------|-------|
| **TC-ID** | TC-052 |
| **Story** | MV-US-009 |
| **Scenario** | Missing value strategy "remove" drops rows with NaN |
| **Preconditions** | Session with a dataset where 20 rows have NaN in feature columns; column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `missing_strategy: "remove"`. 2. Inspect `rows_removed` and `train_rows + test_rows`. |
| **Expected Result** | HTTP 200. `rows_removed` = number of rows that had NaN in feature columns. `train_rows + test_rows` = original row count minus `rows_removed`. |
| **Priority** | P1 |

---

### TC-053

| Field | Value |
|-------|-------|
| **TC-ID** | TC-053 |
| **Story** | MV-US-010 |
| **Scenario** | Z-score normalisation: feature mean ≈ 0, std ≈ 1 after |
| **Preconditions** | Session with numeric features; column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `normalisation: "zscore"`. 2. Inspect `before_after_stats` for a numeric column such as "age". |
| **Expected Result** | HTTP 200. `normalisation.method: "zscore"`. In `before_after_stats`, the `after.mean` value is close to 0.0 (|mean| < 0.1) and `after.std` is close to 1.0 (0.9 < std < 1.1) for numeric columns. |
| **Priority** | P1 |

---

### TC-054

| Field | Value |
|-------|-------|
| **TC-ID** | TC-054 |
| **Story** | MV-US-010 |
| **Scenario** | Min-max normalisation: all feature values in [0, 1] after |
| **Preconditions** | Session with numeric features; column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `normalisation: "minmax"`. 2. Inspect `before_after_stats`. |
| **Expected Result** | HTTP 200. `normalisation.method: "minmax"`. In `before_after_stats`, `after.min` ≥ 0.0 and `after.max` ≤ 1.0 for all numeric columns. `normalisation.sample_after` values all in [0, 1]. |
| **Priority** | P1 |

---

### TC-055

| Field | Value |
|-------|-------|
| **TC-ID** | TC-055 |
| **Story** | MV-US-010 |
| **Scenario** | Normalisation "none" — values unchanged |
| **Preconditions** | Session with numeric features; column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `normalisation: "none"`. 2. Inspect `normalisation` object. |
| **Expected Result** | HTTP 200. `normalisation.method: "none"`. `normalisation.columns_normalised` is an empty list. `normalisation.sample_before` and `normalisation.sample_after` are both empty dicts. |
| **Priority** | P2 |

---

### TC-056

| Field | Value |
|-------|-------|
| **TC-ID** | TC-056 |
| **Story** | MV-US-012 |
| **Scenario** | Apply button triggers prepare endpoint and returns success |
| **Preconditions** | Session with valid column mapping; user on Step 3 in UI |
| **Steps** | 1. In the UI, set split to 80/20, missing strategy to "median", normalisation to "zscore", SMOTE off. 2. Click "Apply". |
| **Expected Result** | `POST /api/data/prepare` called. Response HTTP 200. `data_ready: true`. `success_message` is non-empty and describes preparation result. UI transitions to Step 4 (or shows Step 4 unlock). |
| **Priority** | P1 |

---

### TC-057

| Field | Value |
|-------|-------|
| **TC-ID** | TC-057 |
| **Story** | MV-US-012 |
| **Scenario** | Before/after stats present in preparation response |
| **Preconditions** | Session with valid column mapping and numeric features |
| **Steps** | 1. Send `POST /api/data/prepare` with z-score normalisation. 2. Inspect `before_after_stats`. |
| **Expected Result** | `before_after_stats` array is non-empty. Each entry has `column`, `before` (with min/max/mean/std/missing), and `after` (same fields). At least one column shows different values before and after. |
| **Priority** | P1 |

---

### TC-058

| Field | Value |
|-------|-------|
| **TC-ID** | TC-058 |
| **Story** | MV-US-012 |
| **Scenario** | SMOTE generates synthetic samples when class imbalance exists |
| **Preconditions** | Session with imbalanced dataset (minority class < 30%); column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `apply_smote: true`. 2. Inspect `smote` object. |
| **Expected Result** | `smote.applied: true`. `smote.synthetic_samples` > 0. `smote.after_distribution` shows more balanced class counts than `smote.before_distribution`. |
| **Priority** | P1 |

---

### TC-059

| Field | Value |
|-------|-------|
| **TC-ID** | TC-059 |
| **Story** | MV-US-012 |
| **Scenario** | SMOTE NOT applied when classes are balanced even if toggle is on |
| **Preconditions** | Session with balanced dataset (both classes ≥ 30%); column mapping validated |
| **Steps** | 1. Send `POST /api/data/prepare` with `apply_smote: true` on balanced data. 2. Inspect `smote`. |
| **Expected Result** | `smote.applied: false`. `smote.synthetic_samples: 0`. Distribution unchanged. |
| **Priority** | P1 |

---

### TC-060

| Field | Value |
|-------|-------|
| **TC-ID** | TC-060 |
| **Story** | MV-US-012 |
| **Scenario** | Green success banner shown in UI after Apply |
| **Preconditions** | Apply preparation executed successfully in UI |
| **Steps** | 1. Click Apply in Step 3. 2. Observe UI response. |
| **Expected Result** | A green banner or success notification appears containing the success message from the API. Banner includes train/test row counts and preparation summary. |
| **Priority** | P1 |

---

### TC-061

| Field | Value |
|-------|-------|
| **TC-ID** | TC-061 |
| **Story** | MV-US-012 |
| **Scenario** | Step 3 blocked before column mapper is saved — API returns 400 |
| **Preconditions** | Session with loaded data; column mapping NOT yet submitted (schema_ok = false) |
| **Steps** | 1. Load a built-in dataset via `POST /api/data/builtin`. 2. Without calling `/api/data/column-mapping`, send `POST /api/data/prepare`. |
| **Expected Result** | HTTP 400. Error message: "Column mapping has not been validated. Please complete Step 2 column mapping first." |
| **Priority** | P1 |

---

### TC-061-B

| Field | Value |
|-------|-------|
| **TC-ID** | TC-061-B |
| **Story** | MV-US-012 |
| **Scenario** | Step 3 UI shows red blocked banner before column mapper saved |
| **Preconditions** | User on Step 3 UI without having saved column mapping |
| **Steps** | 1. Navigate to Step 3 in the UI without completing the column mapper. |
| **Expected Result** | Step 3 controls are disabled or a red blocked banner appears: "Please complete column mapping in Step 2 before preparing data." Apply button is either hidden or disabled. |
| **Priority** | P1 |

---

## Section 4: Boundary Value Tests

---

### TC-BV-001

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-001 |
| **Story** | MV-US-003 |
| **Scenario** | Upload CSV with exactly 10 rows — minimum valid boundary |
| **Preconditions** | Backend running; `minimal_10_rows.csv` available (10 rows, 2 numeric cols) |
| **Steps** | 1. Upload `minimal_10_rows.csv` |
| **Expected Result** | HTTP 200. File accepted. `row_count: 10`. |
| **Priority** | P1 |

---

### TC-BV-002

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-002 |
| **Story** | MV-US-003 |
| **Scenario** | Upload CSV with exactly 9 rows — below minimum |
| **Preconditions** | Backend running; `nine_rows.csv` available |
| **Steps** | 1. Upload `nine_rows.csv`. |
| **Expected Result** | HTTP 422. Error message contains "at least 10 rows" and "has only 9". |
| **Priority** | P1 |

---

### TC-BV-003

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-003 |
| **Story** | MV-US-003 |
| **Scenario** | Upload file of exactly 50 MB — at the limit |
| **Preconditions** | A padded CSV of exactly 52,428,800 bytes (50 MB) available |
| **Steps** | 1. Upload the 50 MB file. |
| **Expected Result** | HTTP 200 (accepted — at limit, not over). File processed normally. |
| **Priority** | P2 |

---

### TC-BV-004

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-004 |
| **Story** | MV-US-003 |
| **Scenario** | Upload file of 50 MB + 1 byte — just over limit |
| **Preconditions** | A padded CSV of 52,428,801 bytes available |
| **Steps** | 1. Upload the 50 MB + 1 byte file. |
| **Expected Result** | HTTP 413. Error message contains "50 MB limit". |
| **Priority** | P2 |

---

### TC-BV-005

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-005 |
| **Story** | MV-US-008 |
| **Scenario** | test_size = 0.1 (minimum valid) accepted |
| **Preconditions** | Session with valid column mapping |
| **Steps** | 1. Send `POST /api/data/prepare` with `test_size: 0.1`. |
| **Expected Result** | HTTP 200. `test_rows` ≈ 10% of total rows. |
| **Priority** | P2 |

---

### TC-BV-006

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-006 |
| **Story** | MV-US-008 |
| **Scenario** | test_size = 0.4 (maximum valid) accepted |
| **Preconditions** | Session with valid column mapping |
| **Steps** | 1. Send `POST /api/data/prepare` with `test_size: 0.4`. |
| **Expected Result** | HTTP 200. `test_rows` ≈ 40% of total rows. |
| **Priority** | P2 |

---

### TC-BV-007

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-007 |
| **Story** | MV-US-008 |
| **Scenario** | test_size = 0.09 — below minimum — rejected |
| **Preconditions** | Session with valid column mapping |
| **Steps** | 1. Send `POST /api/data/prepare` with `test_size: 0.09`. |
| **Expected Result** | HTTP 422. Pydantic validation error. |
| **Priority** | P1 |

---

### TC-BV-008

| Field | Value |
|-------|-------|
| **TC-ID** | TC-BV-008 |
| **Story** | MV-US-008 |
| **Scenario** | test_size = 0.41 — above maximum — rejected |
| **Preconditions** | Session with valid column mapping |
| **Steps** | 1. Send `POST /api/data/prepare` with `test_size: 0.41`. |
| **Expected Result** | HTTP 422. Pydantic validation error. |
| **Priority** | P1 |

---

## Section 5: Error Handling and Negative Tests

---

### TC-ERR-001

| Field | Value |
|-------|-------|
| **TC-ID** | TC-ERR-001 |
| **Story** | MV-US-003, MV-US-007, MV-US-012 |
| **Scenario** | All endpoints return 404 for unknown session_id |
| **Preconditions** | Backend running |
| **Steps** | 1. Send `GET /api/data/summary?session_id=invalid-uuid-xyz`. 2. Send `POST /api/data/column-mapping` with `session_id: "fake-id"`. 3. Send `POST /api/data/prepare` with `session_id: "fake-id"`. |
| **Expected Result** | All three return HTTP 404. Message: "Session not found." |
| **Priority** | P1 |

---

### TC-ERR-002

| Field | Value |
|-------|-------|
| **TC-ID** | TC-ERR-002 |
| **Story** | Cross-cutting |
| **Scenario** | Network failure during Apply shows error in UI |
| **Preconditions** | User on Step 3 UI; network connectivity can be simulated off via Chrome DevTools |
| **Steps** | 1. Open Chrome DevTools → Network tab → set throttle to "Offline". 2. Click Apply in Step 3. |
| **Expected Result** | UI shows a red error banner or toast notification: "Network error. Please check your connection and try again." Apply button remains available for retry. No crash or blank screen. |
| **Priority** | P2 |

---

### TC-ERR-003

| Field | Value |
|-------|-------|
| **TC-ID** | TC-ERR-003 |
| **Story** | Cross-cutting |
| **Scenario** | Accessing summary without data loaded — returns 400 |
| **Preconditions** | Fresh session created (e.g., via POST /api/data/builtin) but somehow df is cleared |
| **Steps** | 1. Create a session. 2. Manually call `GET /api/data/summary?session_id=<id>` before loading any data (using an old session_id after data TTL). |
| **Expected Result** | HTTP 400. Message: "No dataset loaded in this session." |
| **Priority** | P2 |

---

### TC-ERR-004

| Field | Value |
|-------|-------|
| **TC-ID** | TC-ERR-004 |
| **Story** | MV-US-004 |
| **Scenario** | Load built-in dataset for unknown domain_id |
| **Preconditions** | Backend running |
| **Steps** | 1. Send `POST /api/data/builtin` with `{"domain_id": "unknown-xyz"}`. |
| **Expected Result** | HTTP 400. Error message: "Unknown domain: 'unknown-xyz'". |
| **Priority** | P1 |

---

### TC-ERR-005

| Field | Value |
|-------|-------|
| **TC-ID** | TC-ERR-005 |
| **Story** | MV-US-009 |
| **Scenario** | Invalid missing_strategy value rejected |
| **Preconditions** | Session with valid mapping |
| **Steps** | 1. Send `POST /api/data/prepare` with `missing_strategy: "interpolate"`. |
| **Expected Result** | HTTP 422. Pydantic validation error: `missing_strategy` must be "median", "mode", or "remove". |
| **Priority** | P2 |

---

## Section 6: Cross-cutting — Keyboard Navigation and Accessibility

---

### TC-KBD-001

| Field | Value |
|-------|-------|
| **TC-ID** | TC-KBD-001 |
| **Story** | Cross-cutting (Accessibility) |
| **Scenario** | All domain pills are keyboard-accessible via Tab and Enter |
| **Preconditions** | Application loaded in Chrome |
| **Steps** | 1. Press Tab repeatedly to move focus through the domain pill bar. 2. When focus is on a pill, press Enter. |
| **Expected Result** | All 20 pills receive keyboard focus in a logical order. Pressing Enter activates the selected pill (same as mouse click). Focus indicator is visible. |
| **Priority** | P2 |

---

### TC-KBD-002

| Field | Value |
|-------|-------|
| **TC-ID** | TC-KBD-002 |
| **Story** | Cross-cutting (Accessibility) |
| **Scenario** | Column mapper modal is keyboard-navigable |
| **Preconditions** | Column mapper modal open |
| **Steps** | 1. Open column mapper. 2. Navigate all dropdowns and the Save button using Tab / Shift+Tab / Arrow keys. 3. Press Escape to close. |
| **Expected Result** | All interactive elements reachable by keyboard. Modal closes with Escape. Focus returns to the trigger button on close. |
| **Priority** | P2 |

---

### TC-KBD-003

| Field | Value |
|-------|-------|
| **TC-ID** | TC-KBD-003 |
| **Story** | Cross-cutting (Accessibility) |
| **Scenario** | Step 3 slider operable via keyboard arrow keys |
| **Preconditions** | Step 3 accessible; column mapping saved |
| **Steps** | 1. Tab to the train/test split slider. 2. Press Right Arrow to increase. 3. Press Left Arrow to decrease. |
| **Expected Result** | Slider value changes in increments. Displayed percentage updates in real time. Values remain within valid bounds. |
| **Priority** | P2 |

---

## Section 7: Data Preview (MV-US-005 extension)

---

### TC-PREV-001

| Field | Value |
|-------|-------|
| **TC-ID** | TC-PREV-001 |
| **Story** | MV-US-005 |
| **Scenario** | Default data preview returns first 5 rows |
| **Preconditions** | Session with loaded dataset |
| **Steps** | 1. Send `GET /api/data/preview?session_id=<id>`. |
| **Expected Result** | HTTP 200. `rows` array has 5 entries. `columns` array matches CSV headers. `total_rows` equals full dataset row count. |
| **Priority** | P2 |

---

### TC-PREV-002

| Field | Value |
|-------|-------|
| **TC-ID** | TC-PREV-002 |
| **Story** | MV-US-005 |
| **Scenario** | Preview with rows=10 returns 10 rows |
| **Preconditions** | Session with loaded dataset (≥ 10 rows) |
| **Steps** | 1. Send `GET /api/data/preview?session_id=<id>&rows=10`. |
| **Expected Result** | HTTP 200. `rows` array has exactly 10 entries. |
| **Priority** | P3 |

---

### TC-PREV-003

| Field | Value |
|-------|-------|
| **TC-ID** | TC-PREV-003 |
| **Story** | MV-US-005 |
| **Scenario** | Preview NaN values serialised as null |
| **Preconditions** | Session with dataset containing NaN values |
| **Steps** | 1. Send `GET /api/data/preview?session_id=<id>`. 2. Inspect row data for NaN-containing columns. |
| **Expected Result** | NaN values appear as JSON `null`, not as the string "NaN" or float `nan`. |
| **Priority** | P2 |

---

## Section 8: Preparation Status Endpoint

---

### TC-STATUS-001

| Field | Value |
|-------|-------|
| **TC-ID** | TC-STATUS-001 |
| **Story** | MV-US-012 |
| **Scenario** | Preparation status before prepare — is_prepared: false |
| **Preconditions** | Session with valid column mapping but prepare not yet called |
| **Steps** | 1. Send `GET /api/data/preparation-status?session_id=<id>`. |
| **Expected Result** | HTTP 200. `is_prepared: false`. `train_rows: null`. `test_rows: null`. |
| **Priority** | P2 |

---

### TC-STATUS-002

| Field | Value |
|-------|-------|
| **TC-ID** | TC-STATUS-002 |
| **Story** | MV-US-012 |
| **Scenario** | Preparation status after prepare — is_prepared: true with row counts |
| **Preconditions** | Session with completed preparation |
| **Steps** | 1. Call `POST /api/data/prepare` successfully. 2. Send `GET /api/data/preparation-status?session_id=<id>`. |
| **Expected Result** | HTTP 200. `is_prepared: true`. `train_rows` and `test_rows` are both positive integers matching the preparation result. |
| **Priority** | P1 |
