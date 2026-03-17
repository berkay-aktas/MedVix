# MedVix — ML Glossary for Healthcare Professionals

**Version**: 1.0
**Sprint**: Sprint 2
**Author**: Ozge ALTINOK / Arzu Tugce KOCA
**Date**: 17 March 2026

This glossary defines the core machine learning and statistical terms used in MedVix. Definitions are written in accessible language suitable for healthcare professionals who may not have a formal ML background. Where relevant, a clinical analogy is provided to ground each concept.

---

## How to Use This Glossary

- **Tag: Clinical** — concepts borrowed from or closely related to clinical practice
- **Tag: ML** — core machine learning concepts
- **Tag: Statistics** — statistical concepts that underpin ML methods

Terms appear alphabetically. Use the search function in the MedVix glossary modal to jump directly to a term.

---

### Algorithm

**Definition**: A step-by-step set of instructions a computer follows to learn patterns from data and make predictions. Just as a diagnostic protocol guides a clinician through a series of tests to reach a diagnosis, an ML algorithm follows a defined process to identify patterns in patient data.

**Clinical Example**: The KNN algorithm finds the K most similar patients in the training set and predicts an outcome based on what happened to those similar patients — analogous to a clinician saying "I've seen ten patients like this before; eight of them had condition X."

**Tag**: ML

---

### AUC-ROC (Area Under the ROC Curve)

**Definition**: A single number (0 to 1) that summarises how well a model distinguishes between positive and negative cases across all possible classification thresholds. An AUC of 0.5 means the model is no better than random chance; an AUC of 1.0 means perfect discrimination.

**Clinical Example**: An AUC of 0.85 for a sepsis prediction model means that if you randomly pick one sepsis patient and one non-sepsis patient, the model correctly assigns a higher risk score to the sepsis patient 85% of the time.

**Tag**: Statistics, ML

---

### Binary Classification

**Definition**: A machine learning task where the model predicts one of exactly two possible outcomes. The most common type in clinical decision support.

**Clinical Example**: "Does this patient have diabetes?" (Yes/No) or "Is this tumour malignant or benign?" (Malignant/Benign) are binary classification tasks.

**Tag**: ML, Clinical

---

### Class Imbalance

**Definition**: A condition where one outcome category has far fewer examples than the other in the training dataset. For example, if 90% of patients are healthy and only 10% have the disease, the dataset is imbalanced. Class imbalance causes models to become biased towards the majority class.

**Clinical Example**: Sepsis occurs in only ~5% of ICU patients. A model trained on raw imbalanced data could achieve 95% accuracy by predicting "no sepsis" for every patient — but would miss all actual sepsis cases. SMOTE and other resampling techniques address this problem.

**Tag**: ML, Statistics

---

### Confusion Matrix

**Definition**: A 2×2 table (for binary classification) showing the counts of True Positives, True Negatives, False Positives, and False Negatives. It is the primary tool for understanding how a model makes errors.

**Clinical Example**:

|  | Predicted Positive | Predicted Negative |
|--|--------------------|--------------------|
| **Actually Positive** | True Positive (TP) — Correctly identified disease | False Negative (FN) — Missed diagnosis |
| **Actually Negative** | False Positive (FP) — False alarm | True Negative (TN) — Correctly cleared |

In cancer screening, False Negatives (missed cancers) are typically more costly than False Positives (unnecessary biopsies).

**Tag**: ML, Clinical

---

### Cross-Validation

**Definition**: A technique to estimate how well a model will perform on unseen patients by repeatedly splitting the dataset into different training and test portions and averaging the results. It provides a more reliable performance estimate than a single train/test split.

**Clinical Example**: 5-fold cross-validation is like running the same diagnostic test on five different patient cohorts and averaging the accuracy — it gives a more generalisable estimate of performance than testing on a single cohort.

**Tag**: Statistics, ML

---

### Decision Tree

**Definition**: A model that makes predictions by following a series of yes/no questions organised as a branching tree structure. Each node in the tree tests a feature value; each leaf node gives a prediction.

**Clinical Example**: A decision tree for diabetes screening might ask: "Is BMI > 30?" → If yes: "Is glucose > 140?" → If yes: "Predict Diabetes." This mimics the flowchart-style clinical decision pathways common in medicine.

**Tag**: ML

---

### F1 Score

**Definition**: The harmonic mean of Precision and Sensitivity (Recall), combining both into a single metric. Ranges from 0 (worst) to 1 (best). Particularly useful when class imbalance exists.

**Formula**: F1 = 2 × (Precision × Sensitivity) / (Precision + Sensitivity)

**Clinical Example**: An F1 score of 0.78 for a cancer detection model means the model achieves a good balance between not missing cancers (sensitivity) and not raising false alarms (precision). Neither metric can be ignored at the expense of the other.

**Tag**: Statistics, ML

---

### Feature

**Definition**: An individual measurable property of a patient used as input to a machine learning model. Features are the variables the model uses to make its prediction.

