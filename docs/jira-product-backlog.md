# MedVix — Jira Product Backlog

**Project Key**: MV | **Board Type**: Scrum | **Total Stories**: 25 | **Total Story Points**: 100

---

## Epics

| Key | Epic Name | Pipeline Step | Description |
|-----|-----------|--------------|-------------|
| EP-01 | Clinical Context | Step 1 | Specialty selection and clinical problem introduction |
| EP-02 | Data Exploration | Step 2 | Dataset upload, preview, column mapping, and validation |
| EP-03 | Data Preparation | Step 3 | Train/test split, missing values, normalisation, SMOTE |
| EP-04 | Model & Parameters | Step 4 | Model selection, hyperparameter tuning, comparison |
| EP-05 | Results & Evaluation | Step 5 | Performance metrics, confusion matrix, ROC curve |
| EP-06 | Explainability | Step 6 | SHAP global feature importance and single-patient waterfall |
| EP-07 | Ethics & Bias | Step 7 | Subgroup fairness, EU AI Act checklist, PDF certificate |
| EP-08 | Infrastructure & DevOps | Cross-cutting | Glossary, navigation, shared UI components |

---

## User Stories

---

### EP-01: Clinical Context

---

#### MV-US-001: Select medical specialty from pill bar

**Epic**: EP-01 Clinical Context
**Story**: As a healthcare professional, I want to select my medical specialty from a pill bar, so that all content updates to my clinical context.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: Medical Specialty Selection

  Scenario: Select a specialty from the pill bar
    Given I am on the home screen
    When I click "Cardiology"
    Then the domain label updates to "Cardiology"
    And Step 1 text shows heart disease content

  Scenario: Switch specialty with progress warning
    Given I have selected a specialty
    And I have progressed beyond Step 1
    When I click a different specialty
    Then a confirmation dialog warns me that progress will be reset

  Scenario: Confirm specialty switch
    Given the confirmation dialog is displayed
    When I click "Confirm"
    Then the specialty changes to the newly selected domain
    And all pipeline progress resets to Step 1

  Scenario: Cancel specialty switch
    Given the confirmation dialog is displayed
    When I click "Cancel"
    Then the specialty remains unchanged
    And my progress is preserved
```

---

#### MV-US-002: View clinical context description

**Epic**: EP-01 Clinical Context
**Story**: As a healthcare professional, I want to read a clinical introduction for my selected specialty, so that I understand the medical problem the AI is predicting.
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: Clinical Context Description

  Scenario: View clinical introduction for Cardiology
    Given I have selected "Cardiology"
    When Step 1 loads
    Then I see a description of the heart disease prediction problem
    And the description includes the patient population
    And the description includes the target outcome

  Scenario: Clinical context matches selected specialty
    Given I have selected "Nephrology"
    When Step 1 loads
    Then I see a description of the chronic kidney disease prediction problem
    And the content is specific to the Nephrology domain
```

---

### EP-02: Data Exploration

---

#### MV-US-003: Upload custom CSV patient file

**Epic**: EP-02 Data Exploration
**Story**: As a nurse, I want to upload my own CSV patient file, so that I can use real data instead of the example dataset.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: CSV File Upload

  Scenario: Upload a valid CSV file
    Given I am on Step 2
    When I click "Upload Your CSV"
    And I drag a valid .csv file that is ≤50 MB with ≥10 rows and ≥1 numeric column
    Then I see the filename, file size, and column count
    And a green success banner is displayed

  Scenario: Upload an oversized file
    Given I click "Upload Your CSV"
    When I drag a .csv file that is >50 MB
    Then I see a red error message stating "File exceeds 50 MB limit"

  Scenario: Upload a file with no numeric columns
    Given I click "Upload Your CSV"
    When I drag a .csv file that has no numeric columns
    Then I see a red error message stating "No numeric columns found"

  Scenario: Upload a non-CSV file
    Given I click "Upload Your CSV"
    When I drag a .xlsx file
    Then I see a red error message stating "Only .csv files are accepted"
