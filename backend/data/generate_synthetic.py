"""Generate 20 synthetic CSV datasets for the MedVix clinical domains.

Each dataset uses a fixed numpy seed per domain for reproducibility,
generates realistic column distributions, includes intentional missing
values, and some domains have class imbalance.

Usage:
    python backend/data/generate_synthetic.py
"""

from __future__ import annotations

from pathlib import Path
from typing import Callable, Dict, List, Tuple

import numpy as np
import pandas as pd

OUTPUT_DIR = Path(__file__).resolve().parent


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _inject_missing(
    df: pd.DataFrame,
    rng: np.random.Generator,
    columns_pct: Dict[str, float],
) -> pd.DataFrame:
    """Set a percentage of values to NaN in specified columns."""
    for col, pct in columns_pct.items():
        if col not in df.columns:
            continue
        mask = rng.random(len(df)) < pct
        df.loc[mask, col] = np.nan
    return df


def _binary_target(
    rng: np.random.Generator,
    n: int,
    positive_rate: float,
) -> np.ndarray:
    """Generate binary target with a given positive rate."""
    return (rng.random(n) < positive_rate).astype(int)


def _clip(arr: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return np.clip(arr, lo, hi)


def _round_int(arr: np.ndarray) -> np.ndarray:
    return np.round(arr).astype(int)


# ---------------------------------------------------------------------------
# 1. Cardiology — Heart Disease
# Dataset: heart.csv, target: target
# Features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang,
#           oldpeak, slope, ca, thal
# ---------------------------------------------------------------------------

def gen_heart(rng: np.random.Generator) -> pd.DataFrame:
    n = 303
    target = _binary_target(rng, n, 0.54)
    df = pd.DataFrame({
        "age": _round_int(_clip(rng.normal(54, 9, n), 29, 77)),
        "sex": rng.integers(0, 2, n),
        "cp": rng.integers(0, 4, n),
        "trestbps": _round_int(_clip(rng.normal(131, 18, n), 90, 200)),
        "chol": _round_int(_clip(rng.normal(246, 52, n), 120, 560)),
        "fbs": (rng.random(n) < 0.15).astype(int),
        "restecg": rng.integers(0, 3, n),
        "thalach": _round_int(_clip(rng.normal(150, 23, n), 70, 210)),
        "exang": (rng.random(n) < 0.33).astype(int),
        "oldpeak": np.round(_clip(rng.exponential(1.0, n), 0, 6.2), 1),
        "slope": rng.integers(0, 3, n),
        "ca": rng.integers(0, 4, n),
        "thal": rng.choice([1, 2, 3], n, p=[0.1, 0.35, 0.55]),
        "target": target,
    })
    return _inject_missing(df, rng, {"chol": 0.08, "trestbps": 0.05, "thal": 0.03})


# ---------------------------------------------------------------------------
# 2. Radiology — Chest X-Ray (Pneumonia)
# Dataset: chest_xray.csv, target: label
# Features: mean_pixel_value, std_pixel_value, skewness, kurtosis, entropy,
#           contrast, energy, homogeneity, lung_area_ratio, opacity_score
# ---------------------------------------------------------------------------

def gen_chest_xray(rng: np.random.Generator) -> pd.DataFrame:
    n = 400
    # Imbalanced: ~75% pneumonia
    label = _binary_target(rng, n, 0.75)
    df = pd.DataFrame({
        "mean_pixel_value": np.round(_clip(rng.normal(128, 30, n), 30, 230), 2),
        "std_pixel_value": np.round(_clip(rng.normal(45, 12, n), 10, 90), 2),
        "skewness": np.round(rng.normal(0.1, 0.8, n), 4),
        "kurtosis": np.round(_clip(rng.normal(2.5, 1.2, n), -1, 8), 4),
        "entropy": np.round(_clip(rng.normal(6.5, 0.8, n), 3.5, 8.5), 4),
        "contrast": np.round(_clip(rng.exponential(50, n), 5, 300), 2),
        "energy": np.round(_clip(rng.normal(0.15, 0.06, n), 0.01, 0.5), 4),
        "homogeneity": np.round(_clip(rng.normal(0.6, 0.12, n), 0.2, 0.95), 4),
        "lung_area_ratio": np.round(_clip(rng.normal(0.42, 0.08, n), 0.15, 0.7), 4),
        "opacity_score": np.round(_clip(rng.normal(35, 20, n), 0, 100), 2),
        "label": label,
    })
    return _inject_missing(df, rng, {"opacity_score": 0.07, "lung_area_ratio": 0.05})


# ---------------------------------------------------------------------------
# 3. Nephrology — Chronic Kidney Disease
# Dataset: kidney_disease.csv, target: classification
# Features: age, bp, sg, al, su, rbc, pc, pcc, ba, bgr, bu, sc, sod, pot,
#           hemo, pcv, wc, rc, htn, dm, cad, appet, pe, ane
# ---------------------------------------------------------------------------

def gen_kidney_disease(rng: np.random.Generator) -> pd.DataFrame:
    n = 400
    # ~62% CKD
    classification = np.where(
        _binary_target(rng, n, 0.62), "ckd", "notckd"
    )
    df = pd.DataFrame({
        "age": _round_int(_clip(rng.normal(52, 15, n), 2, 90)),
        "bp": _round_int(_clip(rng.normal(76, 14, n), 50, 110)),
        "sg": rng.choice([1.005, 1.010, 1.015, 1.020, 1.025], n),
        "al": rng.integers(0, 6, n),
        "su": rng.integers(0, 6, n),
        "rbc": rng.choice(["normal", "abnormal"], n, p=[0.55, 0.45]),
        "pc": rng.choice(["normal", "abnormal"], n, p=[0.6, 0.4]),
        "pcc": rng.choice(["present", "notpresent"], n, p=[0.20, 0.80]),
        "ba": rng.choice(["present", "notpresent"], n, p=[0.10, 0.90]),
        "bgr": _round_int(_clip(rng.normal(148, 80, n), 22, 490)),
        "bu": np.round(_clip(rng.normal(57, 34, n), 1.5, 200), 1),
        "sc": np.round(_clip(rng.exponential(2.5, n), 0.4, 15), 1),
        "sod": np.round(_clip(rng.normal(138, 8, n), 111, 163), 1),
        "pot": np.round(_clip(rng.normal(4.6, 1.2, n), 2.5, 8), 1),
        "hemo": np.round(_clip(rng.normal(12.5, 2.5, n), 3.1, 17.8), 1),
        "pcv": _round_int(_clip(rng.normal(38, 9, n), 9, 54)),
        "wc": _round_int(_clip(rng.normal(8500, 3000, n), 2200, 26400)),
        "rc": np.round(_clip(rng.normal(4.7, 1.0, n), 2.1, 8.0), 1),
        "htn": rng.choice(["yes", "no"], n, p=[0.40, 0.60]),
        "dm": rng.choice(["yes", "no"], n, p=[0.38, 0.62]),
        "cad": rng.choice(["yes", "no"], n, p=[0.12, 0.88]),
        "appet": rng.choice(["good", "poor"], n, p=[0.65, 0.35]),
        "pe": rng.choice(["yes", "no"], n, p=[0.25, 0.75]),
        "ane": rng.choice(["yes", "no"], n, p=[0.30, 0.70]),
        "classification": classification,
    })
    return _inject_missing(df, rng, {
        "bgr": 0.10, "sc": 0.06, "hemo": 0.08,
        "pcv": 0.07, "wc": 0.05, "rc": 0.05,
        "rbc": 0.15, "pc": 0.10,
    })


# ---------------------------------------------------------------------------
# 4. Oncology — Breast Cancer
# Dataset: breast_cancer.csv, target: diagnosis
# Features: radius_mean, texture_mean, perimeter_mean, area_mean,
#           smoothness_mean, compactness_mean, concavity_mean,
#           concave_points_mean, symmetry_mean, fractal_dimension_mean
# ---------------------------------------------------------------------------

def gen_breast_cancer(rng: np.random.Generator) -> pd.DataFrame:
    n = 569
    diagnosis = np.where(
        _binary_target(rng, n, 0.37), "M", "B"
    )
    base = {
        "radius_mean": (14.1, 3.5),
        "texture_mean": (19.3, 4.3),
        "perimeter_mean": (92, 24),
        "area_mean": (654, 350),
        "smoothness_mean": (0.096, 0.014),
        "compactness_mean": (0.104, 0.053),
        "concavity_mean": (0.089, 0.080),
        "concave_points_mean": (0.049, 0.039),
        "symmetry_mean": (0.181, 0.027),
        "fractal_dimension_mean": (0.063, 0.007),
    }
    data: Dict[str, np.ndarray] = {}
    for name, (mu, sigma) in base.items():
        vals = _clip(rng.normal(mu, sigma, n), max(0, mu - 3 * sigma), mu + 3 * sigma)
        data[name] = np.round(vals, 4)
    data["diagnosis"] = diagnosis
    df = pd.DataFrame(data)
    return _inject_missing(df, rng, {"area_mean": 0.05, "concavity_mean": 0.04})


# ---------------------------------------------------------------------------
# 5. Neurology — Parkinson's Disease
# Dataset: parkinsons.csv, target: status
# Features: MDVP:Fo(Hz), MDVP:Fhi(Hz), MDVP:Flo(Hz), MDVP:Jitter(%),
#           MDVP:Jitter(Abs), MDVP:RAP, MDVP:PPQ, Jitter:DDP,
#           MDVP:Shimmer, MDVP:Shimmer(dB), Shimmer:APQ3, Shimmer:APQ5,
#           MDVP:APQ, Shimmer:DDA, NHR, HNR, RPDE, DFA, spread1, spread2,
#           D2, PPE
# ---------------------------------------------------------------------------

def gen_parkinsons(rng: np.random.Generator) -> pd.DataFrame:
    n = 195
    # Imbalanced: ~75% Parkinson's
    status = _binary_target(rng, n, 0.75)
    df = pd.DataFrame({
        "MDVP:Fo(Hz)": np.round(_clip(rng.normal(154, 42, n), 80, 260), 3),
        "MDVP:Fhi(Hz)": np.round(_clip(rng.normal(198, 60, n), 100, 600), 3),
        "MDVP:Flo(Hz)": np.round(_clip(rng.normal(116, 44, n), 60, 240), 3),
        "MDVP:Jitter(%)": np.round(_clip(rng.exponential(0.006, n), 0.001, 0.04), 5),
        "MDVP:Jitter(Abs)": np.round(_clip(rng.exponential(0.00004, n), 0.000007, 0.0003), 6),
        "MDVP:RAP": np.round(_clip(rng.exponential(0.003, n), 0.0003, 0.02), 5),
        "MDVP:PPQ": np.round(_clip(rng.exponential(0.003, n), 0.0004, 0.02), 5),
        "Jitter:DDP": np.round(_clip(rng.exponential(0.01, n), 0.001, 0.06), 5),
        "MDVP:Shimmer": np.round(_clip(rng.exponential(0.03, n), 0.009, 0.12), 5),
        "MDVP:Shimmer(dB)": np.round(_clip(rng.exponential(0.28, n), 0.085, 1.3), 3),
        "Shimmer:APQ3": np.round(_clip(rng.exponential(0.017, n), 0.004, 0.06), 5),
        "Shimmer:APQ5": np.round(_clip(rng.exponential(0.02, n), 0.005, 0.08), 5),
        "MDVP:APQ": np.round(_clip(rng.exponential(0.024, n), 0.007, 0.14), 5),
        "Shimmer:DDA": np.round(_clip(rng.exponential(0.05, n), 0.013, 0.17), 5),
        "NHR": np.round(_clip(rng.exponential(0.025, n), 0.0007, 0.32), 5),
        "HNR": np.round(_clip(rng.normal(21.9, 4.5, n), 8, 34), 3),
        "RPDE": np.round(_clip(rng.normal(0.50, 0.10, n), 0.25, 0.75), 5),
        "DFA": np.round(_clip(rng.normal(0.72, 0.06, n), 0.55, 0.85), 5),
        "spread1": np.round(rng.normal(-5.7, 1.1, n), 5),
        "spread2": np.round(_clip(rng.normal(0.23, 0.08, n), 0.01, 0.45), 5),
        "D2": np.round(_clip(rng.normal(2.38, 0.38, n), 1.3, 3.7), 5),
        "PPE": np.round(_clip(rng.normal(0.21, 0.09, n), 0.04, 0.53), 5),
        "status": status,
    })
    return _inject_missing(df, rng, {"MDVP:Fo(Hz)": 0.05, "HNR": 0.06})


# ---------------------------------------------------------------------------
# 6. Endocrinology — Diabetes
# Dataset: diabetes.csv, target: Outcome
# Features: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin,
#           BMI, DiabetesPedigreeFunction, Age
# ---------------------------------------------------------------------------

def gen_diabetes(rng: np.random.Generator) -> pd.DataFrame:
    n = 768
    outcome = _binary_target(rng, n, 0.35)
    df = pd.DataFrame({
        "Pregnancies": _round_int(_clip(rng.exponential(3.8, n), 0, 17)),
        "Glucose": _round_int(_clip(rng.normal(121, 32, n), 0, 200)),
        "BloodPressure": _round_int(_clip(rng.normal(69, 19, n), 0, 122)),
        "SkinThickness": _round_int(_clip(rng.normal(21, 16, n), 0, 100)),
        "Insulin": _round_int(_clip(rng.exponential(80, n), 0, 850)),
        "BMI": np.round(_clip(rng.normal(32, 7.9, n), 0, 67), 1),
        "DiabetesPedigreeFunction": np.round(_clip(rng.exponential(0.47, n), 0.078, 2.42), 3),
        "Age": _round_int(_clip(rng.normal(33, 12, n), 21, 81)),
        "Outcome": outcome,
    })
    return _inject_missing(df, rng, {
        "Glucose": 0.05, "BloodPressure": 0.12,
        "SkinThickness": 0.15, "Insulin": 0.10, "BMI": 0.03,
    })


# ---------------------------------------------------------------------------
# 7. Hepatology — Liver Disease
# Dataset: liver.csv, target: Dataset
# Features: Age, Gender, Total_Bilirubin, Direct_Bilirubin,
#           Alkaline_Phosphotase, Alamine_Aminotransferase,
#           Aspartate_Aminotransferase, Total_Protiens, Albumin,
#           Albumin_and_Globulin_Ratio
# ---------------------------------------------------------------------------

def gen_liver(rng: np.random.Generator) -> pd.DataFrame:
    n = 583
    # Dataset column: 1 = liver disease, 2 = no disease; ~71% disease
    dataset = np.where(_binary_target(rng, n, 0.71), 1, 2)
    df = pd.DataFrame({
        "Age": _round_int(_clip(rng.normal(44, 16, n), 10, 90)),
        "Gender": rng.choice(["Male", "Female"], n, p=[0.76, 0.24]),
        "Total_Bilirubin": np.round(_clip(rng.exponential(3.3, n), 0.4, 75), 1),
        "Direct_Bilirubin": np.round(_clip(rng.exponential(1.5, n), 0.1, 19.7), 1),
        "Alkaline_Phosphotase": _round_int(_clip(rng.exponential(290, n), 63, 2110)),
        "Alamine_Aminotransferase": _round_int(_clip(rng.exponential(80, n), 10, 2000)),
        "Aspartate_Aminotransferase": _round_int(_clip(rng.exponential(110, n), 10, 4929)),
        "Total_Protiens": np.round(_clip(rng.normal(6.5, 1.1, n), 2.7, 9.6), 1),
        "Albumin": np.round(_clip(rng.normal(3.1, 0.8, n), 0.9, 5.5), 1),
        "Albumin_and_Globulin_Ratio": np.round(_clip(rng.normal(0.95, 0.32, n), 0.3, 2.8), 2),
        "Dataset": dataset,
    })
    return _inject_missing(df, rng, {
        "Albumin_and_Globulin_Ratio": 0.07, "Total_Bilirubin": 0.04,
    })


# ---------------------------------------------------------------------------
# 8. Cardiology — Stroke Prediction
# Dataset: stroke.csv, target: stroke
# Features: gender, age, hypertension, heart_disease, ever_married,
#           work_type, Residence_type, avg_glucose_level, bmi, smoking_status
# ---------------------------------------------------------------------------

def gen_stroke(rng: np.random.Generator) -> pd.DataFrame:
    n = 500
    # Highly imbalanced: ~5% stroke
    stroke = _binary_target(rng, n, 0.05)
    df = pd.DataFrame({
        "gender": rng.choice(["Male", "Female", "Other"], n, p=[0.48, 0.51, 0.01]),
        "age": np.round(_clip(rng.normal(43, 22, n), 0.1, 82), 1),
        "hypertension": (rng.random(n) < 0.10).astype(int),
        "heart_disease": (rng.random(n) < 0.05).astype(int),
        "ever_married": rng.choice(["Yes", "No"], n, p=[0.66, 0.34]),
        "work_type": rng.choice(
            ["children", "Govt_job", "Never_worked", "Private", "Self-employed"],
            n, p=[0.05, 0.13, 0.01, 0.57, 0.24],
        ),
        "Residence_type": rng.choice(["Urban", "Rural"], n, p=[0.51, 0.49]),
        "avg_glucose_level": np.round(_clip(rng.normal(106, 45, n), 55, 272), 2),
        "bmi": np.round(_clip(rng.normal(28.9, 7.9, n), 10, 60), 1),
        "smoking_status": rng.choice(
            ["never smoked", "formerly smoked", "smokes", "Unknown"],
            n, p=[0.37, 0.17, 0.16, 0.30],
        ),
        "stroke": stroke,
    })
    return _inject_missing(df, rng, {"bmi": 0.05, "avg_glucose_level": 0.03})


# ---------------------------------------------------------------------------
# 9. Mental Health — Depression Screening
# Dataset: depression.csv, target: treatment
# Features: Age, Gender, family_history, work_interfere, no_employees,
#           remote_work, tech_company, benefits, care_options,
#           wellness_program, seek_help, anonymity, leave
# ---------------------------------------------------------------------------

def gen_depression(rng: np.random.Generator) -> pd.DataFrame:
    n = 400
    treatment = rng.choice(["Yes", "No"], n, p=[0.50, 0.50])
    df = pd.DataFrame({
        "Age": _round_int(_clip(rng.normal(32, 10, n), 18, 72)),
        "Gender": rng.choice(["Male", "Female"], n, p=[0.62, 0.38]),
        "family_history": rng.choice(["Yes", "No"], n, p=[0.40, 0.60]),
        "work_interfere": rng.choice(
            ["Never", "Rarely", "Sometimes", "Often"],
            n, p=[0.20, 0.25, 0.35, 0.20],
        ),
        "no_employees": rng.choice(
            ["1-5", "6-25", "26-100", "100-500", "500-1000", "More than 1000"],
            n, p=[0.10, 0.15, 0.25, 0.20, 0.15, 0.15],
        ),
        "remote_work": rng.choice(["Yes", "No"], n, p=[0.30, 0.70]),
        "tech_company": rng.choice(["Yes", "No"], n, p=[0.55, 0.45]),
        "benefits": rng.choice(["Yes", "No", "Don't know"], n, p=[0.40, 0.35, 0.25]),
        "care_options": rng.choice(["Yes", "No", "Not sure"], n, p=[0.30, 0.40, 0.30]),
        "wellness_program": rng.choice(["Yes", "No", "Don't know"], n, p=[0.20, 0.50, 0.30]),
        "seek_help": rng.choice(["Yes", "No", "Don't know"], n, p=[0.30, 0.35, 0.35]),
        "anonymity": rng.choice(["Yes", "No", "Don't know"], n, p=[0.35, 0.30, 0.35]),
        "leave": rng.choice(
            ["Very easy", "Somewhat easy", "Somewhat difficult", "Very difficult", "Don't know"],
            n, p=[0.10, 0.25, 0.25, 0.15, 0.25],
        ),
        "treatment": treatment,
    })
    return _inject_missing(df, rng, {"work_interfere": 0.08, "no_employees": 0.05})


# ---------------------------------------------------------------------------
# 10. Pulmonology — Framingham
# Dataset: framingham.csv, target: TenYearCHD
# Features: male, age, education, currentSmoker, cigsPerDay, BPMeds,
#           prevalentStroke, prevalentHyp, diabetes, totChol, sysBP,
#           diaBP, BMI, heartRate, glucose
# ---------------------------------------------------------------------------

def gen_framingham(rng: np.random.Generator) -> pd.DataFrame:
    n = 500
    # Imbalanced: ~15% positive
    ten_year_chd = _binary_target(rng, n, 0.15)
    df = pd.DataFrame({
        "male": rng.integers(0, 2, n),
        "age": _round_int(_clip(rng.normal(49, 9, n), 32, 70)),
        "education": rng.integers(1, 5, n),
        "currentSmoker": (rng.random(n) < 0.50).astype(int),
        "cigsPerDay": _round_int(_clip(rng.exponential(9, n) * (rng.random(n) < 0.50), 0, 70)),
        "BPMeds": (rng.random(n) < 0.03).astype(int),
        "prevalentStroke": (rng.random(n) < 0.006).astype(int),
        "prevalentHyp": (rng.random(n) < 0.31).astype(int),
        "diabetes": (rng.random(n) < 0.03).astype(int),
        "totChol": np.round(_clip(rng.normal(237, 44, n), 107, 600), 1),
        "sysBP": np.round(_clip(rng.normal(132, 22, n), 83, 295), 1),
        "diaBP": np.round(_clip(rng.normal(83, 12, n), 48, 143), 1),
        "BMI": np.round(_clip(rng.normal(26, 4, n), 15, 57), 2),
        "heartRate": _round_int(_clip(rng.normal(76, 12, n), 44, 143)),
        "glucose": np.round(_clip(rng.normal(82, 24, n), 40, 394), 1),
        "TenYearCHD": ten_year_chd,
    })
    return _inject_missing(df, rng, {
        "education": 0.06, "cigsPerDay": 0.05,
        "BPMeds": 0.10, "totChol": 0.04,
        "BMI": 0.04, "heartRate": 0.03, "glucose": 0.12,
    })


# ---------------------------------------------------------------------------
# 11. Haematology — Anaemia
# Dataset: anaemia.csv, target: Result
# Features: Gender, Hemoglobin, MCH, MCHC, MCV
# ---------------------------------------------------------------------------

def gen_anaemia(rng: np.random.Generator) -> pd.DataFrame:
    n = 400
    result = _binary_target(rng, n, 0.45)
    df = pd.DataFrame({
        "Gender": rng.integers(0, 2, n),
        "Hemoglobin": np.round(_clip(rng.normal(12.5, 2.5, n), 4, 18), 1),
        "MCH": np.round(_clip(rng.normal(29, 4, n), 15, 40), 1),
        "MCHC": np.round(_clip(rng.normal(33, 2, n), 25, 38), 1),
        "MCV": np.round(_clip(rng.normal(85, 10, n), 55, 120), 1),
        "Result": result,
    })
    return _inject_missing(df, rng, {"Hemoglobin": 0.06, "MCV": 0.04})


# ---------------------------------------------------------------------------
# 12. Dermatology — Skin Diseases (multiclass)
# Dataset: dermatology.csv, target: class
# Features: erythema, scaling, definite_borders, itching,
#           koebner_phenomenon, polygonal_papules, follicular_papules,
#           oral_mucosal_involvement, knee_elbow_involvement,
#           scalp_involvement, family_history, age
# ---------------------------------------------------------------------------

def gen_dermatology(rng: np.random.Generator) -> pd.DataFrame:
    n = 366
    # 6 classes with unequal distribution
    target_class = rng.choice(
        [1, 2, 3, 4, 5, 6], n,
        p=[0.30, 0.17, 0.20, 0.13, 0.12, 0.08],
    )
    df = pd.DataFrame({
        "erythema": rng.integers(0, 4, n),
        "scaling": rng.integers(0, 4, n),
        "definite_borders": rng.integers(0, 4, n),
        "itching": rng.integers(0, 4, n),
        "koebner_phenomenon": rng.integers(0, 4, n),
        "polygonal_papules": rng.integers(0, 4, n),
        "follicular_papules": rng.integers(0, 4, n),
        "oral_mucosal_involvement": rng.integers(0, 4, n),
        "knee_elbow_involvement": rng.integers(0, 4, n),
        "scalp_involvement": rng.integers(0, 4, n),
        "family_history": rng.integers(0, 2, n),
        "age": _round_int(_clip(rng.normal(35, 18, n), 5, 75)),
        "class": target_class,
    })
    return _inject_missing(df, rng, {"age": 0.08, "family_history": 0.03})


# ---------------------------------------------------------------------------
# 13. Ophthalmology — Diabetic Retinopathy (multiclass)
# Dataset: diabetic_retinopathy.csv, target: level
# Features: quality, pre_screening, ma_detection_1..6, exudates_1..7,
#           macula_opticdisc_distance, opticdisc_diameter, am_fm_classification
# ---------------------------------------------------------------------------

def gen_diabetic_retinopathy(rng: np.random.Generator) -> pd.DataFrame:
    n = 400
    # 5 severity levels (0=no DR, 1-4)
    level = rng.choice([0, 1, 2, 3, 4], n, p=[0.45, 0.20, 0.15, 0.12, 0.08])
    df = pd.DataFrame({
        "quality": rng.integers(0, 2, n),
        "pre_screening": rng.integers(0, 2, n),
        "ma_detection_1": np.round(_clip(rng.random(n), 0, 1), 4),
        "ma_detection_2": np.round(_clip(rng.random(n), 0, 1), 4),
        "ma_detection_3": np.round(_clip(rng.random(n), 0, 1), 4),
        "ma_detection_4": np.round(_clip(rng.random(n), 0, 1), 4),
        "ma_detection_5": np.round(_clip(rng.random(n), 0, 1), 4),
        "ma_detection_6": np.round(_clip(rng.random(n), 0, 1), 4),
        "exudates_1": np.round(_clip(rng.exponential(0.3, n), 0, 1), 4),
        "exudates_2": np.round(_clip(rng.exponential(0.3, n), 0, 1), 4),
        "exudates_3": np.round(_clip(rng.exponential(0.2, n), 0, 1), 4),
        "exudates_4": np.round(_clip(rng.exponential(0.2, n), 0, 1), 4),
        "exudates_5": np.round(_clip(rng.exponential(0.15, n), 0, 1), 4),
        "exudates_6": np.round(_clip(rng.exponential(0.1, n), 0, 1), 4),
        "exudates_7": np.round(_clip(rng.exponential(0.1, n), 0, 1), 4),
        "macula_opticdisc_distance": np.round(_clip(rng.normal(0.5, 0.12, n), 0.1, 0.9), 4),
        "opticdisc_diameter": np.round(_clip(rng.normal(0.1, 0.03, n), 0.02, 0.25), 4),
        "am_fm_classification": rng.integers(0, 2, n),
        "level": level,
    })
    return _inject_missing(df, rng, {
        "ma_detection_1": 0.05, "exudates_1": 0.06,
        "macula_opticdisc_distance": 0.07,
    })


# ---------------------------------------------------------------------------
# 14. Orthopaedics — Spine
# Dataset: spine.csv, target: class
# Features: pelvic_incidence, pelvic_tilt, lumbar_lordosis_angle,
#           sacral_slope, pelvic_radius, degree_spondylolisthesis
# ---------------------------------------------------------------------------

def gen_spine(rng: np.random.Generator) -> pd.DataFrame:
    n = 310
    # ~68% abnormal
    target_class = np.where(
        _binary_target(rng, n, 0.68), "Abnormal", "Normal"
    )
    df = pd.DataFrame({
        "pelvic_incidence": np.round(_clip(rng.normal(60, 17, n), 26, 130), 2),
        "pelvic_tilt": np.round(_clip(rng.normal(17, 10, n), -6, 50), 2),
        "lumbar_lordosis_angle": np.round(_clip(rng.normal(52, 19, n), 14, 125), 2),
        "sacral_slope": np.round(_clip(rng.normal(42, 13, n), 13, 100), 2),
        "pelvic_radius": np.round(_clip(rng.normal(117, 13, n), 70, 163), 2),
        "degree_spondylolisthesis": np.round(_clip(rng.exponential(26, n), -12, 420), 2),
        "class": target_class,
    })
    return _inject_missing(df, rng, {"lumbar_lordosis_angle": 0.06, "pelvic_tilt": 0.04})


# ---------------------------------------------------------------------------
# 15. ICU — Sepsis
# Dataset: sepsis.csv, target: Sepsis
# Features: PRG, PL, PR, SK, TS, M11, BD2, Age, Insurance
# ---------------------------------------------------------------------------

def gen_sepsis(rng: np.random.Generator) -> pd.DataFrame:
    n = 450
    sepsis = rng.choice(["Positive", "Negative"], n, p=[0.35, 0.65])
    df = pd.DataFrame({
        "PRG": _round_int(_clip(rng.exponential(3.8, n), 0, 17)),
        "PL": _round_int(_clip(rng.normal(121, 32, n), 0, 200)),
        "PR": _round_int(_clip(rng.normal(69, 19, n), 0, 122)),
        "SK": _round_int(_clip(rng.normal(21, 16, n), 0, 100)),
        "TS": _round_int(_clip(rng.exponential(80, n), 0, 850)),
        "M11": np.round(_clip(rng.normal(32, 8, n), 15, 67), 1),
        "BD2": np.round(_clip(rng.exponential(0.47, n), 0.078, 2.42), 3),
        "Age": _round_int(_clip(rng.normal(55, 18, n), 18, 95)),
        "Insurance": rng.integers(0, 2, n),
        "Sepsis": sepsis,
    })
    return _inject_missing(df, rng, {"PL": 0.08, "SK": 0.12, "TS": 0.10})


# ---------------------------------------------------------------------------
# 16. Obstetrics — Fetal Health (multiclass)
# Dataset: fetal_health.csv, target: fetal_health
# Features: baseline_value, accelerations, fetal_movement,
#           uterine_contractions, light_decelerations, severe_decelerations,
#           prolongued_decelerations, abnormal_short_term_variability,
#           mean_value_of_short_term_variability,
#           percentage_of_time_with_abnormal_long_term_variability,
#           mean_value_of_long_term_variability, histogram_width,
#           histogram_min, histogram_max, histogram_number_of_peaks,
#           histogram_number_of_zeroes, histogram_mode, histogram_mean,
#           histogram_median, histogram_variance, histogram_tendency
# ---------------------------------------------------------------------------

def gen_fetal_health(rng: np.random.Generator) -> pd.DataFrame:
    n = 500
    # 3 classes: 1=Normal (~78%), 2=Suspect (~14%), 3=Pathological (~8%)
    fetal_health = rng.choice([1, 2, 3], n, p=[0.78, 0.14, 0.08])
    df = pd.DataFrame({
        "baseline_value": np.round(_clip(rng.normal(133, 10, n), 106, 160), 1),
        "accelerations": np.round(_clip(rng.exponential(0.003, n), 0, 0.02), 4),
        "fetal_movement": np.round(_clip(rng.exponential(0.003, n), 0, 0.5), 4),
        "uterine_contractions": np.round(_clip(rng.exponential(0.004, n), 0, 0.02), 4),
        "light_decelerations": np.round(_clip(rng.exponential(0.002, n), 0, 0.015), 4),
        "severe_decelerations": np.round(_clip(rng.exponential(0.0001, n), 0, 0.005), 5),
        "prolongued_decelerations": np.round(_clip(rng.exponential(0.0003, n), 0, 0.005), 5),
        "abnormal_short_term_variability": _round_int(_clip(rng.normal(47, 17, n), 12, 87)),
        "mean_value_of_short_term_variability": np.round(_clip(rng.normal(1.3, 0.9, n), 0.2, 7), 1),
        "percentage_of_time_with_abnormal_long_term_variability": _round_int(_clip(rng.exponential(5, n), 0, 50)),
        "mean_value_of_long_term_variability": np.round(_clip(rng.normal(8, 5, n), 0, 50), 1),
        "histogram_width": _round_int(_clip(rng.normal(70, 39, n), 3, 180)),
        "histogram_min": _round_int(_clip(rng.normal(93, 30, n), 50, 160)),
        "histogram_max": _round_int(_clip(rng.normal(164, 18, n), 122, 238)),
        "histogram_number_of_peaks": _round_int(_clip(rng.normal(4, 3, n), 0, 18)),
        "histogram_number_of_zeroes": _round_int(_clip(rng.exponential(0.5, n), 0, 10)),
        "histogram_mode": _round_int(_clip(rng.normal(137, 16, n), 60, 187)),
        "histogram_mean": _round_int(_clip(rng.normal(134, 15, n), 73, 182)),
        "histogram_median": _round_int(_clip(rng.normal(138, 14, n), 77, 186)),
        "histogram_variance": _round_int(_clip(rng.exponential(18, n), 0, 269)),
        "histogram_tendency": rng.choice([-1, 0, 1], n, p=[0.25, 0.50, 0.25]),
        "fetal_health": fetal_health,
    })
    return _inject_missing(df, rng, {
        "mean_value_of_short_term_variability": 0.05,
        "histogram_variance": 0.07,
    })


# ---------------------------------------------------------------------------
# 17. Cardiology — Arrhythmia (multiclass)
# Dataset: arrhythmia.csv, target: target
# Features: age, sex, height, weight, QRS_duration, P_R_interval,
#           Q_T_interval, T_interval, P_interval, heart_rate,
#           Q_wave, R_wave, S_wave, T_wave, P_wave
# ---------------------------------------------------------------------------

def gen_arrhythmia(rng: np.random.Generator) -> pd.DataFrame:
    n = 452
    # 5 classes
    target = rng.choice([0, 1, 2, 3, 4], n, p=[0.40, 0.20, 0.18, 0.12, 0.10])
    df = pd.DataFrame({
        "age": _round_int(_clip(rng.normal(55, 15, n), 18, 90)),
        "sex": rng.integers(0, 2, n),
        "height": _round_int(_clip(rng.normal(168, 10, n), 140, 200)),
        "weight": _round_int(_clip(rng.normal(75, 15, n), 40, 140)),
        "QRS_duration": _round_int(_clip(rng.normal(95, 20, n), 60, 180)),
        "P_R_interval": _round_int(_clip(rng.normal(160, 30, n), 100, 300)),
        "Q_T_interval": _round_int(_clip(rng.normal(380, 40, n), 280, 520)),
        "T_interval": _round_int(_clip(rng.normal(180, 35, n), 100, 350)),
        "P_interval": _round_int(_clip(rng.normal(100, 20, n), 50, 200)),
        "heart_rate": _round_int(_clip(rng.normal(75, 18, n), 35, 180)),
        "Q_wave": np.round(rng.normal(-0.05, 0.15, n), 3),
        "R_wave": np.round(_clip(rng.normal(0.8, 0.4, n), -0.2, 2.5), 3),
        "S_wave": np.round(rng.normal(-0.3, 0.25, n), 3),
        "T_wave": np.round(rng.normal(0.3, 0.2, n), 3),
        "P_wave": np.round(_clip(rng.normal(0.12, 0.05, n), 0.01, 0.35), 3),
        "target": target,
    })
    return _inject_missing(df, rng, {
        "P_R_interval": 0.06, "Q_T_interval": 0.04,
        "P_wave": 0.08, "weight": 0.05,
    })


# ---------------------------------------------------------------------------
# 18. Oncology — Cervical Cancer
# Dataset: cervical_cancer.csv, target: Biopsy
# Features: Age, Number_of_sexual_partners, First_sexual_intercourse,
#           Num_of_pregnancies, Smokes, Smokes_years, Smokes_packs_year,
#           Hormonal_Contraceptives, Hormonal_Contraceptives_years,
#           IUD, IUD_years, STDs, STDs_number
# ---------------------------------------------------------------------------

def gen_cervical_cancer(rng: np.random.Generator) -> pd.DataFrame:
    n = 400
    # Highly imbalanced: ~7% positive biopsy
    biopsy = _binary_target(rng, n, 0.07)
    smoker_mask = rng.random(n) < 0.25
    hc_mask = rng.random(n) < 0.40
    iud_mask = rng.random(n) < 0.10
    df = pd.DataFrame({
        "Age": _round_int(_clip(rng.normal(27, 9, n), 13, 84)),
        "Number_of_sexual_partners": _round_int(_clip(rng.exponential(2.5, n), 1, 28)),
        "First_sexual_intercourse": _round_int(_clip(rng.normal(17, 3, n), 10, 32)),
        "Num_of_pregnancies": _round_int(_clip(rng.exponential(2, n), 0, 11)),
        "Smokes": smoker_mask.astype(int),
        "Smokes_years": np.round(_clip(rng.exponential(4, n) * smoker_mask, 0, 37), 1),
        "Smokes_packs_year": np.round(_clip(rng.exponential(1.5, n) * smoker_mask, 0, 20), 2),
        "Hormonal_Contraceptives": hc_mask.astype(int),
        "Hormonal_Contraceptives_years": np.round(_clip(rng.exponential(3, n) * hc_mask, 0, 30), 1),
        "IUD": iud_mask.astype(int),
        "IUD_years": np.round(_clip(rng.exponential(2, n) * iud_mask, 0, 19), 1),
        "STDs": (rng.random(n) < 0.15).astype(int),
        "STDs_number": _round_int(_clip(rng.exponential(0.3, n), 0, 4)),
        "Biopsy": biopsy,
    })
    return _inject_missing(df, rng, {
        "Number_of_sexual_partners": 0.08,
        "First_sexual_intercourse": 0.10,
        "Smokes_years": 0.12,
        "Hormonal_Contraceptives_years": 0.10,
    })


# ---------------------------------------------------------------------------
# 19. Thyroid — Thyroid Disease
# Dataset: thyroid.csv, target: target
# Features: age, sex, on_thyroxine, query_on_thyroxine,
#           on_antithyroid_medication, sick, pregnant, thyroid_surgery,
#           I131_treatment, query_hypothyroid, query_hyperthyroid, lithium,
#           goitre, tumor, hypopituitary, psych, TSH, T3, TT4, T4U, FTI
# ---------------------------------------------------------------------------

def gen_thyroid(rng: np.random.Generator) -> pd.DataFrame:
    n = 400
    # Imbalanced: ~8% positive
    target = np.where(_binary_target(rng, n, 0.08), "P", "N")
    df = pd.DataFrame({
        "age": _round_int(_clip(rng.normal(52, 18, n), 15, 90)),
        "sex": rng.choice(["M", "F"], n, p=[0.35, 0.65]),
        "on_thyroxine": (rng.random(n) < 0.12).astype(int),
        "query_on_thyroxine": (rng.random(n) < 0.06).astype(int),
        "on_antithyroid_medication": (rng.random(n) < 0.04).astype(int),
        "sick": (rng.random(n) < 0.05).astype(int),
        "pregnant": (rng.random(n) < 0.03).astype(int),
        "thyroid_surgery": (rng.random(n) < 0.02).astype(int),
        "I131_treatment": (rng.random(n) < 0.01).astype(int),
        "query_hypothyroid": (rng.random(n) < 0.10).astype(int),
        "query_hyperthyroid": (rng.random(n) < 0.08).astype(int),
        "lithium": (rng.random(n) < 0.01).astype(int),
        "goitre": (rng.random(n) < 0.06).astype(int),
        "tumor": (rng.random(n) < 0.02).astype(int),
        "hypopituitary": (rng.random(n) < 0.005).astype(int),
        "psych": (rng.random(n) < 0.04).astype(int),
        "TSH": np.round(_clip(rng.exponential(3.5, n), 0.005, 60), 3),
        "T3": np.round(_clip(rng.normal(1.8, 0.6, n), 0.5, 4.5), 2),
        "TT4": np.round(_clip(rng.normal(110, 30, n), 20, 250), 1),
        "T4U": np.round(_clip(rng.normal(1.0, 0.15, n), 0.5, 1.7), 2),
        "FTI": np.round(_clip(rng.normal(110, 28, n), 25, 240), 1),
        "target": target,
    })
    return _inject_missing(df, rng, {"TSH": 0.08, "T3": 0.06, "TT4": 0.05, "FTI": 0.07})


# ---------------------------------------------------------------------------
# 20. Pharmacy — Hospital Readmission
# Dataset: readmission.csv, target: readmitted
# Features: age, time_in_hospital, num_lab_procedures, num_procedures,
#           num_medications, number_outpatient, number_emergency,
#           number_inpatient, number_diagnoses, max_glu_serum,
#           A1Cresult, metformin, insulin, change, diabetesMed
# ---------------------------------------------------------------------------

def gen_readmission(rng: np.random.Generator) -> pd.DataFrame:
    n = 500
    # Imbalanced: ~11% readmitted
    readmitted = rng.choice(["Yes", "No"], n, p=[0.11, 0.89])
    df = pd.DataFrame({
        "age": rng.choice(
            ["[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)",
             "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"],
            n,
            p=[0.01, 0.02, 0.05, 0.08, 0.15, 0.22, 0.22, 0.16, 0.07, 0.02],
        ),
        "time_in_hospital": _round_int(_clip(rng.exponential(4.4, n), 1, 14)),
        "num_lab_procedures": _round_int(_clip(rng.normal(43, 20, n), 1, 132)),
        "num_procedures": _round_int(_clip(rng.poisson(1.3, n), 0, 6)),
        "num_medications": _round_int(_clip(rng.normal(16, 8, n), 1, 81)),
        "number_outpatient": _round_int(_clip(rng.exponential(0.4, n), 0, 42)),
        "number_emergency": _round_int(_clip(rng.exponential(0.2, n), 0, 10)),
        "number_inpatient": _round_int(_clip(rng.exponential(0.6, n), 0, 21)),
        "number_diagnoses": _round_int(_clip(rng.normal(7, 2, n), 1, 16)),
        "max_glu_serum": rng.choice(
            ["None", ">200", ">300", "Norm"],
            n, p=[0.80, 0.08, 0.05, 0.07],
        ),
        "A1Cresult": rng.choice(
            ["None", ">7", ">8", "Norm"],
            n, p=[0.75, 0.10, 0.08, 0.07],
        ),
        "metformin": rng.choice(
            ["No", "Steady", "Up", "Down"],
            n, p=[0.55, 0.35, 0.05, 0.05],
        ),
        "insulin": rng.choice(
            ["No", "Steady", "Up", "Down"],
            n, p=[0.45, 0.30, 0.15, 0.10],
        ),
        "change": rng.choice(["No", "Ch"], n, p=[0.54, 0.46]),
        "diabetesMed": rng.choice(["Yes", "No"], n, p=[0.78, 0.22]),
        "readmitted": readmitted,
    })
    return _inject_missing(df, rng, {
        "num_medications": 0.05, "num_lab_procedures": 0.04,
        "max_glu_serum": 0.06,
    })


# ---------------------------------------------------------------------------
# Registry: (dataset_filename, generator_func, seed_index)
# ---------------------------------------------------------------------------

DOMAIN_GENERATORS: List[Tuple[str, Callable[[np.random.Generator], pd.DataFrame], int]] = [
    ("heart", gen_heart, 0),
    ("chest_xray", gen_chest_xray, 1),
    ("kidney_disease", gen_kidney_disease, 2),
    ("breast_cancer", gen_breast_cancer, 3),
    ("parkinsons", gen_parkinsons, 4),
    ("diabetes", gen_diabetes, 5),
    ("liver", gen_liver, 6),
    ("stroke", gen_stroke, 7),
    ("depression", gen_depression, 8),
    ("framingham", gen_framingham, 9),
    ("anaemia", gen_anaemia, 10),
    ("dermatology", gen_dermatology, 11),
    ("diabetic_retinopathy", gen_diabetic_retinopathy, 12),
    ("spine", gen_spine, 13),
    ("sepsis", gen_sepsis, 14),
    ("fetal_health", gen_fetal_health, 15),
    ("arrhythmia", gen_arrhythmia, 16),
    ("cervical_cancer", gen_cervical_cancer, 17),
    ("thyroid", gen_thyroid, 18),
    ("readmission", gen_readmission, 19),
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    header = f"{'Dataset':<25} {'Rows':>5} {'Cols':>5} {'Missing%':>9} {'Target Dist'}"
    print(header)
    print("-" * 85)

    for dataset_name, gen_func, seed_index in DOMAIN_GENERATORS:
        seed = seed_index * 42
        rng = np.random.default_rng(seed)
        df = gen_func(rng)

        # Compute stats
        rows, cols = df.shape
        total_cells = rows * cols
        missing_cells = int(df.isna().sum().sum())
        missing_pct = (missing_cells / total_cells * 100) if total_cells > 0 else 0.0

        # Find target column (last column)
        target_col = df.columns[-1]
        vc = df[target_col].value_counts().sort_index()
        dist_str = ", ".join(
            f"{label}={int(count)}({count / rows * 100:.0f}%)"
            for label, count in vc.items()
        )

        # Save CSV
        out_path = OUTPUT_DIR / f"{dataset_name}.csv"
        df.to_csv(out_path, index=False)

        print(f"{dataset_name:<25} {rows:>5} {cols:>5} {missing_pct:>8.1f}% {dist_str}")

    print(f"\nGenerated {len(DOMAIN_GENERATORS)} datasets in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
