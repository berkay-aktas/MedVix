# Domain Coverage Plan — MedVix

All 20 clinical domains supported by MedVix, with dataset sources, target variables, and classification types.

| # | Medical Domain | Dataset | Source URL | Target Variable | Problem Type |
|---|---------------|---------|-----------|----------------|-------------|
| 1 | Cardiology — Heart Disease | Heart Disease UCI | https://www.kaggle.com/datasets/redwankarimsony/heart-disease-data | `target` (0/1) | Binary |
| 2 | Radiology — Chest X-Ray | Chest X-Ray Pneumonia | https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia | `label` (Normal/Pneumonia) | Binary |
| 3 | Nephrology — Chronic Kidney Disease | CKD Dataset | https://www.kaggle.com/datasets/mansoordaku/ckdisease | `classification` (ckd/notckd) | Binary |
| 4 | Oncology — Breast Cancer | Wisconsin Breast Cancer | https://www.kaggle.com/datasets/uciml/breast-cancer-wisconsin-data | `diagnosis` (M/B) | Binary |
| 5 | Neurology — Parkinson's | Parkinson's Disease | https://www.kaggle.com/datasets/vikasukani/parkinsons-disease-data-set | `status` (0/1) | Binary |
| 6 | Endocrinology — Diabetes | Pima Indians Diabetes | https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database | `Outcome` (0/1) | Binary |
| 7 | Hepatology — Liver Disease | Indian Liver Patient | https://www.kaggle.com/datasets/uciml/indian-liver-patient-records | `Dataset` (1/2) | Binary |
| 8 | Cardiology — Stroke | Stroke Prediction | https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset | `stroke` (0/1) | Binary |
| 9 | Mental Health — Depression | Mental Health Survey | https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey | `treatment` (Yes/No) | Binary |
| 10 | Pulmonology — COPD | COPD Severity | https://www.kaggle.com/datasets/amanajmera1/framingham-heart-study-dataset | `COPD_severity` | Multi-class |
| 11 | Haematology — Anaemia | Anaemia Dataset | https://www.kaggle.com/datasets/biswaranjanrao/anemia-dataset | `Result` (0/1) | Binary |
| 12 | Dermatology | Dermatology Dataset | https://www.kaggle.com/datasets/olcaybolat1/dermatology-dataset-classification | `class` (1-6) | Multi-class |
| 13 | Ophthalmology — Diabetic Retinopathy | Diabetic Retinopathy | https://www.kaggle.com/datasets/sovitrath/diabetic-retinopathy-224x224-2019-data | `level` (0-4) | Multi-class |
| 14 | Orthopaedics — Spine | Vertebral Column | https://www.kaggle.com/datasets/uciml/biomechanical-features-of-orthopedic-patients | `class` (Normal/Abnormal) | Binary |
| 15 | ICU / Sepsis | Sepsis Survival | https://www.kaggle.com/datasets/salikhussaini49/prediction-of-sepsis | `Sepsis` (Positive/Negative) | Binary |
| 16 | Obstetrics — Fetal Health | Fetal Health CTG | https://www.kaggle.com/datasets/andrewmvd/fetal-health-classification | `fetal_health` (1/2/3) | Multi-class |
| 17 | Cardiology — Arrhythmia | MIT-BIH Arrhythmia | https://www.kaggle.com/datasets/shayanfazeli/heartbeat | `target` (0-4) | Multi-class |
| 18 | Oncology — Cervical Cancer | Cervical Cancer Risk | https://www.kaggle.com/datasets/loveall/cervical-cancer-risk-classification | `Biopsy` (0/1) | Binary |
| 19 | Thyroid / Endocrinology | Thyroid Disease | https://www.kaggle.com/datasets/emmanuelfwerr/thyroid-disease-data | `target` (P/N) | Binary |
| 20 | Pharmacy — Readmission | Hospital Readmission | https://www.kaggle.com/datasets/dubradave/hospital-readmissions | `readmitted` (Yes/No) | Binary |

---

**Total**: 20 domains | **Binary**: 15 | **Multi-class**: 5

**Models applied to all domains**: KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes
