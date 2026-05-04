# Data Licenses and Provenance

> **Summary:** All clinical datasets bundled with MedVix are **synthetic** —
> generated programmatically by `backend/data/generate_synthetic.py` with a
> fixed random seed (`random_state=42`) for reproducibility. **No real
> patient data is included, distributed, or processed in any pipeline.**
> The application can also accept user-uploaded CSV files, which are
> processed in-memory only and never persisted to disk.

This document explains the data sources, licensing posture, and EU AI Act
data-governance alignment of the MedVix project.

---

## 1. Bundled Datasets — Synthetic, Original Work

The 20 CSV files in `backend/data/` were created from scratch by the MedVix
team using NumPy's `default_rng(seed=42)`. Each dataset's feature
distributions, class balance, and statistical properties were chosen to
mirror the published characteristics of well-known public reference
datasets (named below for educational reference only) but no rows from any
real dataset were used.

| # | Dataset file | Reference dataset (for feature schema only) | Rows | Target | License of bundled file |
|---|---|---|---|---|---|
| 1 | `heart.csv` | Heart Disease UCI | 303 | DEATH_EVENT | MIT (with project) |
| 2 | `chest_xray.csv` | Chest X-Ray Pneumonia (Kaggle) | 500 | label | MIT (with project) |
| 3 | `kidney_disease.csv` | Chronic Kidney Disease UCI | 400 | classification | MIT (with project) |
| 4 | `breast_cancer.csv` | Wisconsin Breast Cancer | 569 | diagnosis | MIT (with project) |
| 5 | `parkinsons.csv` | Parkinson's Disease UCI | 195 | status | MIT (with project) |
| 6 | `diabetes.csv` | Pima Indians Diabetes | 768 | Outcome | MIT (with project) |
| 7 | `liver.csv` | Indian Liver Patient | 583 | Dataset | MIT (with project) |
| 8 | `stroke.csv` | Stroke Prediction (Kaggle) | 500 | stroke | MIT (with project) |
| 9 | `depression.csv` | Mental Health Survey | 400 | treatment | MIT (with project) |
| 10 | `framingham.csv` | Framingham Heart Study | 500 | target | MIT (with project) |
| 11 | `anaemia.csv` | Anaemia (Kaggle) | 400 | Result | MIT (with project) |
| 12 | `dermatology.csv` | Dermatology UCI | 366 | class | MIT (with project) |
| 13 | `diabetic_retinopathy.csv` | Diabetic Retinopathy 224x224 | 500 | level | MIT (with project) |
| 14 | `spine.csv` | Vertebral Column UCI | 310 | class | MIT (with project) |
| 15 | `sepsis.csv` | PhysioNet Sepsis Survival | 500 | Sepsis | MIT (with project) |
| 16 | `fetal_health.csv` | Fetal Health CTG | 600 | fetal_health | MIT (with project) |
| 17 | `arrhythmia.csv` | MIT-BIH Arrhythmia | 500 | target | MIT (with project) |
| 18 | `cervical_cancer.csv` | Cervical Cancer Risk | 500 | Biopsy | MIT (with project) |
| 19 | `thyroid.csv` | Thyroid Disease UCI | 500 | target | MIT (with project) |
| 20 | `readmission.csv` | Hospital Readmission | 500 | readmitted | MIT (with project) |

**Reproducibility guarantee.** Re-running
`python backend/data/generate_synthetic.py` from a clean checkout regenerates
the bundled CSVs byte-for-byte, because every random draw is seeded.

**Why synthetic?** Three reasons:

1. **Privacy by design.** No clinical dataset that we evaluated could be
   redistributed under a permissive license alongside an open-source codebase.
   Synthetic generation eliminates the question entirely.
2. **Educational fidelity.** The synthetic distributions are intentionally
   close enough to the real reference distributions that the ML pipeline
   produces realistic learning curves, comparable confusion matrices, and
   plausible SHAP feature rankings — students see the same lessons they
   would see on real data, including class imbalance, multicollinearity,
   and bias against under-represented subgroups.
3. **Reproducibility.** Every metric in every sprint test report can be
   reproduced from a fixed seed. There is no "the dataset changed" failure
   mode in the test suite.

---

## 2. User-Uploaded Data

MedVix accepts CSV uploads up to 50 MB, with at least 10 rows and at least
one numeric column.

- **Storage:** None. Uploaded files are parsed into pandas DataFrames in
  the backend session memory and never written to disk.
- **Retention:** Sessions expire after 60 minutes of inactivity. On expiry
  the DataFrame and any trained models are removed from memory.
- **Sharing:** Uploaded data never leaves the backend container. It is not
  forwarded to any third-party service.
- **Logging:** No row content is logged. Only structural metadata (column
  count, row count, missing-value count) is written to application logs.

We recommend users upload only **already-deidentified or synthetic**
datasets and explicitly warn against uploading data that has not been
through their institution's privacy review.

---

## 3. EU AI Act Alignment (Reg. 2024/1689)

MedVix is positioned as an educational research prototype, not a deployed
high-risk AI system. Nonetheless, the following articles are addressed in
the design:

| Article | Topic | Where it lives in MedVix |
|---|---|---|
| Art. 10 | Data and data governance | This file + reproducible synthetic generator |
| Art. 11 | Technical documentation | `docs/architecture/`, this file, sprint reports |
| Art. 13 | Transparency to users | "ML cannot do" banner in Step 1, "AI limitation" cards in every clinical context |
| Art. 14 | Human oversight | Bias-detection banner in Step 7 with a "this model should not be deployed" warning |
| Art. 15 | Accuracy, robustness, cybersecurity | Sprint 5 testing report; bias subgroup audit; in-memory session model |
| Art. 50 | Transparency obligations for AI systems interacting with people | Privacy notice on every screen, in-app glossary, certificate disclosure |

Step 7 of the application implements an interactive 8-item EU AI Act
compliance checklist; the Summary Certificate PDF records the final
state of those checks at the time of generation.

---

## 4. Third-Party Library Data Usage Notes

Some bundled libraries internally include cached models or auxiliary
datasets:

- **scikit-learn** — ships only synthetic toy datasets (e.g., `iris`,
  `digits`); not used by MedVix at runtime.
- **SHAP** — uses the trained model's own statistics; no external data.
- **imbalanced-learn (SMOTE)** — synthesizes new minority-class points
  *from* the user's training set; no external data.

No internet calls are made from the backend at request time. All ML
operations are deterministic given the user's data and the seeded RNG.

---

## 5. Reporting Concerns

If you believe a license has been misapplied or a dataset has been
incorrectly described, please open an issue on the
[GitHub repository](https://github.com/berkay-aktas/MedVix/issues) so the
team can correct the record.