```

---

#### MV-US-004: Select built-in example dataset

**Epic**: EP-02 Data Exploration
**Story**: As a student learning ML, I want to select a pre-loaded example dataset, so that I can start exploring without needing my own data.
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: Built-in Example Dataset

  Scenario: Load example dataset for selected specialty
    Given I am on Step 2
    And I have selected "Cardiology" as my specialty
    When I click "Use Example Dataset"
    Then the Heart Disease UCI dataset loads immediately
    And I see the dataset preview with rows and columns

  Scenario: Example dataset matches domain
    Given I have selected "Endocrinology — Diabetes"
    When I click "Use Example Dataset"
    Then the Pima Indians Diabetes dataset loads
    And the column names match the expected dataset
```

---

#### MV-US-005: View data summary table

**Epic**: EP-02 Data Exploration
**Story**: As a clinical researcher, I want to see which columns have missing values, so that I can decide how to handle them before training.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 2

**Acceptance Criteria**:

```gherkin
Feature: Data Summary Table

  Scenario: View feature summary for loaded data
    Given data is loaded on Step 2
    When I view the feature table
    Then each column shows its data type
    And each column shows the missing value percentage
    And each column shows a colour-coded action tag

  Scenario: Colour coding for missing values
    Given data is loaded
    When a column has >30% missing values
    Then the action tag is red with "High Missing"
    When a column has 5-30% missing values
    Then the action tag is amber with "Some Missing"
    When a column has <5% missing values
    Then the action tag is green with "OK"
```

---

#### MV-US-006: View outcome class breakdown

**Epic**: EP-02 Data Exploration
**Story**: As a healthcare professional, I want to see how many patients fall into each outcome category, so that I understand if the data is balanced.
**Priority**: Should Have
**Story Points**: 3
**Sprint**: Sprint 2

**Acceptance Criteria**:

```gherkin
Feature: Outcome Class Breakdown

  Scenario: Display class distribution chart
    Given data is loaded on Step 2
    When I view the outcome breakdown section
    Then I see a bar chart showing patient count per outcome category

  Scenario: Detect class imbalance
    Given data is loaded
    When one outcome category has fewer than 30% of total patients
    Then an amber warning banner appears stating "Class imbalance detected"
    And the banner suggests enabling SMOTE in Step 3
```

---

#### MV-US-007: Open column mapper and select target

**Epic**: EP-02 Data Exploration
**Story**: As a clinical researcher, I want to map which column is the prediction target, so that the model knows what outcome to predict.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: Column Mapper

  Scenario: Open column mapper modal
    Given data is loaded on Step 2
    When I click "Open Column Mapper"
    Then a modal opens with a dropdown listing all columns

  Scenario: Select and save target column
    Given the column mapper modal is open
    When I select "target" from the dropdown
    And I click "Save"
    Then a green confirmation banner appears stating "Target column set to 'target'"
    And Step 3 is unlocked in the stepper

  Scenario: Prevent non-categorical target
    Given the column mapper modal is open
    When I select a column with >20 unique values
    Then a warning appears suggesting this may be a continuous variable
```

---

### EP-03: Data Preparation

---

#### MV-US-008: Adjust training/test split ratio

**Epic**: EP-03 Data Preparation
**Story**: As a student learning ML, I want to adjust the training/test split with a slider, so that I understand how data allocation affects model evaluation.
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: Training/Test Split Slider

  Scenario: Adjust split ratio
    Given I am on Step 3
    When I move the split slider to 70/30
    Then the displayed percentages update to "70% Training / 30% Testing"

  Scenario: Default split ratio
    Given I arrive at Step 3 for the first time
    Then the slider is set to 80/20 by default
    And the display shows "80% Training / 20% Testing"

  Scenario: Extreme split warning
    Given I am on Step 3
    When I move the slider below 50/50
    Then an amber warning appears stating "Training set may be too small for reliable results"
```

---

#### MV-US-009: Choose missing value strategy

**Epic**: EP-03 Data Preparation
**Story**: As a healthcare professional, I want to choose how missing values are handled, so that I can pick the most appropriate clinical approach.
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 2

**Acceptance Criteria**:

```gherkin
Feature: Missing Value Strategy

  Scenario: Select median imputation
    Given I am on Step 3
    When I select "Median" from the missing value options
    Then the "Median" option is highlighted
    And an explanation appears: "Replaces missing values with the column median — robust to outliers"

  Scenario: Select mode imputation
    Given I am on Step 3
    When I select "Mode" from the missing value options
    Then the "Mode" option is highlighted
    And an explanation appears: "Replaces missing values with the most frequent value"

  Scenario: Select remove rows
    Given I am on Step 3
    When I select "Remove Rows" from the missing value options
    Then the "Remove Rows" option is highlighted
    And an explanation appears: "Removes any row with at least one missing value"
```

---

#### MV-US-010: Choose normalisation method

**Epic**: EP-03 Data Preparation
**Story**: As a clinical researcher, I want to select a normalisation method, so that no single measurement dominates the model.
**Priority**: Must Have
**Story Points**: 2
**Sprint**: Sprint 2

**Acceptance Criteria**:

```gherkin
Feature: Normalisation Method

  Scenario: Select Z-score normalisation
    Given I am on Step 3
    When I select "Z-score"
    Then the option is highlighted
    And an explanation appears: "Transforms values to have mean 0 and standard deviation 1"

  Scenario: Select Min-Max normalisation
    Given I am on Step 3
    When I select "Min-Max"
    Then the option is highlighted
    And an explanation appears: "Scales values to a 0–1 range based on minimum and maximum"
```

---

#### MV-US-011: Toggle SMOTE for class imbalance

**Epic**: EP-03 Data Preparation
**Story**: As a healthcare professional, I want to enable SMOTE balancing, so that the model learns equally from both outcome groups.
**Priority**: Should Have
**Story Points**: 3
**Sprint**: Sprint 3

**Acceptance Criteria**:

```gherkin
Feature: SMOTE Toggle

  Scenario: Enable SMOTE when imbalance detected
    Given class imbalance was detected in Step 2
    And I am on Step 3
    When I toggle SMOTE ON
    Then an explanation appears: "Synthetic examples will be created for the rare outcome in training data only"

  Scenario: SMOTE hidden when no imbalance
    Given no class imbalance was detected in Step 2
    When I view Step 3
    Then the SMOTE toggle is not visible

  Scenario: SMOTE only applied to training set
    Given SMOTE is enabled
    When preparation is applied
    Then synthetic samples are added only to the training set
    And the test set remains unchanged
```

---

#### MV-US-012: Apply preparation and view before/after comparison

**Epic**: EP-03 Data Preparation
**Story**: As a student learning ML, I want to see a before/after comparison of my data, so that I understand the effect of each preparation step.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 2

**Acceptance Criteria**:

```gherkin
Feature: Preparation Before/After Comparison

  Scenario: Apply preparation and view comparison
    Given I have configured all preparation settings on Step 3
    When I click "Apply Preparation Settings"
    Then a side-by-side comparison shows data statistics before and after preparation

  Scenario: Comparison shows key statistics
    Given preparation has been applied
    When I view the before/after comparison
    Then I see row count, missing value count, and value range for each column
    And changes are highlighted in green
```

---

### EP-04: Model & Parameters

---

#### MV-US-013: Select ML model from six options

**Epic**: EP-04 Model & Parameters
**Story**: As a student learning ML, I want to select one of six ML models, so that I can compare different approaches to the same clinical problem.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: ML Model Selection

  Scenario: Select KNN model
    Given I am on Step 4
    When I click "KNN"
    Then the KNN parameter panel appears
    And I see a K slider and a distance measure dropdown

  Scenario: Switch to Decision Tree
    Given I have selected KNN
    When I click "Decision Tree"
    Then the parameter panel updates to show Maximum Depth slider

  Scenario: All six models available
    Given I am on Step 4
    Then I see six model cards: KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes
```

---

#### MV-US-014: Adjust KNN K slider with live update

**Epic**: EP-04 Model & Parameters
**Story**: As a student learning ML, I want to move a slider to change the K value in KNN and see the scatter plot update instantly, so that I understand how K affects predictions.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 3

**Acceptance Criteria**:

```gherkin
Feature: KNN K Slider with Live Update

  Scenario: Move K slider with auto-retrain ON
    Given KNN is selected
    And Auto-Retrain is ON
    When I move the K slider from 5 to 11
    Then the model retrains automatically
    And metrics update within 300 ms

  Scenario: K slider range
    Given KNN is selected
    Then the K slider ranges from 1 to 25
    And the default value is 5
