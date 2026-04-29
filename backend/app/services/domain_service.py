"""Clinical domain registry for MedVix.

Defines all 20 clinical domains with realistic metadata, feature
descriptions, dataset provenance, and clinical context.  Each domain
maps to a built-in CSV in ``backend/data/``.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from app.models.domain import DomainDetail, DomainListResponse, DomainSummary

# ---------------------------------------------------------------------------
# Domain catalogue — each entry is a complete DomainDetail
# ---------------------------------------------------------------------------

_DOMAINS: Dict[str, DomainDetail] = {}


def _register(d: DomainDetail) -> None:
    """Handle  register."""
    _DOMAINS[d.id] = d


# -----------------------------------------------------------------------
# 1. Cardiology — Heart Disease
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="cardiology",
        name="Heart Disease",
        icon="\u2764\ufe0f",
        short_description="Predict the presence of heart disease from clinical and test results.",
        dataset_name="heart",
        target_variable="target",
        problem_type="binary",
        clinical_question="Does this patient have significant coronary artery disease?",
        why_it_matters=(
            "Cardiovascular disease is the leading cause of death worldwide, "
            "accounting for roughly 17.9 million deaths per year. Early "
            "identification allows timely intervention with medication, "
            "lifestyle changes, or surgical procedures."
        ),
        patient_population="Adults aged 29-77 undergoing cardiac evaluation",
        ai_limitation_note=(
            "AI predictions cannot replace angiography or stress testing. "
            "Results should be used as a screening aid, not a definitive diagnosis."
        ),
        feature_names=[
            "age", "sex", "cp", "trestbps", "chol", "fbs",
            "restecg", "thalach", "exang", "oldpeak", "slope",
            "ca", "thal",
        ],
        feature_descriptions={
            "age": "Patient age in years",
            "sex": "Biological sex (1 = male, 0 = female)",
            "cp": "Chest pain type (0-3: typical angina, atypical angina, non-anginal, asymptomatic)",
            "trestbps": "Resting blood pressure in mm Hg on admission",
            "chol": "Serum cholesterol in mg/dL",
            "fbs": "Fasting blood sugar > 120 mg/dL (1 = true, 0 = false)",
            "restecg": "Resting ECG results (0 = normal, 1 = ST-T abnormality, 2 = LV hypertrophy)",
            "thalach": "Maximum heart rate achieved during exercise test",
            "exang": "Exercise-induced angina (1 = yes, 0 = no)",
            "oldpeak": "ST depression induced by exercise relative to rest",
            "slope": "Slope of the peak exercise ST segment (0-2)",
            "ca": "Number of major vessels colored by fluoroscopy (0-3)",
            "thal": "Thalassemia type (1 = normal, 2 = fixed defect, 3 = reversible defect)",
        },
        target_classes=["0", "1"],
        data_source="https://www.kaggle.com/datasets/johnsmith88/heart-disease-dataset",
        dataset_rows=303,
        dataset_features=13,
        positive_rate="~54%",
        sense_check_text=(
            "The top features (chest pain type, maximum heart rate, ST depression) "
            "align with established cardiology literature. Exercise-related variables "
            "are expected top predictors because coronary artery disease directly "
            "affects cardiac response to physical stress."
        ),
        subgroup_columns={
            "sex_column": "sex",
            "sex_male_value": 1,
            "age_column": "age",
            "age_threshold": 60,
        },
        population_stats={
            "male": 0.68,
            "female": 0.32,
            "age_under_threshold": 0.45,
            "age_over_threshold": 0.55,
        },
    )
)

# -----------------------------------------------------------------------
# 2. Radiology — Chest X-Ray (Pneumonia)
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="radiology",
        name="Chest X-Ray (Pneumonia)",
        icon="\U0001fa7b",
        short_description="Classify chest X-ray tabular features as Normal or Pneumonia.",
        dataset_name="chest_xray",
        target_variable="label",
        problem_type="binary",
        clinical_question="Does this chest X-ray indicate pneumonia?",
        why_it_matters=(
            "Pneumonia is a leading cause of hospitalisation and death, "
            "especially in children and the elderly. Rapid, accurate "
            "identification from imaging data can accelerate treatment "
            "and reduce mortality."
        ),
        patient_population="Paediatric and adult patients presenting with respiratory symptoms",
        ai_limitation_note=(
            "Tabular features extracted from X-ray images are lossy. "
            "AI cannot replace radiologist interpretation of the full image."
        ),
        feature_names=[
            "mean_pixel_value", "std_pixel_value", "skewness",
            "kurtosis", "entropy", "contrast", "energy",
            "homogeneity", "lung_area_ratio", "opacity_score",
        ],
        feature_descriptions={
            "mean_pixel_value": "Average pixel intensity across the lung region",
            "std_pixel_value": "Standard deviation of pixel intensities",
            "skewness": "Skewness of the pixel intensity distribution",
            "kurtosis": "Kurtosis of the pixel intensity distribution",
            "entropy": "Shannon entropy of the image texture",
            "contrast": "GLCM contrast measuring local intensity variation",
            "energy": "GLCM energy (angular second moment)",
            "homogeneity": "GLCM homogeneity of the texture",
            "lung_area_ratio": "Ratio of segmented lung area to total thorax area",
            "opacity_score": "Computed opacity density score in lung fields",
        },
        target_classes=["Normal", "Pneumonia"],
        data_source="https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia",
        dataset_rows=5856,
        dataset_features=10,
        positive_rate="~75%",
        sense_check_text=(
            "Opacity score and contrast features are expected top predictors as "
            "pneumonia manifests as visible opacities in lung fields. Texture-based "
            "features capture the characteristic patterns of consolidation."
        ),
        subgroup_columns=None,
        population_stats=None,
    )
)

# -----------------------------------------------------------------------
# 3. Nephrology — Chronic Kidney Disease
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="nephrology",
        name="Chronic Kidney Disease",
        icon="\U0001fac0",
        short_description="Predict chronic kidney disease from blood and urine markers.",
        dataset_name="kidney_disease",
        target_variable="classification",
        problem_type="binary",
        clinical_question="Does this patient have chronic kidney disease?",
        why_it_matters=(
            "CKD affects approximately 10% of the global population and "
            "often progresses silently until advanced stages. Early "
            "detection enables interventions that slow progression and "
            "prevent the need for dialysis."
        ),
        patient_population="Adults undergoing routine or targeted renal screening",
        ai_limitation_note=(
            "AI cannot determine the specific CKD stage or underlying "
            "aetiology. Biopsy and GFR estimation remain essential for staging."
        ),
        feature_names=[
            "age", "bp", "sg", "al", "su", "rbc", "pc",
            "pcc", "ba", "bgr", "bu", "sc", "sod", "pot",
            "hemo", "pcv", "wc", "rc", "htn", "dm", "cad",
            "appet", "pe", "ane",
        ],
        feature_descriptions={
            "age": "Patient age in years",
            "bp": "Blood pressure in mm Hg",
            "sg": "Urine specific gravity",
            "al": "Albumin level in urine (0-5)",
            "su": "Sugar level in urine (0-5)",
            "rbc": "Red blood cells in urine (normal/abnormal)",
            "pc": "Pus cell in urine (normal/abnormal)",
            "pcc": "Pus cell clumps (present/not present)",
            "ba": "Bacteria in urine (present/not present)",
            "bgr": "Blood glucose random in mg/dL",
            "bu": "Blood urea in mg/dL",
            "sc": "Serum creatinine in mg/dL",
            "sod": "Sodium in mEq/L",
            "pot": "Potassium in mEq/L",
            "hemo": "Haemoglobin in g/dL",
            "pcv": "Packed cell volume (%)",
            "wc": "White blood cell count (cells/cumm)",
            "rc": "Red blood cell count (millions/cumm)",
            "htn": "Hypertension (yes/no)",
            "dm": "Diabetes mellitus (yes/no)",
            "cad": "Coronary artery disease (yes/no)",
            "appet": "Appetite (good/poor)",
            "pe": "Pedal oedema (yes/no)",
            "ane": "Anaemia (yes/no)",
        },
        target_classes=["ckd", "notckd"],
        data_source="https://archive.ics.uci.edu/ml/datasets/chronic_kidney_disease",
        dataset_rows=400,
        dataset_features=24,
        positive_rate="~62%",
        sense_check_text=(
            "Serum creatinine, blood urea, and haemoglobin are clinically validated "
            "markers of kidney function. Elevated creatinine and urea indicate "
            "impaired filtration, while low haemoglobin reflects reduced "
            "erythropoietin production in CKD."
        ),
        subgroup_columns={
            "age_column": "age",
            "age_threshold": 60,
        },
        population_stats={
            "age_under_threshold": 0.40,
            "age_over_threshold": 0.60,
        },
    )
)

# -----------------------------------------------------------------------
# 4. Oncology — Breast Cancer
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="oncology-breast",
        name="Breast Cancer",
        icon="\U0001f397\ufe0f",
        short_description="Classify breast tumours as malignant or benign from cell nuclei measurements.",
        dataset_name="breast_cancer",
        target_variable="diagnosis",
        problem_type="binary",
        clinical_question="Is this breast mass malignant or benign?",
        why_it_matters=(
            "Breast cancer is the most common cancer in women worldwide. "
            "Distinguishing malignant from benign masses early reduces "
            "unnecessary biopsies and enables timely treatment."
        ),
        patient_population="Women with suspicious breast masses detected via imaging or physical exam",
        ai_limitation_note=(
            "AI predictions based on FNA features do not replace "
            "histopathological examination. All suspected malignancies "
            "require biopsy confirmation."
        ),
        feature_names=[
            "radius_mean", "texture_mean", "perimeter_mean",
            "area_mean", "smoothness_mean", "compactness_mean",
            "concavity_mean", "concave_points_mean",
            "symmetry_mean", "fractal_dimension_mean",
        ],
        feature_descriptions={
            "radius_mean": "Mean of distances from centre to points on the cell nucleus perimeter",
            "texture_mean": "Standard deviation of grey-scale values in the cell image",
            "perimeter_mean": "Mean perimeter of the cell nucleus",
            "area_mean": "Mean area of the cell nucleus",
            "smoothness_mean": "Mean local variation in radius lengths",
            "compactness_mean": "Mean of (perimeter^2 / area - 1.0)",
            "concavity_mean": "Mean severity of concave portions of the contour",
            "concave_points_mean": "Mean number of concave portions of the contour",
            "symmetry_mean": "Mean symmetry of the cell nucleus",
            "fractal_dimension_mean": "Mean coastline approximation (fractal dimension)",
        },
        target_classes=["M", "B"],
        data_source="https://www.kaggle.com/datasets/uciml/breast-cancer-wisconsin-data",
        dataset_rows=569,
        dataset_features=30,
        positive_rate="~37% malignant",
        sense_check_text=(
            "Concavity, concave points, and perimeter are well-established markers "
            "of malignancy. Irregular cell boundaries and larger nuclei are hallmarks "
            "of aggressive tumour growth seen in histopathology."
        ),
        subgroup_columns=None,
        population_stats=None,
    )
)

# -----------------------------------------------------------------------
# 5. Neurology — Parkinson's Disease
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="neurology",
        name="Parkinson's Disease",
        icon="\U0001f9e0",
        short_description="Detect Parkinson's disease from voice biomarkers.",
        dataset_name="parkinsons",
        target_variable="status",
        problem_type="binary",
        clinical_question="Does this patient's voice pattern indicate Parkinson's disease?",
        why_it_matters=(
            "Parkinson's affects over 10 million people globally and is "
            "often diagnosed late. Voice analysis offers a non-invasive "
            "screening method that can flag at-risk individuals for "
            "neurological evaluation."
        ),
        patient_population="Adults presenting with motor or voice changes suggestive of neurodegeneration",
        ai_limitation_note=(
            "Voice biomarkers alone cannot confirm Parkinson's. Clinical "
            "examination, DaTscan, and longitudinal assessment are required "
            "for definitive diagnosis."
        ),
        feature_names=[
            "MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)",
            "MDVP:Jitter(%)", "MDVP:Jitter(Abs)", "MDVP:RAP",
            "MDVP:PPQ", "Jitter:DDP", "MDVP:Shimmer",
            "MDVP:Shimmer(dB)", "Shimmer:APQ3", "Shimmer:APQ5",
            "MDVP:APQ", "Shimmer:DDA", "NHR", "HNR",
            "RPDE", "DFA", "spread1", "spread2", "D2", "PPE",
        ],
        feature_descriptions={
            "MDVP:Fo(Hz)": "Average vocal fundamental frequency",
            "MDVP:Fhi(Hz)": "Maximum vocal fundamental frequency",
            "MDVP:Flo(Hz)": "Minimum vocal fundamental frequency",
            "MDVP:Jitter(%)": "Percentage variation in fundamental frequency",
            "MDVP:Jitter(Abs)": "Absolute jitter in microseconds",
            "MDVP:RAP": "Relative amplitude perturbation",
            "MDVP:PPQ": "Five-point period perturbation quotient",
            "Jitter:DDP": "Average absolute difference of differences between jitter cycles",
            "MDVP:Shimmer": "Variation in amplitude",
            "MDVP:Shimmer(dB)": "Variation in amplitude in decibels",
            "Shimmer:APQ3": "Three-point amplitude perturbation quotient",
            "Shimmer:APQ5": "Five-point amplitude perturbation quotient",
            "MDVP:APQ": "Eleven-point amplitude perturbation quotient",
            "Shimmer:DDA": "Average absolute difference between consecutive shimmer differences",
            "NHR": "Noise-to-harmonics ratio",
            "HNR": "Harmonics-to-noise ratio",
            "RPDE": "Recurrence period density entropy",
            "DFA": "Detrended fluctuation analysis signal fractal scaling exponent",
            "spread1": "Nonlinear measure of fundamental frequency variation",
            "spread2": "Nonlinear measure of fundamental frequency variation",
            "D2": "Correlation dimension (nonlinear dynamical complexity)",
            "PPE": "Pitch period entropy",
        },
        target_classes=["0", "1"],
        data_source="https://archive.ics.uci.edu/ml/datasets/parkinsons",
        dataset_rows=195,
        dataset_features=22,
        positive_rate="~75% Parkinson's",
        sense_check_text=(
            "Jitter and shimmer measures (vocal instability) are clinically "
            "established biomarkers of Parkinson's. The disease affects laryngeal "
            "muscle control, causing measurable changes in voice frequency and "
            "amplitude variation."
        ),
        subgroup_columns=None,
        population_stats=None,
    )
)

# -----------------------------------------------------------------------
# 6. Endocrinology — Diabetes
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="endocrinology",
        name="Diabetes",
        icon="\U0001fa78",
        short_description="Predict diabetes onset from metabolic and demographic indicators.",
        dataset_name="diabetes",
        target_variable="Outcome",
        problem_type="binary",
        clinical_question="Is this patient likely to develop diabetes within five years?",
        why_it_matters=(
            "Type 2 diabetes affects over 450 million people and is a "
            "major driver of cardiovascular disease, kidney failure, and "
            "blindness. Early prediction enables lifestyle interventions "
            "that can delay or prevent onset."
        ),
        patient_population="Females of Pima Indian heritage aged 21+",
        ai_limitation_note=(
            "This model is trained on a specific demographic and may not "
            "generalise to other populations. HbA1c and OGTT remain the "
            "gold standard for diabetes diagnosis."
        ),
        feature_names=[
            "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age",
        ],
        feature_descriptions={
            "Pregnancies": "Number of times pregnant",
            "Glucose": "Plasma glucose concentration at 2 hours in an OGTT (mg/dL)",
            "BloodPressure": "Diastolic blood pressure (mm Hg)",
            "SkinThickness": "Triceps skin fold thickness (mm)",
            "Insulin": "2-hour serum insulin (mu U/mL)",
            "BMI": "Body mass index (kg/m^2)",
            "DiabetesPedigreeFunction": "Diabetes pedigree function (genetic risk score)",
            "Age": "Patient age in years",
        },
        target_classes=["0", "1"],
        data_source="https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database",
        dataset_rows=768,
        dataset_features=8,
        positive_rate="~35%",
        sense_check_text=(
            "Glucose level and BMI are the strongest predictors, consistent with "
            "the pathophysiology of type 2 diabetes. Insulin resistance directly "
            "correlates with blood glucose levels and adiposity."
        ),
        subgroup_columns={
            "age_column": "Age",
            "age_threshold": 35,
        },
        population_stats={
            "age_under_threshold": 0.55,
            "age_over_threshold": 0.45,
        },
    )
)

# -----------------------------------------------------------------------
# 7. Hepatology — Liver Disease
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="hepatology",
        name="Liver Disease",
        icon="\U0001fac1",
        short_description="Predict liver disease from blood chemistry and demographics.",
        dataset_name="liver",
        target_variable="Dataset",
        problem_type="binary",
        clinical_question="Does this patient have liver disease based on blood tests?",
        why_it_matters=(
            "Liver disease often presents asymptomatically until advanced "
            "stages. Routine blood-test screening can catch early liver "
            "dysfunction, enabling dietary and pharmacological intervention "
            "before irreversible damage occurs."
        ),
        patient_population="Adults aged 12-90 with suspected hepatic dysfunction",
        ai_limitation_note=(
            "Blood chemistry alone cannot differentiate between liver "
            "disease aetiologies (viral, alcoholic, NAFLD). Imaging and "
            "biopsy remain necessary for definitive diagnosis."
        ),
        feature_names=[
            "Age", "Gender", "Total_Bilirubin", "Direct_Bilirubin",
            "Alkaline_Phosphotase", "Alamine_Aminotransferase",
            "Aspartate_Aminotransferase", "Total_Protiens",
            "Albumin", "Albumin_and_Globulin_Ratio",
        ],
        feature_descriptions={
            "Age": "Patient age in years",
            "Gender": "Biological sex (Male/Female)",
            "Total_Bilirubin": "Total bilirubin in mg/dL",
            "Direct_Bilirubin": "Conjugated (direct) bilirubin in mg/dL",
            "Alkaline_Phosphotase": "Alkaline phosphatase enzyme level (IU/L)",
            "Alamine_Aminotransferase": "ALT enzyme level (IU/L)",
            "Aspartate_Aminotransferase": "AST enzyme level (IU/L)",
            "Total_Protiens": "Total serum protein in g/dL",
            "Albumin": "Serum albumin in g/dL",
            "Albumin_and_Globulin_Ratio": "Ratio of albumin to globulin",
        },
        target_classes=["1", "2"],
        data_source="https://www.kaggle.com/datasets/uciml/indian-liver-patient-records",
        dataset_rows=583,
        dataset_features=10,
        positive_rate="~71% liver disease",
        sense_check_text=(
            "Liver enzymes (ALT, AST) and bilirubin levels are standard clinical "
            "markers of hepatic damage. Elevated transaminases indicate hepatocyte "
            "injury, while bilirubin reflects impaired liver metabolism."
        ),
        subgroup_columns={
            "sex_column": "Gender",
            "sex_male_value": 1,
            "age_column": "Age",
            "age_threshold": 50,
        },
        population_stats={
            "male": 0.72,
            "female": 0.28,
            "age_under_threshold": 0.60,
            "age_over_threshold": 0.40,
        },
    )
)

# -----------------------------------------------------------------------
# 8. Cardiology — Stroke
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="cardiology-stroke",
        name="Stroke Prediction",
        icon="\U0001f9e9",
        short_description="Predict stroke risk from lifestyle and clinical factors.",
        dataset_name="stroke",
        target_variable="stroke",
        problem_type="binary",
        clinical_question="Is this patient at elevated risk of stroke?",
        why_it_matters=(
            "Stroke is the second leading cause of death globally and a "
            "major cause of long-term disability. Identifying high-risk "
            "patients enables preventive measures such as blood pressure "
            "management and anticoagulation therapy."
        ),
        patient_population="Adults with mixed demographic and clinical backgrounds",
        ai_limitation_note=(
            "Stroke prediction models have limited sensitivity for rare "
            "events. A low-risk prediction does not rule out stroke; "
            "clinical judgement and imaging remain essential."
        ),
        feature_names=[
            "gender", "age", "hypertension", "heart_disease",
            "ever_married", "work_type", "Residence_type",
            "avg_glucose_level", "bmi", "smoking_status",
        ],
        feature_descriptions={
            "gender": "Patient gender (Male/Female/Other)",
            "age": "Patient age in years",
            "hypertension": "History of hypertension (0/1)",
            "heart_disease": "History of heart disease (0/1)",
            "ever_married": "Marital status (Yes/No)",
            "work_type": "Type of employment (Private/Self-employed/Govt/Children/Never worked)",
            "Residence_type": "Residence type (Urban/Rural)",
            "avg_glucose_level": "Average blood glucose level (mg/dL)",
            "bmi": "Body mass index (kg/m^2)",
            "smoking_status": "Smoking status (never/formerly/smokes/unknown)",
        },
        target_classes=["0", "1"],
        data_source="https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset",
        dataset_rows=5110,
        dataset_features=10,
        positive_rate="~5%",
        sense_check_text=(
            "Age and hypertension are the strongest stroke predictors, consistent "
            "with epidemiological evidence. Stroke risk doubles each decade after "
            "age 55, and hypertension is the single most modifiable risk factor."
        ),
        subgroup_columns={
            "sex_column": "gender",
            "sex_male_value": 1,
            "age_column": "age",
            "age_threshold": 65,
        },
        population_stats={
            "male": 0.49,
            "female": 0.51,
            "age_under_threshold": 0.75,
            "age_over_threshold": 0.25,
        },
    )
)

# -----------------------------------------------------------------------
# 9. Mental Health — Depression
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="mental-health",
        name="Depression Screening",
        icon="\U0001f9d1\u200d\u2695\ufe0f",
        short_description="Predict whether a patient is likely to seek treatment for depression.",
        dataset_name="depression",
        target_variable="treatment",
        problem_type="binary",
        clinical_question="Is this individual likely to seek treatment for depression?",
        why_it_matters=(
            "Depression is one of the leading causes of disability worldwide, "
            "yet the majority of sufferers do not receive treatment. "
            "Predictive screening can help direct outreach and resources "
            "to those most in need."
        ),
        patient_population="Adults completing mental health surveys in workplace settings",
        ai_limitation_note=(
            "AI cannot diagnose depression or assess suicide risk. "
            "Treatment-seeking prediction is a proxy and must not replace "
            "clinical psychiatric evaluation."
        ),
        feature_names=[
            "Age", "Gender", "family_history", "work_interfere",
            "no_employees", "remote_work", "tech_company",
            "benefits", "care_options", "wellness_program",
            "seek_help", "anonymity", "leave",
        ],
        feature_descriptions={
            "Age": "Respondent age in years",
            "Gender": "Self-reported gender",
            "family_history": "Family history of mental illness (Yes/No)",
            "work_interfere": "Does mental health interfere with work? (Never/Rarely/Sometimes/Often)",
            "no_employees": "Company size bracket",
            "remote_work": "Works remotely (Yes/No)",
            "tech_company": "Works in a tech company (Yes/No)",
            "benefits": "Employer provides mental health benefits (Yes/No/Don't know)",
            "care_options": "Awareness of employer care options (Yes/No/Not sure)",
            "wellness_program": "Employer offers a wellness programme (Yes/No/Don't know)",
            "seek_help": "Employer provides mental health resources (Yes/No/Don't know)",
            "anonymity": "Anonymity of mental health support is protected (Yes/No/Don't know)",
            "leave": "Ease of taking medical leave (Very easy to Very difficult)",
        },
        target_classes=["Yes", "No"],
        data_source="https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey",
        dataset_rows=1259,
        dataset_features=13,
        positive_rate="~50%",
        sense_check_text=(
            "Stress level, sleep hours, and social support are well-documented "
            "risk factors for depression. Poor sleep and chronic stress dysregulate "
            "the HPA axis, while social isolation reduces protective buffers."
        ),
        subgroup_columns={
            "sex_column": "Gender",
            "sex_male_value": 1,
            "age_column": "Age",
            "age_threshold": 40,
        },
        population_stats={
            "male": 0.48,
            "female": 0.52,
            "age_under_threshold": 0.60,
            "age_over_threshold": 0.40,
        },
    )
)

# -----------------------------------------------------------------------
# 10. Pulmonology — COPD / Framingham
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="pulmonology",
        name="COPD / Pulmonary Risk",
        icon="\U0001fac1",
        short_description="Predict 10-year coronary heart disease risk from pulmonary and cardiac risk factors.",
        dataset_name="framingham",
        target_variable="TenYearCHD",
        problem_type="binary",
        clinical_question="Is this patient at high risk for coronary heart disease within ten years?",
        why_it_matters=(
            "COPD patients face significantly elevated cardiovascular risk. "
            "The Framingham risk factors, combined with pulmonary indicators, "
            "enable early identification of patients who may benefit from "
            "aggressive risk-factor modification."
        ),
        patient_population="Adults aged 32-70 from the Framingham Heart Study cohort",
        ai_limitation_note=(
            "This model predicts a 10-year risk probability and cannot "
            "diagnose COPD or CHD. Pulmonary function tests and cardiac "
            "workup are required for clinical decisions."
        ),
        feature_names=[
            "male", "age", "education", "currentSmoker",
            "cigsPerDay", "BPMeds", "prevalentStroke",
            "prevalentHyp", "diabetes", "totChol", "sysBP",
            "diaBP", "BMI", "heartRate", "glucose",
        ],
        feature_descriptions={
            "male": "Biological sex (1 = male, 0 = female)",
            "age": "Patient age in years",
            "education": "Education level (1-4 ordinal)",
            "currentSmoker": "Current smoker (0/1)",
            "cigsPerDay": "Cigarettes smoked per day",
            "BPMeds": "Currently on blood pressure medication (0/1)",
            "prevalentStroke": "History of stroke (0/1)",
            "prevalentHyp": "History of hypertension (0/1)",
            "diabetes": "Diabetes diagnosis (0/1)",
            "totChol": "Total cholesterol (mg/dL)",
            "sysBP": "Systolic blood pressure (mm Hg)",
            "diaBP": "Diastolic blood pressure (mm Hg)",
            "BMI": "Body mass index (kg/m^2)",
            "heartRate": "Resting heart rate (bpm)",
            "glucose": "Fasting blood glucose (mg/dL)",
        },
        target_classes=["0", "1"],
        data_source="https://www.kaggle.com/datasets/dileep070/heart-disease-prediction-using-logistic-regression",
        dataset_rows=4238,
        dataset_features=15,
        positive_rate="~15%",
        sense_check_text=(
            "Smoking status and cigarettes per day are the dominant COPD predictors, "
            "reflecting the established causal link between tobacco exposure and "
            "chronic obstructive pulmonary disease. Age compounds the damage over time."
        ),
        subgroup_columns={
            "sex_column": "male",
            "sex_male_value": 1,
            "age_column": "age",
            "age_threshold": 55,
        },
        population_stats={
            "male": 0.56,
            "female": 0.44,
            "age_under_threshold": 0.50,
            "age_over_threshold": 0.50,
        },
    )
)

# -----------------------------------------------------------------------
# 11. Haematology — Anaemia
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="haematology",
        name="Anaemia Detection",
        icon="\U0001fa78",
        short_description="Detect anaemia from complete blood count parameters.",
        dataset_name="anaemia",
        target_variable="Result",
        problem_type="binary",
        clinical_question="Does this patient's blood count indicate anaemia?",
        why_it_matters=(
            "Anaemia affects roughly a quarter of the global population "
            "and is especially prevalent in women and children. Automated "
            "screening from CBC results helps prioritise follow-up in "
            "resource-limited settings."
        ),
        patient_population="Patients undergoing routine complete blood count testing",
        ai_limitation_note=(
            "CBC-based screening cannot determine the underlying cause "
            "of anaemia (iron deficiency, B12, chronic disease, etc.). "
            "Further laboratory workup is essential."
        ),
        feature_names=[
            "Gender", "Hemoglobin", "MCH", "MCHC", "MCV",
        ],
        feature_descriptions={
            "Gender": "Biological sex (0 = Female, 1 = Male)",
            "Hemoglobin": "Haemoglobin concentration in g/dL",
            "MCH": "Mean corpuscular haemoglobin in pg",
            "MCHC": "Mean corpuscular haemoglobin concentration in g/dL",
            "MCV": "Mean corpuscular volume in fL",
        },
        target_classes=["0", "1"],
        data_source="https://www.kaggle.com/datasets/biswaranjanrao/anemia-dataset",
        dataset_rows=1421,
        dataset_features=5,
        positive_rate="~45%",
        sense_check_text=(
            "Haemoglobin, MCH, and MCV are the standard haematological indices "
            "for anaemia diagnosis. Low haemoglobin directly indicates anaemia, "
            "while MCH and MCV differentiate iron-deficiency from other types."
        ),
        subgroup_columns={
            "sex_column": "Gender",
            "sex_male_value": 1,
        },
        population_stats={
            "male": 0.45,
            "female": 0.55,
        },
    )
)

# -----------------------------------------------------------------------
# 12. Dermatology — Skin Diseases (multiclass)
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="dermatology",
        name="Skin Diseases",
        icon="\U0001f9b4",
        short_description="Classify dermatological conditions into six diagnostic categories.",
        dataset_name="dermatology",
        target_variable="class",
        problem_type="multiclass",
        clinical_question="Which of six erythemato-squamous diseases does this patient have?",
        why_it_matters=(
            "Erythemato-squamous diseases share overlapping clinical "
            "features, making differential diagnosis challenging even "
            "for experienced dermatologists. A decision-support tool can "
            "reduce diagnostic errors and unnecessary biopsies."
        ),
        patient_population="Patients presenting with erythemato-squamous skin lesions",
        ai_limitation_note=(
            "AI classification cannot replace histopathological examination. "
            "Biopsy remains the gold standard for confirming the specific "
            "skin disease subtype."
        ),
        feature_names=[
            "erythema", "scaling", "definite_borders", "itching",
            "koebner_phenomenon", "polygonal_papules",
            "follicular_papules", "oral_mucosal_involvement",
            "knee_elbow_involvement", "scalp_involvement",
            "family_history", "age",
        ],
        feature_descriptions={
            "erythema": "Degree of redness (0-3)",
            "scaling": "Degree of scaling (0-3)",
            "definite_borders": "Presence of definite borders (0-3)",
            "itching": "Severity of itching (0-3)",
            "koebner_phenomenon": "Koebner phenomenon (lesions at trauma sites) (0-3)",
            "polygonal_papules": "Presence of polygonal papules (0-3)",
            "follicular_papules": "Presence of follicular papules (0-3)",
            "oral_mucosal_involvement": "Oral mucosa involvement (0-3)",
            "knee_elbow_involvement": "Knee and elbow involvement (0-3)",
            "scalp_involvement": "Scalp involvement (0-3)",
            "family_history": "Family history of the disease (0/1)",
            "age": "Patient age in years",
        },
        target_classes=["1", "2", "3", "4", "5", "6"],
        data_source="https://archive.ics.uci.edu/ml/datasets/dermatology",
        dataset_rows=366,
        dataset_features=34,
        positive_rate=None,
        sense_check_text=(
            "Erythema, scaling patterns, and lesion border characteristics are "
            "primary diagnostic criteria in dermatology. The combination of specific "
            "papule types and distribution patterns differentiates skin conditions."
        ),
        subgroup_columns={
            "age_column": "age",
            "age_threshold": 40,
        },
        population_stats={
            "age_under_threshold": 0.55,
            "age_over_threshold": 0.45,
        },
    )
)

# -----------------------------------------------------------------------
# 13. Ophthalmology — Diabetic Retinopathy (multiclass)
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="ophthalmology",
        name="Diabetic Retinopathy",
        icon="\U0001f441\ufe0f",
        short_description="Grade diabetic retinopathy severity from retinal image features.",
        dataset_name="diabetic_retinopathy",
        target_variable="level",
        problem_type="multiclass",
        clinical_question="What is the severity grade of diabetic retinopathy in this patient?",
        why_it_matters=(
            "Diabetic retinopathy is the leading cause of blindness in "
            "working-age adults. Automated grading can enable mass screening "
            "in primary care, catching sight-threatening stages early enough "
            "for laser treatment or anti-VEGF therapy."
        ),
        patient_population="Diabetic patients undergoing retinal screening",
        ai_limitation_note=(
            "Automated grading from extracted features is approximate. "
            "Ophthalmoscopic examination and OCT imaging are required for "
            "treatment decisions."
        ),
        feature_names=[
            "quality", "pre_screening", "ma_detection_1",
            "ma_detection_2", "ma_detection_3", "ma_detection_4",
            "ma_detection_5", "ma_detection_6", "exudates_1",
            "exudates_2", "exudates_3", "exudates_4",
            "exudates_5", "exudates_6", "exudates_7",
            "macula_opticdisc_distance", "opticdisc_diameter",
            "am_fm_classification",
        ],
        feature_descriptions={
            "quality": "Quality assessment of the retinal image (0/1)",
            "pre_screening": "Pre-screening result (0/1)",
            "ma_detection_1": "Microaneurysm detection confidence at alpha 0.5",
            "ma_detection_2": "Microaneurysm detection confidence at alpha 0.6",
            "ma_detection_3": "Microaneurysm detection confidence at alpha 0.7",
            "ma_detection_4": "Microaneurysm detection confidence at alpha 0.8",
            "ma_detection_5": "Microaneurysm detection confidence at alpha 0.9",
            "ma_detection_6": "Microaneurysm detection confidence at alpha 1.0",
            "exudates_1": "Exudate detection at confidence level 1",
            "exudates_2": "Exudate detection at confidence level 2",
            "exudates_3": "Exudate detection at confidence level 3",
            "exudates_4": "Exudate detection at confidence level 4",
            "exudates_5": "Exudate detection at confidence level 5",
            "exudates_6": "Exudate detection at confidence level 6",
            "exudates_7": "Exudate detection at confidence level 7",
            "macula_opticdisc_distance": "Euclidean distance between macula and optic disc centres",
            "opticdisc_diameter": "Diameter of the optic disc in pixels",
            "am_fm_classification": "AM/FM-based classification result (0/1)",
        },
        target_classes=["0", "1", "2", "3", "4"],
        data_source="https://archive.ics.uci.edu/ml/datasets/Diabetic+Retinopathy+Debrecen+Data+Set",
        dataset_rows=1151,
        dataset_features=18,
        positive_rate=None,
        sense_check_text=(
            "Microaneurysm detection scores and exudate features directly correspond "
            "to clinical grading of diabetic retinopathy. These are the same "
            "pathological signs ophthalmologists assess during fundoscopic examination."
        ),
        subgroup_columns=None,
        population_stats=None,
    )
)

# -----------------------------------------------------------------------
# 14. Orthopaedics — Spine (Normal/Abnormal)
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="orthopaedics",
        name="Spine Condition",
        icon="\U0001f9b4",
        short_description="Classify spinal column conditions as normal or abnormal from biomechanical features.",
        dataset_name="spine",
        target_variable="class",
        problem_type="binary",
        clinical_question="Does this patient's biomechanical profile indicate a spinal abnormality?",
        why_it_matters=(
            "Lower back pain is one of the leading causes of disability. "
            "Biomechanical analysis of the spine can support early detection "
            "of disc herniation or spondylolisthesis, guiding referral for "
            "further imaging."
        ),
        patient_population="Patients presenting with lower back pain or suspected spinal pathology",
        ai_limitation_note=(
            "Biomechanical classification cannot identify the specific "
            "pathology (herniation vs. spondylolisthesis). MRI is required "
            "for a definitive structural diagnosis."
        ),
        feature_names=[
            "pelvic_incidence", "pelvic_tilt", "lumbar_lordosis_angle",
            "sacral_slope", "pelvic_radius", "degree_spondylolisthesis",
        ],
        feature_descriptions={
            "pelvic_incidence": "Pelvic incidence angle (degrees)",
            "pelvic_tilt": "Pelvic tilt angle (degrees)",
            "lumbar_lordosis_angle": "Lumbar lordosis angle (degrees)",
            "sacral_slope": "Sacral slope angle (degrees)",
            "pelvic_radius": "Pelvic radius (mm)",
            "degree_spondylolisthesis": "Degree of spondylolisthesis (mm)",
        },
        target_classes=["Normal", "Abnormal"],
        data_source="https://www.kaggle.com/datasets/uciml/biomechanical-features-of-orthopedic-patients",
        dataset_rows=310,
        dataset_features=6,
        positive_rate="~68% abnormal",
        sense_check_text=(
            "Pelvic incidence and degree of spondylolisthesis are the key "
            "biomechanical parameters used in spinal assessment. Higher pelvic "
            "incidence correlates with lumbar lordosis abnormalities and "
            "vertebral slippage."
        ),
        subgroup_columns=None,
        population_stats=None,
    )
)

# -----------------------------------------------------------------------
# 15. ICU / Sepsis
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="icu-sepsis",
        name="Sepsis Prediction",
        icon="\U0001f3e5",
        short_description="Predict sepsis onset in ICU patients from vital signs and lab values.",
        dataset_name="sepsis",
        target_variable="Sepsis",
        problem_type="binary",
        clinical_question="Is this ICU patient developing sepsis?",
        why_it_matters=(
            "Sepsis is a life-threatening condition with mortality rates "
            "of 25-30% in ICU settings. Each hour of delayed treatment "
            "increases mortality by 4-8%. Early prediction enables "
            "rapid administration of antibiotics and fluids."
        ),
        patient_population="Adult ICU patients with suspected infection",
        ai_limitation_note=(
            "Sepsis prediction models have significant false-positive rates. "
            "Clinical assessment with SOFA scores and blood cultures must "
            "guide treatment decisions."
        ),
        feature_names=[
            "PRG", "PL", "PR", "SK", "TS",
            "M11", "BD2", "Age", "Insurance",
        ],
        feature_descriptions={
            "PRG": "Plasma glucose concentration",
            "PL": "Blood work result 1 (Platelet count)",
            "PR": "Blood pressure (diastolic, mm Hg)",
            "SK": "Blood work result 2 (Skin thickness proxy)",
            "TS": "Blood work result 3 (serum marker)",
            "M11": "Body mass index (kg/m^2)",
            "BD2": "Blood work result 4 (diabetes pedigree function)",
            "Age": "Patient age in years",
            "Insurance": "Insurance coverage (0/1)",
        },
        target_classes=["Positive", "Negative"],
        data_source="https://www.kaggle.com/datasets/chaunguynnghunh/sepsis",
        dataset_rows=599,
        dataset_features=9,
        positive_rate="~35%",
        sense_check_text=(
            "Lactate levels, heart rate, and white blood cell count are components "
            "of established sepsis screening tools (qSOFA, SOFA). Elevated lactate "
            "indicates tissue hypoperfusion, a hallmark of septic shock."
        ),
        subgroup_columns={
            "age_column": "Age",
            "age_threshold": 65,
        },
        population_stats={
            "male": 0.55,
            "female": 0.45,
            "age_under_threshold": 0.45,
            "age_over_threshold": 0.55,
        },
    )
)

# -----------------------------------------------------------------------
# 16. Obstetrics — Fetal Health (multiclass)
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="obstetrics",
        name="Fetal Health",
        icon="\U0001f476",
        short_description="Classify fetal health status from cardiotocography data.",
        dataset_name="fetal_health",
        target_variable="fetal_health",
        problem_type="multiclass",
        clinical_question="What is the fetal health status (Normal, Suspect, Pathological)?",
        why_it_matters=(
            "Cardiotocography (CTG) monitoring is the primary tool for "
            "intrapartum fetal surveillance. Automated classification of "
            "CTG traces can support midwives and obstetricians in "
            "identifying foetuses in distress requiring urgent delivery."
        ),
        patient_population="Pregnant women undergoing CTG monitoring during labour",
        ai_limitation_note=(
            "AI classification of CTG traces cannot replace clinical "
            "judgement. Fetal scalp blood sampling and clinical context "
            "are necessary for definitive decision-making."
        ),
        feature_names=[
            "baseline_value", "accelerations", "fetal_movement",
            "uterine_contractions", "light_decelerations",
            "severe_decelerations", "prolongued_decelerations",
            "abnormal_short_term_variability",
            "mean_value_of_short_term_variability",
            "percentage_of_time_with_abnormal_long_term_variability",
            "mean_value_of_long_term_variability", "histogram_width",
            "histogram_min", "histogram_max", "histogram_number_of_peaks",
            "histogram_number_of_zeroes", "histogram_mode",
            "histogram_mean", "histogram_median", "histogram_variance",
            "histogram_tendency",
        ],
        feature_descriptions={
            "baseline_value": "Baseline fetal heart rate (bpm)",
            "accelerations": "Number of accelerations per second",
            "fetal_movement": "Number of fetal movements per second",
            "uterine_contractions": "Number of uterine contractions per second",
            "light_decelerations": "Number of light decelerations per second",
            "severe_decelerations": "Number of severe decelerations per second",
            "prolongued_decelerations": "Number of prolonged decelerations per second",
            "abnormal_short_term_variability": "Percentage of time with abnormal STV",
            "mean_value_of_short_term_variability": "Mean value of short-term variability",
            "percentage_of_time_with_abnormal_long_term_variability": "Percentage of time with abnormal LTV",
            "mean_value_of_long_term_variability": "Mean value of long-term variability",
            "histogram_width": "Width of the FHR histogram",
            "histogram_min": "Minimum of the FHR histogram",
            "histogram_max": "Maximum of the FHR histogram",
            "histogram_number_of_peaks": "Number of peaks in the FHR histogram",
            "histogram_number_of_zeroes": "Number of zeroes in the FHR histogram",
            "histogram_mode": "Mode of the FHR histogram",
            "histogram_mean": "Mean of the FHR histogram",
            "histogram_median": "Median of the FHR histogram",
            "histogram_variance": "Variance of the FHR histogram",
            "histogram_tendency": "Tendency of the FHR histogram (-1, 0, 1)",
        },
        target_classes=["1", "2", "3"],
        data_source="https://www.kaggle.com/datasets/andrewmvd/fetal-health-classification",
        dataset_rows=2126,
        dataset_features=21,
        positive_rate=None,
        sense_check_text=(
            "Glucose tolerance and BMI are the primary screening criteria for "
            "gestational diabetes. Pregnancy-induced insulin resistance is "
            "exacerbated by higher BMI and family history of diabetes."
        ),
        subgroup_columns={
            "age_column": "age",
            "age_threshold": 30,
        },
        population_stats={
            "age_under_threshold": 0.55,
            "age_over_threshold": 0.45,
        },
    )
)

# -----------------------------------------------------------------------
# 17. Cardiology — Arrhythmia (multiclass)
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="cardiology-arrhythmia",
        name="Arrhythmia Classification",
        icon="\U0001f4df",
        short_description="Classify cardiac arrhythmia type from ECG features.",
        dataset_name="arrhythmia",
        target_variable="target",
        problem_type="multiclass",
        clinical_question="What type of cardiac arrhythmia does this ECG pattern indicate?",
        why_it_matters=(
            "Arrhythmias range from benign to life-threatening. Automated "
            "ECG classification can help triage patients in emergency "
            "departments and remote monitoring settings, ensuring high-risk "
            "arrhythmias receive prompt treatment."
        ),
        patient_population="Patients undergoing 12-lead ECG recording",
        ai_limitation_note=(
            "Automated arrhythmia classification has reduced accuracy for "
            "rare subtypes. Cardiologist review of the full ECG trace "
            "remains essential, especially for treatment-altering diagnoses."
        ),
        feature_names=[
            "age", "sex", "height", "weight",
            "QRS_duration", "P_R_interval", "Q_T_interval",
            "T_interval", "P_interval", "heart_rate",
            "Q_wave", "R_wave", "S_wave", "T_wave", "P_wave",
        ],
        feature_descriptions={
            "age": "Patient age in years",
            "sex": "Biological sex (0 = male, 1 = female)",
            "height": "Patient height in cm",
            "weight": "Patient weight in kg",
            "QRS_duration": "QRS complex duration (ms)",
            "P_R_interval": "PR interval duration (ms)",
            "Q_T_interval": "QT interval duration (ms)",
            "T_interval": "T-wave interval duration (ms)",
            "P_interval": "P-wave interval duration (ms)",
            "heart_rate": "Heart rate (bpm)",
            "Q_wave": "Q-wave amplitude (mV)",
            "R_wave": "R-wave amplitude (mV)",
            "S_wave": "S-wave amplitude (mV)",
            "T_wave": "T-wave amplitude (mV)",
            "P_wave": "P-wave amplitude (mV)",
        },
        target_classes=["0", "1", "2", "3", "4"],
        data_source="https://archive.ics.uci.edu/ml/datasets/arrhythmia",
        dataset_rows=452,
        dataset_features=279,
        positive_rate=None,
        sense_check_text=(
            "QRS duration and P-R interval are fundamental ECG parameters for "
            "arrhythmia classification. Prolonged QRS suggests bundle branch blocks, "
            "while abnormal P-R intervals indicate conduction delays."
        ),
        subgroup_columns={
            "sex_column": "sex",
            "sex_male_value": 0,
            "age_column": "age",
            "age_threshold": 60,
        },
        population_stats={
            "male": 0.55,
            "female": 0.45,
            "age_under_threshold": 0.50,
            "age_over_threshold": 0.50,
        },
    )
)

# -----------------------------------------------------------------------
# 18. Oncology — Cervical Cancer
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="oncology-cervical",
        name="Cervical Cancer",
        icon="\U0001f52c",
        short_description="Predict cervical cancer biopsy outcome from risk factors and screening tests.",
        dataset_name="cervical_cancer",
        target_variable="Biopsy",
        problem_type="binary",
        clinical_question="Is this patient's cervical biopsy likely to be positive for cancer?",
        why_it_matters=(
            "Cervical cancer is highly preventable with screening, yet "
            "remains the fourth most common cancer in women globally. "
            "Risk-stratification models can optimise screening programmes, "
            "especially where resources are limited."
        ),
        patient_population="Women aged 13-84 undergoing cervical cancer screening",
        ai_limitation_note=(
            "Risk prediction cannot replace cytology, HPV testing, or "
            "colposcopy. A positive prediction should prompt further "
            "investigation, not immediate treatment."
        ),
        feature_names=[
            "Age", "Number_of_sexual_partners",
            "First_sexual_intercourse", "Num_of_pregnancies",
            "Smokes", "Smokes_years", "Smokes_packs_year",
            "Hormonal_Contraceptives",
            "Hormonal_Contraceptives_years", "IUD", "IUD_years",
            "STDs", "STDs_number",
        ],
        feature_descriptions={
            "Age": "Patient age in years",
            "Number_of_sexual_partners": "Number of sexual partners",
            "First_sexual_intercourse": "Age at first sexual intercourse",
            "Num_of_pregnancies": "Number of pregnancies",
            "Smokes": "Smoking status (0/1)",
            "Smokes_years": "Years of smoking",
            "Smokes_packs_year": "Packs smoked per year",
            "Hormonal_Contraceptives": "Use of hormonal contraceptives (0/1)",
            "Hormonal_Contraceptives_years": "Years of hormonal contraceptive use",
            "IUD": "Intrauterine device use (0/1)",
            "IUD_years": "Years of IUD use",
            "STDs": "History of sexually transmitted diseases (0/1)",
            "STDs_number": "Number of STDs diagnosed",
        },
        target_classes=["0", "1"],
        data_source="https://archive.ics.uci.edu/ml/datasets/Cervical+cancer+%28Risk+Factors%29",
        dataset_rows=858,
        dataset_features=13,
        positive_rate="~7%",
        sense_check_text=(
            "HPV status, age, and number of sexual partners are established risk "
            "factors for cervical cancer. HPV is the primary causative agent, and "
            "screening guidelines are stratified by age and sexual history."
        ),
        subgroup_columns={
            "age_column": "Age",
            "age_threshold": 40,
        },
        population_stats={
            "age_under_threshold": 0.65,
            "age_over_threshold": 0.35,
        },
    )
)

# -----------------------------------------------------------------------
# 19. Thyroid — Thyroid Disease
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="thyroid",
        name="Thyroid Disease",
        icon="\U0001f9ec",
        short_description="Predict thyroid disease status from blood tests and clinical exam.",
        dataset_name="thyroid",
        target_variable="target",
        problem_type="binary",
        clinical_question="Does this patient have a thyroid disorder?",
        why_it_matters=(
            "Thyroid disorders affect 5-10% of the population and are "
            "frequently under-diagnosed. Automated screening from routine "
            "blood work can flag patients for endocrinology referral "
            "before symptoms become severe."
        ),
        patient_population="Adults undergoing thyroid function testing",
        ai_limitation_note=(
            "Binary classification (positive/negative) cannot differentiate "
            "between hypothyroidism, hyperthyroidism, or thyroid nodules. "
            "Full thyroid panel and ultrasound are required for diagnosis."
        ),
        feature_names=[
            "age", "sex", "on_thyroxine", "query_on_thyroxine",
            "on_antithyroid_medication", "sick", "pregnant",
            "thyroid_surgery", "I131_treatment", "query_hypothyroid",
            "query_hyperthyroid", "lithium", "goitre",
            "tumor", "hypopituitary", "psych", "TSH", "T3",
            "TT4", "T4U", "FTI",
        ],
        feature_descriptions={
            "age": "Patient age in years",
            "sex": "Biological sex (M/F)",
            "on_thyroxine": "Currently taking thyroxine (0/1)",
            "query_on_thyroxine": "Queried about thyroxine use (0/1)",
            "on_antithyroid_medication": "Currently on anti-thyroid medication (0/1)",
            "sick": "Patient currently ill (0/1)",
            "pregnant": "Patient is pregnant (0/1)",
            "thyroid_surgery": "History of thyroid surgery (0/1)",
            "I131_treatment": "History of I131 radioiodine treatment (0/1)",
            "query_hypothyroid": "Referred for hypothyroid query (0/1)",
            "query_hyperthyroid": "Referred for hyperthyroid query (0/1)",
            "lithium": "Currently on lithium (0/1)",
            "goitre": "Goitre present on examination (0/1)",
            "tumor": "Thyroid tumour present (0/1)",
            "hypopituitary": "Hypopituitary condition (0/1)",
            "psych": "Psychological symptoms (0/1)",
            "TSH": "Thyroid-stimulating hormone level (mU/L)",
            "T3": "Triiodothyronine level (nmol/L)",
            "TT4": "Total thyroxine level (nmol/L)",
            "T4U": "Thyroxine utilisation rate",
            "FTI": "Free thyroxine index",
        },
        target_classes=["P", "N"],
        data_source="https://archive.ics.uci.edu/ml/datasets/thyroid+disease",
        dataset_rows=9172,
        dataset_features=21,
        positive_rate="~8%",
        sense_check_text=(
            "TSH and thyroid hormone levels (T3, T4, FTI) are the definitive "
            "biochemical markers for thyroid disease. Abnormal TSH with "
            "corresponding hormone changes differentiates hypo- from hyperthyroidism."
        ),
        subgroup_columns={
            "sex_column": "sex",
            "sex_male_value": 1,
            "age_column": "age",
            "age_threshold": 50,
        },
        population_stats={
            "male": 0.30,
            "female": 0.70,
            "age_under_threshold": 0.55,
            "age_over_threshold": 0.45,
        },
    )
)

# -----------------------------------------------------------------------
# 20. Pharmacy — Hospital Readmission
# -----------------------------------------------------------------------
_register(
    DomainDetail(
        id="pharmacy",
        name="Hospital Readmission",
        icon="\U0001f48a",
        short_description="Predict 30-day hospital readmission for diabetic patients.",
        dataset_name="readmission",
        target_variable="readmitted",
        problem_type="binary",
        clinical_question="Is this diabetic patient likely to be readmitted within 30 days?",
        why_it_matters=(
            "Hospital readmissions cost healthcare systems billions annually "
            "and indicate suboptimal discharge planning. Identifying high-risk "
            "patients enables targeted interventions such as medication "
            "reconciliation and follow-up scheduling."
        ),
        patient_population="Diabetic inpatients being discharged from hospital",
        ai_limitation_note=(
            "Readmission prediction does not account for social determinants "
            "of health or post-discharge medication adherence. Clinical "
            "teams must consider the full patient context."
        ),
        feature_names=[
            "age", "time_in_hospital", "num_lab_procedures",
            "num_procedures", "num_medications",
            "number_outpatient", "number_emergency",
            "number_inpatient", "number_diagnoses",
            "max_glu_serum", "A1Cresult", "metformin",
            "insulin", "change", "diabetesMed",
        ],
        feature_descriptions={
            "age": "Patient age bracket (e.g. [70-80))",
            "time_in_hospital": "Length of stay in days",
            "num_lab_procedures": "Number of lab procedures during the encounter",
            "num_procedures": "Number of non-lab procedures during the encounter",
            "num_medications": "Number of distinct medications administered",
            "number_outpatient": "Number of outpatient visits in the prior year",
            "number_emergency": "Number of emergency visits in the prior year",
            "number_inpatient": "Number of inpatient visits in the prior year",
            "number_diagnoses": "Number of diagnoses on the encounter",
            "max_glu_serum": "Maximum glucose serum test result (None/>200/>300/Normal)",
            "A1Cresult": "HbA1c test result (None/>7/>8/Normal)",
            "metformin": "Metformin dosage change (No/Steady/Up/Down)",
            "insulin": "Insulin dosage change (No/Steady/Up/Down)",
            "change": "Change in diabetes medication (Yes/No)",
            "diabetesMed": "Any diabetes medication prescribed (Yes/No)",
        },
        target_classes=["Yes", "No"],
        data_source="https://archive.ics.uci.edu/ml/datasets/Diabetes+130-US+hospitals+for+years+1999-2008",
        dataset_rows=101766,
        dataset_features=15,
        positive_rate="~11%",
        sense_check_text=(
            "Number of medications, time in hospital, and number of diagnoses are "
            "validated predictors of hospital readmission. Polypharmacy and "
            "comorbidity burden increase the complexity of post-discharge management."
        ),
        subgroup_columns={
            "age_column": "age",
            "age_threshold": 65,
        },
        population_stats={
            "male": 0.47,
            "female": 0.53,
            "age_under_threshold": 0.45,
            "age_over_threshold": 0.55,
        },
    )
)

# ---------------------------------------------------------------------------
# Dataset filename mapping
# ---------------------------------------------------------------------------
_DATASET_FILENAMES: Dict[str, str] = {
    domain.id: domain.dataset_name for domain in _DOMAINS.values()
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_all_domains() -> List[DomainSummary]:
    """Return summary cards for all 20 clinical domains."""
    return [
        DomainSummary(
            id=d.id,
            name=d.name,
            icon=d.icon,
            short_description=d.short_description,
            dataset_name=d.dataset_name,
            target_variable=d.target_variable,
            problem_type=d.problem_type,
        )
        for d in _DOMAINS.values()
    ]


def get_domain_detail(domain_id: str) -> Optional[DomainDetail]:
    """Return full detail for a single domain, or ``None`` if not found."""
    return _DOMAINS.get(domain_id)


def get_dataset_filename(domain_id: str) -> Optional[str]:
    """Return the CSV base filename for a domain, or ``None``."""
    return _DATASET_FILENAMES.get(domain_id)


def get_domain_ids() -> List[str]:
    """Return a sorted list of all registered domain IDs."""
    return sorted(_DOMAINS.keys())