**Clinical Example**: In a heart disease model, age, blood pressure, cholesterol level, chest pain type, and resting ECG result are all features. Each represents one piece of clinical information about the patient.

**Tag**: ML, Clinical

---

### Feature Importance

**Definition**: A ranking that indicates how much each feature contributes to a model's predictions. Higher importance means the feature has more influence on the model's output.

**Clinical Example**: If a model predicts kidney disease and serum creatinine has the highest feature importance, it means creatinine level is the most influential factor in the model's decisions — consistent with its known clinical significance as the primary GFR surrogate.

**Tag**: ML

---

### Imputation

**Definition**: The process of filling in missing values in a dataset with estimated values, rather than discarding rows with missing data. Common methods include replacing missing values with the column mean, median, or most frequent value.

**Clinical Example**: If a patient record is missing a cholesterol value, median imputation replaces it with the median cholesterol from all other patients — similar to a clinician assuming a typical value when a specific test result is unavailable.

**Tag**: Statistics, ML

---

### K-Nearest Neighbours (KNN)

**Definition**: A simple ML algorithm that classifies a new patient by finding the K most similar patients in the training data (its "neighbours") and predicting the same outcome as the majority of those neighbours.

**Clinical Example**: To classify a new patient's chest X-ray, KNN finds the 5 most similar previous patients based on their X-ray features. If 4 of those 5 had pneumonia, KNN predicts pneumonia for the new patient.

**Tag**: ML

---

### Logistic Regression

**Definition**: Despite its name, a classification (not regression) algorithm that estimates the probability of a binary outcome. It fits a mathematical curve to the training data that maps feature values to a probability between 0 and 1.

**Clinical Example**: A logistic regression model for diabetes might output "73% probability of diabetes onset within 5 years" based on a patient's glucose, BMI, and age. The clinician can then decide on an intervention threshold (e.g., probability > 50% triggers lifestyle counselling).

**Tag**: ML, Statistics

---

### Min-Max Scaling (Min-Max Normalisation)

**Definition**: A normalisation technique that transforms all feature values to fall within the range [0, 1]. The minimum value in the training set maps to 0, the maximum maps to 1.

**Formula**: scaled = (value - min) / (max - min)

**Clinical Example**: If the cholesterol range in the training set is 126-564 mg/dL, a value of 250 mg/dL becomes (250 - 126) / (564 - 126) = 0.283 after min-max scaling.

**Tag**: Statistics, ML

---

### Naive Bayes

**Definition**: A probabilistic classification algorithm based on Bayes' theorem that assumes all features are statistically independent of each other (the "naive" assumption). Despite this simplification, it performs well on many real-world datasets.

**Clinical Example**: Naive Bayes for pneumonia diagnosis would separately calculate the probability of having pneumonia given each symptom (fever, cough, opacity score) and then combine these probabilities as if the symptoms were independent — a simplification that works surprisingly well in practice.

**Tag**: ML, Statistics

---

### Normalisation

**Definition**: The process of transforming feature values to a common scale so that no single feature dominates the model training simply because it has larger numerical values. Without normalisation, a feature measured in thousands (e.g., white blood cell count) would numerically overwhelm a feature measured in units (e.g., albumin).

**Clinical Example**: Scaling both blood pressure (80-180 mmHg) and haemoglobin (5-20 g/dL) to the same [0, 1] range ensures the model treats each feature's relative variation equally, not its absolute magnitude.

**Tag**: Statistics, ML

---

### Overfitting

**Definition**: A condition where a model learns the training data too precisely — including its noise and random fluctuations — and performs well on training data but poorly on new, unseen patients. An overfitted model has "memorised" rather than "learned."

**Clinical Example**: A model that achieves 99% accuracy on its training patients but only 65% on new patients has overfitted. It has learned the specific peculiarities of the training cohort rather than the general clinical patterns that generalise to new patients.

**Tag**: ML

---

### Precision

**Definition**: Of all patients the model predicted to be positive, what fraction actually had the condition? Precision = TP / (TP + FP). High precision means few false alarms.

**Clinical Example**: In cancer screening, a model with 90% precision means that 9 out of every 10 patients flagged for biopsy actually have cancer, and only 1 is an unnecessary procedure (false positive).

**Tag**: Statistics, ML

---

### Random Forest

**Definition**: An ensemble ML method that builds many Decision Trees on random subsets of the training data and aggregates their predictions by majority vote. This reduces the variance of any individual tree and typically achieves better performance than a single Decision Tree.

**Clinical Example**: A Random Forest for liver disease diagnosis combines the opinions of 100 different "specialist" decision trees, each trained on a different subset of patient data and features, and takes a majority vote — similar to consulting a panel of specialists and going with the consensus.

**Tag**: ML

---

### ROC Curve (Receiver Operating Characteristic Curve)

**Definition**: A graph that shows the trade-off between Sensitivity (True Positive Rate) and 1-Specificity (False Positive Rate) at all possible classification thresholds. A curve that bows toward the upper-left corner indicates a good model.