```

---

#### MV-US-015: Toggle auto-retrain

**Epic**: EP-04 Model & Parameters
**Story**: As a healthcare professional, I want to disable auto-retrain for large datasets, so that the tool remains responsive while I adjust multiple parameters.
**Priority**: Should Have
**Story Points**: 3
**Sprint**: Sprint 3

**Acceptance Criteria**:

```gherkin
Feature: Auto-Retrain Toggle

  Scenario: Disable auto-retrain
    Given Auto-Retrain is ON
    When I toggle it OFF
    Then a "Train Model" button appears
    And parameter changes no longer trigger automatic training

  Scenario: Manual training after disabling auto-retrain
    Given Auto-Retrain is OFF
    And I have changed the K value
    When I click "Train Model"
    Then the model trains with the updated parameters
    And metrics update after training completes
```

---

#### MV-US-016: Compare trained models side by side

**Epic**: EP-04 Model & Parameters
**Story**: As a clinical researcher, I want to add models to a comparison table, so that I can pick the best-performing model for my clinical context.
**Priority**: Should Have
**Story Points**: 5
**Sprint**: Sprint 3

**Acceptance Criteria**:

```gherkin
Feature: Model Comparison Table

  Scenario: Add first model to comparison
    Given I have trained KNN
    When I click "+ Compare"
    Then a comparison table row appears showing Accuracy, Sensitivity, Specificity, AUC for KNN

  Scenario: Add second model to comparison
    Given KNN is already in the comparison table
    And I have trained Random Forest
    When I click "+ Compare"
    Then a second row is added to the same table showing Random Forest metrics

  Scenario: Highlight best model
    Given two or more models are in the comparison table
    Then the model with the highest AUC is highlighted in green
```

---

### EP-05: Results & Evaluation

---

#### MV-US-017: View six performance metrics

**Epic**: EP-05 Results & Evaluation
**Story**: As a healthcare professional, I want to see all six performance metrics in plain clinical language, so that I can evaluate whether the model is suitable for my use case.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 3

**Acceptance Criteria**:

```gherkin
Feature: Performance Metrics Display

  Scenario: View all six metrics
    Given a model is trained
    When I view Step 5
    Then I see Accuracy, Sensitivity, Specificity, Precision, F1 Score, and AUC-ROC
    And each metric is displayed as a card with a clinical explanation

  Scenario: Low sensitivity warning
    Given a model is trained
    And Sensitivity is below 50%
    When results load
    Then a red "Low Sensitivity Warning" banner appears
    And the banner explains that more than half of positive cases are being missed
```

---

#### MV-US-018: View confusion matrix

**Epic**: EP-05 Results & Evaluation
**Story**: As a student learning ML, I want to see a colour-coded confusion matrix, so that I understand where the model makes correct and incorrect predictions.
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 3

**Acceptance Criteria**:

```gherkin
Feature: Confusion Matrix

  Scenario: View confusion matrix
    Given a model is trained
    When I view the confusion matrix on Step 5
    Then I see a 2x2 table with True Negatives, False Positives, False Negatives, True Positives
    And cells are colour-coded (green for correct, red for incorrect)
    And clinical labels are used (e.g., "Correctly identified healthy", "Missed disease")
```

---

#### MV-US-019: View ROC curve

**Epic**: EP-05 Results & Evaluation
**Story**: As a clinical researcher, I want to see the ROC curve, so that I can evaluate model discrimination across different decision thresholds.
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 3

**Acceptance Criteria**:

```gherkin
Feature: ROC Curve

  Scenario: View ROC curve
    Given a model is trained
    When I view the ROC chart on Step 5
    Then I see the model's curve plotted against the diagonal random-guessing line
    And the AUC value is displayed on the chart

  Scenario: Good discrimination indicator
    Given a model is trained
    And the AUC is above 0.8
    Then a green label "Good discrimination" is shown next to the AUC value
