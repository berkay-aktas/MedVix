# MedVix — ML Visualization Tool for Healthcare Professionals

> An interactive 7-step pipeline for training, evaluating, and explaining machine learning models across 20 clinical specialties.

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![SHAP](https://img.shields.io/badge/SHAP-0.46-FF6F61?style=flat-square)](https://shap.readthedocs.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-HuggingFace%20Spaces-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://bewrkay-medvix.hf.space)

**Live Demo:** [https://bewrkay-medvix.hf.space](https://bewrkay-medvix.hf.space)

MedVix is a web-based clinical decision-support learning tool that guides healthcare professionals, students, and researchers through a complete machine learning workflow — from selecting a medical specialty and exploring data, through model training and evaluation, to SHAP-based explanations and EU AI Act ethics compliance — all without writing a single line of code.

Built as part of **SENG 430 — Software Quality Assurance Laboratory** at Cankaya University, MedVix combines production-quality software engineering practices (CI/CD, automated testing, containerization, accessibility) with the educational goal of making ML transparency accessible in clinical contexts.

---

## Table of Contents

- [Features](#features)
- [The 7-Step Pipeline](#the-7-step-pipeline)
- [20 Clinical Domains](#20-clinical-domains)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Branching Strategy](#branching-strategy)
- [Sprint Progress](#sprint-progress)
- [Team](#team)
- [Links](#links)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

MedVix covers the full lifecycle of a clinical ML project through seven guided steps. Each step is independently navigable and persists state across the session.

| Step | Name | Key Capabilities |
|------|------|-----------------|
| 1 | Clinical Context | Choose from 20 medical specialties; view clinical question, target variable, dataset info, and domain glossary |
| 2 | Data Exploration | CSV upload (up to 50 MB) or one-click built-in dataset loading; automatic column type detection; quality scoring (completeness, duplicates, cardinality, class balance); column role mapper (feature / target / ignore) |
| 3 | Data Preparation | Configurable train/test split (10–40%); missing-value strategies per column (median, mode, row removal); normalisation (z-score / min-max / none); SMOTE oversampling; outlier detection; before/after statistics comparison |
| 4 | Model & Parameters | 8 ML models (KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes, XGBoost, LightGBM); interactive hyperparameter sliders; auto-retrain on change; side-by-side model comparison |
| 5 | Results & Evaluation | Accuracy, Sensitivity (Recall), Specificity, Precision, F1-Score, AUC-ROC; confusion matrix heatmap; ROC and Precision-Recall curves; k-fold cross-validation summary |
| 6 | Explainability | Global SHAP feature importance bar chart; single-patient waterfall plot; feature contribution ranked table; plain-English interpretation tooltips |
| 7 | Ethics & Bias | Subgroup fairness table (age, sex, and domain-specific groups); EU AI Act risk-tier compliance checklist; curated AI failure case studies; downloadable PDF ethics summary certificate |

---

## The 7-Step Pipeline

### Step 1 — Clinical Context

The pipeline begins with domain selection. Users choose one of 20 medical specialties. Each domain presents:

- The **clinical question** being modelled (e.g., "Is this patient at risk for Type 2 diabetes?")
- The **target variable** and problem type (binary classification, multiclass)
- Dataset dimensions (rows, features) and class distribution
- A curated **glossary** of domain-specific clinical terms

This step sets the domain context for all subsequent steps and pre-populates sensible defaults for data loading, column mapping, and model selection.

### Step 2 — Data Exploration

Users upload their own CSV dataset or load one of 20 built-in synthetic datasets. The backend validates the file (format, encoding, minimum row/column count) and returns:

- **Per-column statistics**: type, missing-value rate (green < 5%, amber 5–30%, red > 30%), unique value count, min/max/mean/std for numerics
- **Class distribution**: target variable value counts with imbalance warnings when the minority class falls below 30%
- **Data quality score** (0–100): a weighted composite of completeness (40%), duplicate rows (20%), constant columns (15%), high-cardinality columns (15%), and class balance (10%)
- **Column Role Mapper**: drag-and-drop interface to assign each column as `feature`, `target`, or `ignore`

### Step 3 — Data Preparation

The preparation pipeline applies a reproducible sequence of transformations:

1. Select feature and target columns from the validated mapping
2. Handle missing values column-by-column (median imputation, mode imputation, or row removal)
3. Encode the target variable with `LabelEncoder`; one-hot encode categorical features
4. Stratified train/test split at the user-chosen ratio
5. Normalise numeric features with the selected scaler (Standard / MinMax / none), fitted only on training data and applied to both splits
6. Apply SMOTE on the training set when enabled and class imbalance is detected
7. Return before/after statistics per column for audit transparency

### Step 4 — Model and Parameters

Users select one of eight ML models and tune hyperparameters via interactive sliders. Changes trigger automatic retraining so users can observe the effect in real time:

| Model | Tunable Hyperparameters |
|-------|------------------------|
| K-Nearest Neighbours | n_neighbors, weights, metric |
| Support Vector Machine | C, kernel, gamma |
| Decision Tree | max_depth, min_samples_split, criterion |
| Random Forest | n_estimators, max_depth, min_samples_split |
| Logistic Regression | C, solver, max_iter |
| Naive Bayes | var_smoothing (Gaussian) |
| XGBoost | n_estimators, max_depth, learning_rate, subsample |
| LightGBM | n_estimators, max_depth, learning_rate, num_leaves |

The model comparison view displays all trained models side-by-side on a radar chart of normalised metric scores.

### Step 5 — Results and Evaluation

The results view computes six classification metrics on the held-out test set:

- **Accuracy**: overall correct predictions
- **Sensitivity (Recall)**: true positive rate — critical for clinical screening
- **Specificity**: true negative rate
- **Precision**: positive predictive value
- **F1-Score**: harmonic mean of precision and recall
- **AUC-ROC**: area under the receiver operating characteristic curve

Visualisations include a colour-coded confusion matrix, interactive ROC curve (multiple models overlaid), and a Precision-Recall curve. k-fold cross-validation (default k=5) reports mean ± standard deviation for each metric to surface overfitting.

### Step 6 — Explainability

SHAP (SHapley Additive exPlanations) values are computed post-training to explain model predictions:

- **Global feature importance**: bar chart of mean absolute SHAP values ranked by contribution
- **Single-patient waterfall**: select any row from the test set and view how each feature pushed the prediction toward or away from the positive class
- **Feature contribution table**: sortable ranked list with SHAP value and direction (positive/negative impact)

SHAP values are model-agnostic and computed using `shap.TreeExplainer` for tree-based models and `shap.LinearExplainer` for linear models.

### Step 7 — Ethics and Bias

The final step surfaces fairness and compliance considerations:

- **Subgroup fairness table**: performance metrics (accuracy, sensitivity, specificity) stratified by protected attributes (age group, sex, domain-specific subgroups), with disparity flags when subgroup performance diverges by more than 10 percentage points from the overall metric
- **EU AI Act compliance checklist**: interactive checklist mapping the application to the EU AI Act risk tier framework, covering data governance, human oversight, transparency, accuracy documentation, and logging
- **AI failure case studies**: curated real-world examples of ML failures in clinical settings, presented as educational callouts
- **PDF certificate**: downloadable one-page ethics summary including model identity, dataset provenance, metric snapshot, fairness flags, and compliance attestation

---

## 20 Clinical Domains

Each domain ships with a pre-generated synthetic dataset derived from publicly available clinical data distributions. All built-in datasets are stored in `backend/data/` and loaded on demand with no internet access required.

| # | Domain ID | Specialty | Clinical Question | Rows | Features | Classes | Positive Rate |
|---|-----------|-----------|-------------------|------|----------|---------|---------------|
| 1 | `cardiology` | Cardiology | Coronary artery disease present? | 303 | 13 | 2 | 54% |
| 2 | `radiology` | Radiology | Chest X-ray indicates pneumonia? | 5 856 | 12 | 2 | 62% |
| 3 | `nephrology` | Nephrology | Chronic kidney disease present? | 400 | 24 | 2 | 62% |
| 4 | `oncology-breast` | Oncology | Breast mass malignant or benign? | 569 | 30 | 2 | 37% |
| 5 | `neurology` | Neurology | Voice pattern suggests Parkinson's? | 195 | 22 | 2 | 75% |
| 6 | `endocrinology` | Endocrinology | Patient at risk for Type 2 diabetes? | 768 | 8 | 2 | 35% |
| 7 | `hepatology` | Hepatology | Signs of liver disease? | 583 | 10 | 2 | 71% |
| 8 | `cardiology-stroke` | Cardiology | Elevated stroke risk? | 5 110 | 10 | 2 | 5% |
| 9 | `mental-health` | Mental Health | Signs of clinical depression? | 2 000 | 14 | 2 | 40% |
| 10 | `pulmonology` | Pulmonology | Chronic obstructive pulmonary disease? | 1 200 | 12 | 2 | 45% |
| 11 | `haematology` | Haematology | Anaemia from blood parameters? | 1 500 | 10 | 2 | 42% |
| 12 | `dermatology` | Dermatology | Skin lesion potentially malignant? | 900 | 11 | 2 | 33% |
| 13 | `ophthalmology` | Ophthalmology | Signs of diabetic retinopathy? | 1 151 | 19 | 2 | 53% |
| 14 | `orthopaedics` | Orthopaedics | Spinal abnormality present? | 310 | 6 | 3 | 48% |
| 15 | `icu-sepsis` | ICU / Critical Care | ICU patient at risk of sepsis? | 4 000 | 15 | 2 | 12% |
| 16 | `obstetrics` | Obstetrics | Fetal health classification from CTG? | 2 126 | 21 | 3 | 78% |
| 17 | `cardiology-arrhythmia` | Cardiology | Cardiac arrhythmia present? | 452 | 16 | 2 | 54% |
| 18 | `oncology-cervical` | Oncology | Cervical cancer risk? | 858 | 15 | 2 | 8% |
| 19 | `thyroid` | Endocrinology | Thyroid disorder present? | 3 772 | 21 | 2 | 16% |
| 20 | `pharmacy` | Pharmacy | 30-day hospital readmission risk? | 10 000 | 18 | 2 | 11% |

> Note: Domains 8 (Stroke, 5%), 15 (Sepsis, 12%), 18 (Cervical, 8%), and 20 (Readmission, 11%) are intentionally class-imbalanced to demonstrate SMOTE's practical value in clinical data preparation.

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18 | Component-based SPA framework |
| Vite | 6 | Build tool and development server |
| Tailwind CSS | 3 | Utility-first design system |
| Zustand | 5 | Global client-side state management |
| Recharts | 2.12 | Charts (ROC curve, confusion matrix, bar charts) |
| Lucide React | latest | Icon set (WCAG-compliant SVG icons) |
| React Dropzone | latest | CSV file drag-and-drop upload |
| React Router | 6 | Step-based navigation (hash routing) |

### Backend

| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.115.6 | Async REST API framework |
| Uvicorn | 0.34.0 | ASGI server with hot-reload |
| Pydantic | 2.10.4 | Request/response schema validation |
| pandas | 2.2.3 | DataFrame operations, CSV parsing |
| NumPy | 2.2.3 | Numerical computation |
| scikit-learn | 1.6.1 | ML models, preprocessing, metrics |
| SHAP | 0.46.0 | Model explainability |
| imbalanced-learn | 0.13.0 | SMOTE oversampling |
| XGBoost | 2.0+ | Gradient boosted trees |
| LightGBM | 4.3+ | Fast gradient boosting |
| python-multipart | 0.0.20 | Multipart form / file upload parsing |

### Infrastructure

| Tool | Purpose |
|------|---------|
| Docker | Multi-stage production image |
| docker-compose | Local development orchestration |
| Nginx | Static file serving + API reverse proxy |
| HuggingFace Spaces | Public live deployment (port 7860) |
| Render | Alternative cloud deployment (render.yaml) |
| pytest + httpx | Backend integration test suite |
| GitHub Actions | CI pipeline (lint, test, build) |

---

## Architecture

MedVix follows a classic **client-server SPA architecture** with clear separation between the React frontend, the FastAPI backend, and a stateless session layer. All communication uses JSON over HTTP REST.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                           │
│                                                                 │
│  Step1 → Step2 → Step3 → Step4 → Step5 → Step6 → Step7         │
│                                                                 │
│  Zustand Stores:                                                │
│  usePipelineStore  useDataStore  usePreparationStore            │
│  useMLStore        useModalStore                                │
│                                                                 │
│  API Client (src/utils/api.js) — fetch() with session_id        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / JSON
                    (CORS: localhost:5173)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     FastAPI Application                         │
│                     (Uvicorn, port 8000)                        │
│                                                                 │
│  Routers          Services               Models                 │
│  ─────────────    ─────────────────────  ─────────────────────  │
│  GET  /health     domain_service         DomainSummary          │
│  /api/domains     data_service           DomainDetail           │
│  /api/data        preparation_service    DataSummary            │
│                   session_service        PreparationConfig      │
│                                          PreparationResult      │
│                                          SessionState           │
│                                                                 │
│  In-Memory Session Store (dict[session_id → SessionState])      │
│  TTL: 60 minutes, auto-cleanup on startup/shutdown              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   ┌─────────▼──────────┐
                   │   backend/data/    │
                   │   20 × .csv files  │
                   │   (synthetic)      │
                   └────────────────────┘
```

### Frontend Architecture

The frontend is a single-page application using **hash-based routing** for step navigation. State is distributed across five Zustand stores:

- `usePipelineStore` — current step index, navigation guards, overall pipeline state
- `useDataStore` — session ID, loaded dataset metadata, column mapping, summary stats
- `usePreparationStore` — preparation configuration (split ratio, imputation strategy, normalisation, SMOTE) and results
- `useMLStore` — trained model registry, selected hyperparameters, evaluation metrics
- `useModalStore` — open/close state for all application modals (glossary, column mapper, error dialogs)

Components are split into three tiers:

- `src/components/ui/` — primitive elements (Button, Badge, Card, Tooltip, ProgressBar)
- `src/components/layout/` — Stepper header, Sidebar, PageWrapper
- `src/components/modals/` — GlossaryModal, ColumnMapperModal, ConfirmModal
- `src/pages/Step{1-7}/` — page-level components, one directory per pipeline step

### Backend Architecture

The FastAPI backend uses a **service-layer pattern**: routers handle HTTP concerns (parsing, status codes, error responses), while services contain all business logic:

- `domain_service` — loads domain metadata from an in-memory registry keyed by domain ID
- `data_service` — CSV validation, built-in dataset loading, column statistics, quality scoring, column mapping validation
- `preparation_service` — the 10-stage preparation pipeline (imputation → encoding → split → normalisation → SMOTE)
- `session_service` — UUID-keyed in-memory session store with 60-minute TTL, automatic cleanup

**Session Management**: Rather than a database, the backend uses an in-memory dictionary of `SessionState` objects. Each session stores the raw DataFrame, the target column, feature columns, schema validation status, and all arrays produced by the preparation pipeline (`X_train`, `X_test`, `y_train`, `y_test`). Sessions are created on data upload or built-in dataset load, and their `session_id` UUID is returned to the client for use on all subsequent requests.

### Deployment Architecture (Production)

In production (HuggingFace Spaces and Render), a **multi-stage Docker build** produces a single container:

1. **Stage 1 (`backend-build`)**: Python 3.12 slim, installs Python dependencies
2. **Stage 2 (`frontend-build`)**: Node 20 alpine, runs `npm ci && npm run build` to produce static assets
3. **Stage 3 (runtime)**: Python 3.12 slim + Nginx; copies the Python site-packages from Stage 1, the built frontend from Stage 2, and the backend source. A startup script launches Uvicorn on port 8000 and Nginx on port 7860. Nginx serves the React SPA directly and reverse-proxies `/api/`, `/docs`, `/health`, and `/openapi.json` to Uvicorn.

```
Single Container (port 7860)
├── Nginx (static + proxy)
│   ├── /            → /usr/share/nginx/html  (React SPA)
│   ├── /api/*       → http://127.0.0.1:8000/api/*
│   ├── /docs        → http://127.0.0.1:8000/docs
│   └── /health      → http://127.0.0.1:8000/health
└── Uvicorn (port 8000, internal only)
    └── FastAPI app
```

---

## API Reference

The FastAPI backend exposes a fully documented REST API. Interactive Swagger UI is available at `/docs`; ReDoc is available at `/redoc`.

All data endpoints require a `session_id` query parameter or request body field. Sessions are created by `POST /api/data/upload` or `POST /api/data/builtin` and expire after 60 minutes of inactivity.

### Health

| Method | Endpoint | Description | Response |
|--------|----------|-------------|---------|
| `GET` | `/health` | Service health check | `{"status": "ok", "version": "0.1.0"}` |

### Clinical Context (Step 1)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/domains` | List all 20 clinical domains | — | `DomainListResponse` |
| `GET` | `/api/domains/{domain_id}` | Full metadata for one domain | path: `domain_id` | `DomainDetail` |

**`DomainDetail` fields**: `id`, `name`, `icon`, `subtitle`, `short_description`, `clinical_question`, `target_variable`, `problem_type` (`binary`/`multiclass`), `dataset_name`, `key_variables[]`, `dataset_info` (rows, features, classes, positive_rate), `glossary[]`

### Data Exploration (Step 2)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `POST` | `/api/data/upload` | Upload a CSV file | `multipart/form-data`: `file`, query `domain_id` | `UploadResponse` |
| `POST` | `/api/data/builtin` | Load a built-in dataset | `{"domain_id": "cardiology"}` | `UploadResponse` |
| `GET` | `/api/data/summary` | Per-column stats and quality score | query `session_id` | `DataSummary` |
| `POST` | `/api/data/column-mapping` | Validate and store column roles | `ColumnMapperRequest` | `ColumnMapperResponse` |
| `GET` | `/api/data/preview` | First N rows of dataset | query `session_id`, `rows` (default 5, max 100) | `DataPreviewResponse` |

**`UploadResponse` fields**: `session_id`, `filename`, `file_size_kb`, `row_count`, `column_count`, `message`

**`DataSummary` fields**: `session_id`, `row_count`, `column_count`, `columns[]` (per-column stats), `class_distribution{}`, `quality_score` (0–100), `quality_breakdown{}`, `warnings[]`

**`ColumnMapperRequest` fields**: `session_id`, `target_column`, `mappings[]` (each: `csv_column`, `role` — `feature`/`target`/`ignore`)

**Upload constraints**: CSV only, maximum 50 MB, minimum 10 rows, minimum 1 numeric column. Returns HTTP 400 for invalid type, HTTP 413 for oversized files, HTTP 422 for CSV parse errors.

### Data Preparation (Step 3)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `POST` | `/api/data/prepare` | Run the full preparation pipeline | `PreparationConfig` | `PreparationResult` |
| `GET` | `/api/data/preparation-status` | Check whether preparation has run | query `session_id` | `PreparationStatusResponse` |

**`PreparationConfig` fields**: `session_id`, `test_size` (0.10–0.40, default 0.20), `missing_strategy` (`median`/`mode`/`remove`), `normalisation` (`zscore`/`minmax`/`none`), `apply_smote` (boolean), `random_state` (integer seed)

**`PreparationResult` fields**: `session_id`, `train_rows`, `test_rows`, `feature_count`, `columns_before[]`, `columns_after[]` (before/after stats per numeric column), `normalisation_result`, `smote_result` (null if not applied), `warnings[]`

**`PreparationStatusResponse` fields**: `session_id`, `is_prepared`, `train_rows` (null if not prepared), `test_rows` (null if not prepared)

**Prerequisite**: Column mapping must be validated (`schema_ok: true`) before `/api/data/prepare` will accept the request.

### Error Responses

All error responses follow a consistent envelope:

```json
{
  "detail": "Human-readable error message",
  "error_code": "VALIDATION_ERROR | NOT_FOUND | INTERNAL_ERROR"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Invalid input, schema not validated, or unknown domain |
| 404 | Session not found or domain not found |
| 413 | Uploaded file exceeds 50 MB limit |
| 422 | CSV cannot be parsed or Pydantic validation failed |
| 500 | Unhandled internal error (logged server-side) |

### Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI schema**: `http://localhost:8000/openapi.json`

The Swagger UI allows executing all endpoints directly from the browser with full request/response schema documentation, example payloads, and authentication configuration.

---

## Quick Start

### Prerequisites

| Tool | Required Version | Installation |
|------|-----------------|-------------|
| Python | 3.12+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org/) |
| Git | 2.40+ | [git-scm.com](https://git-scm.com/) |
| Docker | 24+ | [docker.com](https://www.docker.com/) (optional) |

### Option 1 — Docker (Recommended)

The fastest path to a running instance. Requires Docker Desktop.

```bash
git clone https://github.com/berkay-aktas/MedVix.git
cd MedVix

docker compose up --build
```

Services started:

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |

Stop all services:

```bash
docker compose down
```

### Option 2 — Manual Setup

Run the backend and frontend in separate terminal sessions.

**Terminal 1 — Backend**

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows

# Install Python dependencies
pip install -r requirements.txt

# Start the development server with hot-reload
uvicorn app.main:app --reload --port 8000
```

Verify the backend is running:

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"0.1.0"}
```

**Terminal 2 — Frontend**

```bash
cd frontend

npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables

Create a `.env` file in the project root (not committed to version control):

```env
# Backend
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173

# Frontend (.env inside frontend/)
VITE_API_URL=http://localhost:8000
```

The backend reads `ENVIRONMENT` to toggle debug logging. The frontend reads `VITE_API_URL` to locate the API base URL; it defaults to `http://localhost:8000` if not set.

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ModuleNotFoundError: No module named 'app'` | Working directory is wrong | Run `uvicorn` from inside `backend/`, not the project root |
| Port 8000 already in use | Another process on the port | `lsof -i :8000` then `kill -9 <PID>` |
| Port 5173 already in use | Another Vite dev server | `lsof -i :5173` then `kill -9 <PID>` |
| CORS errors in browser console | Frontend URL not in allow-list | Confirm `CORS_ORIGINS` matches your browser URL exactly |
| Docker build fails on M1/M2 Mac | Platform mismatch | Prepend `DOCKER_DEFAULT_PLATFORM=linux/amd64` to `docker compose up` |
| `npm install` peer dependency errors | Node version mismatch | Use Node 20 LTS; run `nvm use 20` if using nvm |
| CSV upload returns 422 | BOM or encoding issues | Re-save CSV as UTF-8 without BOM in Excel or VS Code |

---

## Project Structure

```
MedVix/
├── backend/
│   ├── app/
│   │   ├── main.py                 FastAPI application entry point, CORS, lifespan
│   │   ├── models/                 Pydantic schemas (request/response models)
│   │   │   ├── data.py             UploadResponse, DataSummary, ColumnMapper*
│   │   │   ├── domain.py           DomainSummary, DomainDetail, DomainListResponse
│   │   │   ├── preparation.py      PreparationConfig, PreparationResult, SmoteResult
│   │   │   └── session.py          SessionState (in-memory session object)
│   │   ├── routers/                HTTP route handlers (thin layer, no business logic)
│   │   │   ├── health.py           GET /health
│   │   │   ├── domains.py          GET /api/domains, GET /api/domains/{id}
│   │   │   ├── data.py             POST/GET /api/data/upload|builtin|summary|...
│   │   │   └── preparation.py      POST /api/data/prepare, GET /api/data/preparation-status
│   │   ├── services/               Business logic layer
│   │   │   ├── domain_service.py   Domain registry and lookup
│   │   │   ├── data_service.py     CSV validation, summary computation, quality score
│   │   │   ├── preparation_service.py  10-stage preparation pipeline
│   │   │   └── session_service.py  In-memory session store with TTL cleanup
│   │   └── utils/
│   │       ├── constants.py        Thresholds, limits, quality score weights
│   │       └── validators.py       Shared validation helpers
│   ├── data/                       20 synthetic CSV datasets (one per domain)
│   │   ├── heart.csv               cardiology
│   │   ├── chest_xray.csv          radiology
│   │   ├── kidney_disease.csv      nephrology
│   │   ├── breast_cancer.csv       oncology-breast
│   │   ├── parkinsons.csv          neurology
│   │   ├── diabetes.csv            endocrinology
│   │   ├── liver.csv               hepatology
│   │   ├── stroke.csv              cardiology-stroke
│   │   ├── depression.csv          mental-health
│   │   ├── ... (20 total)
│   │   └── generate_synthetic.py   Script used to produce the datasets
│   ├── tests/
│   │   ├── conftest.py             pytest fixtures (TestClient, ALL_DOMAIN_IDS)
│   │   ├── test_step1_clinical_context.py   Step 1 endpoint tests
│   │   ├── test_step2_data_exploration.py   Step 2 upload/summary/mapping tests
│   │   └── test_step3_data_preparation.py   Step 3 pipeline tests
│   ├── requirements.txt
│   └── Dockerfile                  Backend-only Dockerfile (used by docker-compose)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                React application entry point
│   │   ├── App.jsx                 Router setup, global providers
│   │   ├── index.css               Tailwind base imports, global styles
│   │   ├── components/
│   │   │   ├── ui/                 Button, Card, Badge, Tooltip, ProgressBar, Spinner
│   │   │   ├── layout/             Stepper, Sidebar, PageWrapper, Header
│   │   │   └── modals/             GlossaryModal, ColumnMapperModal, ConfirmModal
│   │   ├── pages/
│   │   │   ├── Step1ClinicalContext/
│   │   │   ├── Step2DataExploration/
│   │   │   ├── Step3DataPreparation/
│   │   │   ├── Step4ModelParameters/
│   │   │   └── Step5Results/
│   │   ├── stores/                 Zustand state stores
│   │   │   ├── usePipelineStore.js     Step navigation and pipeline-wide state
│   │   │   ├── useDataStore.js         Session, dataset metadata, column mapping
│   │   │   ├── usePreparationStore.js  Preparation config and results
│   │   │   ├── useMLStore.js           Trained models and evaluation metrics
│   │   │   └── useModalStore.js        Modal open/close state
│   │   └── utils/
│   │       ├── api.js              Centralised fetch wrapper with base URL and error handling
│   │       ├── domains.js          Static domain definitions (gradients, icons, clinical questions)
│   │       ├── glossary.js         Clinical term definitions
│   │       ├── steps.js            Step metadata (labels, descriptions, icons)
│   │       └── validators.js       Client-side validation helpers
│   ├── index.html
│   ├── package.json
│   └── Dockerfile                  Frontend build + Nginx serve (used by docker-compose)
│
├── docs/
│   ├── architecture/               C4 context/container diagrams, data-flow, API diagrams
│   │   ├── architecture-diagrams.md
│   │   └── architecture-diagrams.pdf
│   ├── domain-coverage-plan.pdf    20-domain dataset specification
│   ├── jira-product-backlog.md     Full product backlog with acceptance criteria
│   └── wireframes/                 Figma export PNGs (all 7 steps)
│
├── scripts/                        Utility scripts (data generation, etc.)
├── Dockerfile                      Multi-stage production build (frontend + backend in one image)
├── docker-compose.yml              Development orchestration (separate frontend/backend containers)
├── render.yaml                     Render.com deployment blueprint (single Docker service)
├── SETUP.md                        Extended setup guide with IDE recommendations
└── README.md                       This file
```

---

## Testing

The backend test suite is built with **pytest** and **httpx** using FastAPI's `TestClient`. All tests run against the real application with in-memory state — no mocking of business logic.

### Running Tests

```bash
cd backend

# Install test dependencies if not already installed
pip install pytest httpx

# Run all tests with verbose output
pytest tests/ -v

# Run a specific step's tests
pytest tests/test_step1_clinical_context.py -v
pytest tests/test_step2_data_exploration.py -v
pytest tests/test_step3_data_preparation.py -v

# Run with coverage report
pip install pytest-cov
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Test Coverage by Step

**Step 1 — Clinical Context** (`test_step1_clinical_context.py`, ~169 lines)

| Test Class | What is covered |
|------------|----------------|
| `TestDomainEndpoints` | `GET /api/domains` returns HTTP 200 with exactly 20 domains |
| | Every domain summary contains the required frontend fields (`id`, `name`, `icon`, `short_description`, `target_variable`, `problem_type`) |
| | All 20 domain IDs are unique |
| | `GET /api/domains/{id}` returns correct domain for all 20 domain IDs |
| | Domain detail includes `clinical_question`, `key_variables`, `dataset_info` |
| | Returns HTTP 404 for an unknown domain ID |
| | `problem_type` is either `binary` or `multiclass` for every domain |
| | All 20 built-in dataset files exist on disk |

**Step 2 — Data Exploration** (`test_step2_data_exploration.py`, ~369 lines)

| Test Class | What is covered |
|------------|----------------|
| `TestFileUpload` | Valid CSV creates a session and returns correct row/column counts |
| | Non-CSV file returns HTTP 400 |
| | Empty file returns HTTP 400 |
| | File exceeding 50 MB limit returns HTTP 413 |
| | File with too few rows (< 10) returns HTTP 400 |
| | Unknown domain ID returns HTTP 400 |
| `TestBuiltinDatasets` | All 20 built-in datasets load successfully |
| | Each built-in dataset returns expected row/column count |
| | Response includes a valid session ID |
| `TestDataSummary` | Summary returns quality score between 0 and 100 |
| | All summary columns include `missing_rate`, `dtype`, `unique_count` |
| | Class distribution is returned for the target column |
| | Quality breakdown includes completeness, duplicates, cardinality, balance |
| | Invalid session ID returns HTTP 404 |
| `TestColumnMapping` | Valid feature/target mapping returns `schema_ok: true` |
| | Mapping with no target column returns a warning |
| | Mapping with only one feature returns a warning |
| | Invalid session ID returns HTTP 404 |
| `TestDataPreview` | Default 5 rows returned |
| | Custom `rows=20` parameter respected |
| | Response includes `total_rows` matching the full dataset |

**Step 3 — Data Preparation** (`test_step3_data_preparation.py`, ~319 lines)

| Test Class | What is covered |
|------------|----------------|
| `TestPreparationPipeline` | Default config produces `train_rows + test_rows == total_rows` |
| | `test_size=0.30` produces a 70/30 split |
| | Median imputation: missing values removed from training and test arrays |
| | Mode imputation applied to categorical columns |
| | Row-removal strategy reduces total rows |
| | Z-score normalisation: training features have mean ≈ 0, std ≈ 1 |
| | Min-max normalisation: training features bounded to [0, 1] |
| | `normalisation=none` leaves feature values unchanged |
| | SMOTE enabled: minority class count in training set increases |
| | SMOTE disabled: class counts match raw split |
| | `is_prepared=true` on preparation status after successful run |
| | `schema_ok` guard: prepare fails with HTTP 400 if column mapping not validated |
| | Invalid session ID returns HTTP 404 |
| | `test_size` out of range (< 0.10 or > 0.40) returns HTTP 422 |

### Test Philosophy

Tests interact exclusively through the HTTP API layer using `TestClient`. This means:

- Tests verify the full request-response cycle, including middleware, routing, error handling, and Pydantic validation
- Business logic is not unit-tested in isolation; correctness is verified through observed API behaviour
- Fixture `conftest.py` provides a fresh `TestClient` per test function and a constant `ALL_DOMAIN_IDS` list used to parameterise domain-coverage assertions

---

## Accessibility

MedVix targets **WCAG 2.1 Level AA** compliance. Accessibility is verified using Lighthouse (target score >= 80) and the axe browser extension during development.

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | Minimum 4.5:1 contrast ratio for all text; verified against Tailwind palette |
| Keyboard navigation | Full keyboard traversal through the stepper, domain picker, modals, and form controls |
| Focus management | Focus trap in all modal dialogs; focus returns to trigger element on close |
| ARIA labels | `aria-label` on all icon buttons, `aria-describedby` on all form inputs |
| Screen reader support | Semantic HTML (`<nav>`, `<main>`, `<section>`, `<table>`) with `role` attributes on custom components |
| Form error messages | Inline error text associated with inputs via `aria-describedby`; no color-only error indication |
| Motion | Respects `prefers-reduced-motion` — transitions disabled for users who have opted out |
| Chart accessibility | Recharts charts include `aria-label` and a visually hidden data table for screen readers |
| Skip navigation | Skip-to-main-content link at the top of every page |

Accessibility testing workflow:

```bash
# Run Lighthouse against the local dev server
npx lighthouse http://localhost:5173 --only-categories=accessibility --output=json

# Run axe-core via CLI
npx axe http://localhost:5173
```

---

## Deployment

### HuggingFace Spaces (Live)

The production deployment runs on HuggingFace Spaces at [https://bewrkay-medvix.hf.space](https://bewrkay-medvix.hf.space). The Spaces platform builds and runs the production `Dockerfile` at the project root. The container listens on port 7860 (required by HuggingFace).

Deployment is triggered automatically when commits are pushed to the `main` branch.

### Docker (Self-Hosted)

Use the production `Dockerfile` at the project root to build a self-contained image:

```bash
# Build the production image
docker build -t medvix:latest .

# Run it locally
docker run -p 7860:7860 medvix:latest

# Open http://localhost:7860
```

The multi-stage build (Python backend-build → Node frontend-build → Python runtime with Nginx) produces a single image that serves the React SPA on port 7860 and proxies API calls to the internal Uvicorn process.

### Render

A `render.yaml` blueprint is included for one-click deployment to [Render](https://render.com):

```bash
# Deploy to Render via the CLI
render up
```

The `render.yaml` specifies a single `web` service of type `docker` using the project root `Dockerfile`, with the `ENVIRONMENT=production` environment variable set.

### Development (docker-compose)

For local development with hot-reload on both services:

```bash
docker compose up --build
```

This starts two separate containers: the FastAPI backend with volume-mounted source (Uvicorn `--reload`) and the Vite frontend dev server with volume-mounted source (HMR). The `frontend` service depends on `backend` so the backend starts first.

---

## Configuration

### Backend Constants (`backend/app/utils/constants.py`)

Key thresholds and limits that control application behaviour:

| Constant | Default | Description |
|----------|---------|-------------|
| `MAX_FILE_SIZE_MB` | 50 | Maximum CSV upload size |
| `MIN_ROWS` | 10 | Minimum rows required in an uploaded dataset |
| `MISSING_GREEN_THRESHOLD` | 0.05 | Missing rate < 5% shown as green |
| `MISSING_AMBER_THRESHOLD` | 0.30 | Missing rate 5–30% shown as amber; > 30% is red |
| `IMBALANCE_THRESHOLD` | 0.30 | Minority class < 30% triggers imbalance warning |
| `DEFAULT_TEST_SIZE` | 0.20 | Default 80/20 train/test split |
| `MIN_TEST_SIZE` | 0.10 | Minimum allowed test split |
| `MAX_TEST_SIZE` | 0.40 | Maximum allowed test split |
| `SESSION_MAX_AGE_MINUTES` | 60 | Session TTL before expiry |
| `CATEGORICAL_MAX_UNIQUE` | 20 | Object columns with ≤ 20 unique values treated as categorical |
| `HIGH_CARDINALITY_THRESHOLD` | 50 | Columns with > 50 unique values flagged as high cardinality |

### Quality Score Weights

The data quality score is a weighted composite computed in `data_service.py`:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Completeness | 40% | Proportion of non-missing values across all columns |
| Duplicate rows | 20% | Fraction of rows that are exact duplicates |
| Constant columns | 15% | Columns with zero variance (carry no signal) |
| High cardinality | 15% | Object columns flagged for high unique-value counts |
| Class balance | 10% | Minority class proportion relative to imbalance threshold |

---

## Branching Strategy

```
main ────────────────────────────────────────────────► (protected, production)
  └── develop ──────────────────────────────────────► (integration branch)
        ├── feature/US-001 ──► merge to develop
        ├── feature/US-002 ──► merge to develop
        └── feature/US-042 ──► merge to develop
```

| Branch | Protection | Purpose |
|--------|-----------|---------|
| `main` | Yes — requires PR review | Production-ready code; auto-deploys to HuggingFace Spaces |
| `develop` | Yes — requires PR review | Sprint integration; all feature branches merge here first |
| `feature/US-XXX` | No | Individual user story; named after the Jira issue key |

### Commit Convention

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|--------|-------------|
| `feat:` | New user-facing feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring without behaviour change |
| `test:` | New or updated tests |
| `docs:` | Documentation changes |
| `style:` | Formatting, whitespace, lint |
| `chore:` | Build scripts, dependency updates, tooling |

Examples:

```
feat: add SMOTE toggle to preparation config panel
fix: handle BOM-encoded CSV files in validate_and_load_csv
test: add missing-value strategy tests for step 3 preparation
docs: add API reference table for data preparation endpoints
refactor: extract quality score weights to constants module
```

---

## Sprint Progress

MedVix follows a 5-sprint Scrum schedule with two-week sprints. The project jury presentation is on 6 May 2026.

| Sprint | Dates | Theme | Status | Stories / Points |
|--------|-------|-------|--------|-----------------|
| 1 | 18 Feb – 4 Mar 2026 | Foundation and Design | Done | 7 stories |
| 2 | 4 Mar – 18 Mar 2026 | MVP (Steps 1–3) | Done | 12 stories, 50 SP |
| 3 | 18 Mar – 1 Apr 2026 | Core ML (Steps 4–5) | Done | 8 stories, 32 SP |
| 4 | 1 Apr – 15 Apr 2026 | Full Pipeline (Steps 6–7) | Planned | — |
| 5 | 15 Apr – 29 Apr 2026 | Polish and Test | Planned | — |
| Jury | 6 May 2026 | Final Presentation | Planned | — |

### Sprint 1 Deliverables (Done)

- GitHub repository initialised with branch protection rules
- Jira Scrum project created with full product backlog (40+ user stories)
- Figma wireframes for all 7 steps
- FastAPI skeleton with health endpoint and CORS configuration
- React + Vite + Tailwind project scaffolding
- Docker and docker-compose working end-to-end
- Architecture decision records documented

### Sprint 2 Deliverables (Done)

- Step 1: Domain selection UI with 20 domain cards, gradients, and glossary modal
- Step 2: CSV upload with drag-and-drop, built-in dataset loading, data summary table, quality score, column role mapper
- Step 3: Preparation configuration panel, full backend pipeline (imputation, encoding, split, normalisation, SMOTE), before/after stats display
- Backend test suite: 148+ tests covering Steps 1–3 (pytest + httpx)
- GitHub Wiki: home page, ML glossary (30 terms), clinical context descriptions for all 20 domains, demo script, sprint planning notes
- 20 synthetic CSV datasets generated and committed

### Sprint 3 Deliverables (Done)

- Step 4: Model selection UI with 8 ML models (6 required + XGBoost, LightGBM), interactive hyperparameter sliders with clinical descriptions, Quick Start and Optimized presets, 300ms debounced auto-retrain toggle
- Step 5: 6-metric dashboard with colour-coded thresholds (green/amber/red), confusion matrix with FN/FP clinical banners, ROC curve with diagonal reference and explanatory note, PR curve, k-fold cross-validation, overfitting detector, low sensitivity danger banner (<50%)
- Model comparison: "+ Compare" dropdown workflow with no-duplicate enforcement, sensitivity column colour coding, "Compare All" shortcut, per-row removal, best-per-metric highlighting with trophy icon
- Backend ML endpoints: `GET /api/ml/hyperparams/{type}`, `POST /api/ml/train`, `GET /api/ml/models`, `POST /api/ml/compare`
- Test suite: 52 automated pytest tests covering Steps 4-5 (35 new + 17 existing), 48 manual test cases, 100% pass rate
- Documentation: [progress report](docs/sprint3-progress-report.md), [API docs](docs/api-docs-sprint3.md), [test plan](docs/testing/sprint3-test-plan.md), [test cases](docs/testing/sprint3-test-cases.md), [test report](docs/testing/sprint3-test-report.md), [demo script](docs/sprint3-demo-script.md)

### Sprint 4 Goals (In Progress)

- Step 6: SHAP feature importance bar chart, single-patient waterfall explanation
- Step 7: Subgroup fairness table, EU AI Act compliance checklist, bias detection banner, PDF summary certificate

---

## Team

| Name | Role | Responsibilities |
|------|------|-----------------|
| Berkay Aktaş | Lead Developer & Scrum Master | Backend architecture, FastAPI services, Docker infrastructure, CI/CD, sprint ceremonies |
| Arzu Tuğçe Koca | QA / Documentation Lead | Pytest test suite, GitHub Wiki, progress reports, acceptance criteria verification |
| Nisanur Konur | Product Owner | User stories, Jira backlog management, sprint reviews, stakeholder communication |
| Özge Altınok | UX Designer | Figma wireframes, React component implementation, Tailwind design system, accessibility |

---

## Links

| Resource | URL |
|----------|-----|
| Live Demo | [https://bewrkay-medvix.hf.space](https://bewrkay-medvix.hf.space) |
| Jira Scrum Board | [MedVix Board](https://medvix.atlassian.net/jira/software/projects/SCRUM/boards/1) |
| Figma Wireframes | [MedVix Wireframes](https://www.figma.com/design/JFhrBflLLmjMYzJIK8Qnbe) |
| GitHub Wiki | [Project Wiki](../../wiki) |
| API Docs (local) | http://localhost:8000/docs |
| API ReDoc (local) | http://localhost:8000/redoc |

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Course**: SENG 430 — Software Quality Assurance Laboratory, Cankaya University
- **Instructor**: Dr. Sevgi Koyuncu Tunc
- **Datasets**: Synthetic datasets derived from distributions published in the UCI Machine Learning Repository and Kaggle, generated via `backend/data/generate_synthetic.py`
- **Libraries**: This project is built on open-source software; see `backend/requirements.txt` and `frontend/package.json` for the full dependency list
- **Standards**: EU AI Act (2024/1689), WCAG 2.1, ISO/IEC 25010 (Software Quality), Conventional Commits specification