**Clinical Example**: The ROC curve for a sepsis prediction model shows that at the threshold giving 80% sensitivity (catching 80% of sepsis cases), the model will also falsely flag 25% of non-sepsis patients. Clinicians can choose the threshold that matches their acceptable false-alarm rate.

**Tag**: Statistics, ML

---

### Sensitivity (Recall)

**Definition**: Of all patients who actually have the condition, what fraction did the model correctly identify? Sensitivity = TP / (TP + FN). Also called Recall or True Positive Rate. High sensitivity means few missed diagnoses.

**Clinical Example**: A cancer screening model with 95% sensitivity correctly identifies 95% of patients with cancer. The remaining 5% are false negatives — missed cancers. In life-threatening conditions, maximising sensitivity is typically the priority.

**Tag**: Statistics, Clinical

---

### SHAP (SHapley Additive exPlanations)

**Definition**: A method from cooperative game theory that explains individual model predictions by calculating each feature's contribution to that specific prediction. SHAP values show not just which features matter globally, but why the model made a particular decision for a particular patient.

**Clinical Example**: For a patient predicted to have high sepsis risk, SHAP might show: elevated lactate (+2.3 risk contribution), high temperature (+1.8), low blood pressure (+1.5), young age (-0.7). This tells the clinician exactly which factors drove the high-risk prediction for this specific patient.

**Tag**: ML

---

### SMOTE (Synthetic Minority Oversampling Technique)

**Definition**: A technique that addresses class imbalance by creating synthetic (artificial) examples of the minority class. SMOTE interpolates between real minority-class patients to generate new plausible examples, balancing the training dataset without simply duplicating existing records.

**Clinical Example**: If only 5% of patients in the training set have sepsis, SMOTE generates synthetic sepsis patients by interpolating between real sepsis patients' feature values. This prevents the model from becoming biased toward predicting "no sepsis" for everyone.

**Tag**: ML, Statistics

---

### Specificity

**Definition**: Of all patients who do not have the condition, what fraction did the model correctly identify as negative? Specificity = TN / (TN + FP). Also called True Negative Rate. High specificity means few false alarms.

**Clinical Example**: A model with 90% specificity for heart disease correctly clears 90% of healthy patients. The remaining 10% are false positives — healthy patients unnecessarily referred for further cardiac workup. In high-cost or high-risk interventions, high specificity is prioritised.

**Tag**: Statistics, Clinical

---

### Support Vector Machine (SVM)

**Definition**: A classification algorithm that finds the optimal boundary (hyperplane) in the feature space that maximally separates the two classes. The boundary is positioned to maximise the distance (margin) from the nearest training examples of each class.

**Clinical Example**: For binary breast cancer classification, SVM finds the mathematical boundary in 30-dimensional feature space that best separates malignant from benign cell nuclei. The boundary is determined by the most ambiguous cases (the "support vectors") — analogous to identifying the patients whose diagnosis is most borderline.

**Tag**: ML

---

### Target Variable

**Definition**: The outcome the ML model is trying to predict. In supervised learning, target values are known for the training data and used to teach the model. Also called the dependent variable, label, or outcome variable.

**Clinical Example**: In a diabetes prediction model, the target variable is "Outcome" (0 = no diabetes, 1 = diabetes). The model learns to predict this value from the input features (glucose, BMI, age, etc.).

**Tag**: ML, Clinical

---

### Test Data

**Definition**: The portion of the dataset set aside before model training to evaluate the model's performance on patients it has never seen. Test data must not be used during training or model selection.

**Clinical Example**: If a model is trained on 80% of the cardiology dataset (242 patients), the remaining 20% (61 patients) form the test set. The model's accuracy on these 61 "new" patients is a realistic estimate of how well it would perform in clinical practice.

**Tag**: ML

---

### Training Data

**Definition**: The portion of the dataset used to teach the ML model. The model adjusts its internal parameters by repeatedly comparing its predictions on training data with the known correct answers.

**Clinical Example**: In a heart disease model trained on 242 patients, the model learns associations between features like cholesterol, age, and chest pain type with the known outcome (heart disease present/absent) for those 242 patients.

**Tag**: ML

---

### Underfitting

**Definition**: A condition where a model is too simple to capture the patterns in the data, resulting in poor performance on both training data and new patients. An underfitted model has learned too little from the training data.

**Clinical Example**: A logistic regression model that uses only age as a feature for sepsis prediction would underfit — sepsis is determined by a complex combination of vital signs, lab values, and clinical context that a single-feature model cannot capture.

**Tag**: ML

---

### Z-Score (Standardisation)

**Definition**: A normalisation technique that transforms feature values by subtracting the mean and dividing by the standard deviation. The result has a mean of 0 and a standard deviation of 1. Allows direct comparison of features measured on different scales.

**Formula**: z = (value - mean) / standard_deviation

**Clinical Example**: A patient's cholesterol of 250 mg/dL becomes a z-score of (250 - 200) / 50 = +1.0 if the training set mean is 200 and standard deviation is 50. This means the patient is 1 standard deviation above the mean — making the value directly comparable to, say, age expressed in standard deviations.

**Tag**: Statistics, ML