```

---

### EP-06: Explainability

---

#### MV-US-020: View global SHAP feature importance

**Epic**: EP-06 Explainability
**Story**: As a healthcare professional, I want to see which measurements most influence predictions, so that I can verify the model uses clinically meaningful factors.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 4

**Acceptance Criteria**:

```gherkin
Feature: Global SHAP Feature Importance

  Scenario: View feature importance chart
    Given a model is trained
    When I view Step 6
    Then I see a ranked horizontal bar chart of SHAP feature importance
    And bars use clinical column names (not raw variable names)

  Scenario: Top features highlighted
    Given the SHAP chart is displayed
    Then the top 3 features are visually distinguished
    And a plain-language summary states which features matter most
```

---

#### MV-US-021: View single-patient SHAP waterfall

**Epic**: EP-06 Explainability
**Story**: As a healthcare professional, I want to select a specific patient and see what drove their prediction, so that I can explain the result to a colleague.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 4

**Acceptance Criteria**:

```gherkin
Feature: Single-Patient SHAP Waterfall

  Scenario: Select a patient and view waterfall
    Given I am on Step 6
    When I select a test patient from the dropdown
    Then a waterfall chart appears
    And red bars show factors that pushed towards high-risk
    And green bars show factors that pushed towards low-risk
    And bars use plain-language clinical labels

  Scenario: Patient prediction summary
    Given a patient waterfall chart is displayed
    Then a text summary states the patient's predicted outcome and confidence
```

---

### EP-07: Ethics & Bias

---

#### MV-US-022: View subgroup fairness table

**Epic**: EP-07 Ethics & Bias
**Story**: As a healthcare professional, I want to see model performance broken down by gender and age group, so that I can identify potential bias before deployment.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 4

**Acceptance Criteria**:

```gherkin
Feature: Subgroup Fairness Table

  Scenario: View fairness breakdown
    Given a model is trained
    When I view Step 7
    Then I see Accuracy, Sensitivity, Specificity for male/female
    And I see Accuracy, Sensitivity, Specificity for age groups (18-60, 61-75, 76+)
    And metrics are colour-coded green/amber/red

  Scenario: Bias detection
    Given a model is trained
    And any subgroup's Sensitivity is >10 percentage points lower than overall Sensitivity
    When Step 7 loads
    Then a red "Bias Detected" banner appears
    And the banner identifies the specific subgroup and metric difference
```

---

#### MV-US-023: Complete EU AI Act compliance checklist

**Epic**: EP-07 Ethics & Bias
**Story**: As a healthcare educator, I want to work through an EU AI Act compliance checklist, so that students learn about regulatory requirements for clinical AI.
**Priority**: Must Have
**Story Points**: 3
**Sprint**: Sprint 4

**Acceptance Criteria**:

```gherkin
Feature: EU AI Act Compliance Checklist

  Scenario: View checklist with pre-checked items
    Given I am on Step 7
    When I view the compliance checklist
    Then I see 8 checklist items
    And "Model explanations provided" is pre-checked (from Step 6)
    And "Training data documented" is pre-checked (from Step 2)

  Scenario: Complete all checklist items
    Given I have checked all 8 items
    When I view the checklist status
    Then a green "Compliant" indicator appears

  Scenario: Incomplete checklist
    Given I have checked only 5 of 8 items
    When I view the checklist status
    Then an amber "5/8 Complete" indicator appears
```

---

#### MV-US-024: Download PDF summary certificate

**Epic**: EP-07 Ethics & Bias
**Story**: As a healthcare educator, I want to download a PDF summary certificate after completing all 7 steps, so that I have evidence of the exercise.
**Priority**: Must Have
**Story Points**: 5
**Sprint**: Sprint 4

**Acceptance Criteria**:

```gherkin
Feature: PDF Summary Certificate

  Scenario: Download certificate
    Given Step 7 is reached
    When I click "Download Certificate"
    Then a PDF is generated within 10 seconds
    And the PDF contains the specialty name
    And the PDF contains the model trained
    And the PDF contains all 6 metric values
    And the PDF contains bias findings
    And the PDF contains EU AI Act checklist status

  Scenario: Certificate unavailable before Step 7
    Given I am on Step 5
    Then the "Download Certificate" button is not visible
```

---

### EP-08: Infrastructure & DevOps

---

#### MV-US-025: Access glossary of ML terms

**Epic**: EP-08 Infrastructure & DevOps
**Story**: As a healthcare professional, I want to access a glossary of ML terms, so that I can understand technical concepts used throughout the tool.
**Priority**: Should Have
**Story Points**: 3
**Sprint**: Sprint 1

**Acceptance Criteria**:

```gherkin
Feature: ML Glossary

  Scenario: Open glossary from any step
    Given I am on any step of the pipeline
    When I click the Help button in the top navigation
    Then a glossary modal opens

  Scenario: Glossary content
    Given the glossary modal is open
    Then I see definitions for at least 20 key terms
    And the terms include: Algorithm, Training Data, Test Data, Sensitivity, Specificity, Precision, F1 Score, AUC-ROC, Confusion Matrix, SHAP, SMOTE, Normalisation, Imputation, Overfitting, Underfitting, Cross-validation, Feature, Target Variable, Binary Classification, ROC Curve

  Scenario: Close glossary
    Given the glossary modal is open
    When I click the close button or press Escape
    Then the modal closes and I return to my current step
```

---

## Sprint Assignments

### Sprint 1 — Foundation & Design (due 4 Mar 2026)

| Story | Title | SP |
|-------|-------|----|
| MV-US-001 | Select medical specialty from pill bar | 5 |
| MV-US-002 | View clinical context description | 3 |
| MV-US-003 | Upload custom CSV patient file | 5 |
| MV-US-004 | Select built-in example dataset | 3 |
| MV-US-007 | Open column mapper and select target | 5 |
| MV-US-008 | Adjust training/test split ratio | 3 |
| MV-US-013 | Select ML model from six options | 5 |
| MV-US-025 | Access glossary of ML terms | 3 |
| **Total** | | **32 SP** |

### Sprint 2 — MVP Steps 1-3 (due 18 Mar 2026)

| Story | Title | SP |
|-------|-------|----|
| MV-US-005 | View data summary table | 5 |
| MV-US-006 | View outcome class breakdown | 3 |
| MV-US-009 | Choose missing value strategy | 3 |
| MV-US-010 | Choose normalisation method | 2 |
| MV-US-012 | Apply preparation and view before/after comparison | 5 |
| **Total** | | **18 SP** |

### Sprint 3 — Core ML Steps 4-5 (due 1 Apr 2026)

| Story | Title | SP |
|-------|-------|----|
| MV-US-011 | Toggle SMOTE for class imbalance | 3 |
| MV-US-014 | Adjust KNN K slider with live update | 5 |
| MV-US-015 | Toggle auto-retrain | 3 |
| MV-US-016 | Compare trained models side by side | 5 |
| MV-US-017 | View six performance metrics | 5 |
| MV-US-018 | View confusion matrix | 3 |
| MV-US-019 | View ROC curve | 3 |
| **Total** | | **27 SP** |

### Sprint 4 — Full Pipeline Steps 6-7 (due 15 Apr 2026)

| Story | Title | SP |
|-------|-------|----|
| MV-US-020 | View global SHAP feature importance | 5 |
| MV-US-021 | View single-patient SHAP waterfall | 5 |
| MV-US-022 | View subgroup fairness table | 5 |
| MV-US-023 | Complete EU AI Act compliance checklist | 3 |
| MV-US-024 | Download PDF summary certificate | 5 |
| **Total** | | **23 SP** |

---

## Velocity Plan

| Sprint | SP Committed | Theme |
|--------|-------------|-------|
| Sprint 1 | 32 | Foundation & Design |
| Sprint 2 | 18 | MVP (Steps 1-3) |
| Sprint 3 | 27 | Core ML (Steps 4-5) |
| Sprint 4 | 23 | Full Pipeline (Steps 6-7) |
| Sprint 5 | — | Polish, Testing & Bug Fixes |
| **Total** | **100 SP** | |
