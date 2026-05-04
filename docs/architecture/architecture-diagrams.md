---
stylesheet: []
body_class: markdown-body
css: |-
  .markdown-body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
  h1 { text-align: center; color: #1b5e20; border-bottom: 3px solid #2e7d32; padding-bottom: 10px; }
  h2 { color: #1565c0; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
  th { background: #e8f5e9; padding: 8px; text-align: left; border: 1px solid #c8e6c9; }
  td { padding: 8px; border: 1px solid #e0e0e0; }
  code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .note { background: #e3f2fd; padding: 12px; border-left: 4px solid #1565c0; margin: 15px 0; border-radius: 4px; font-size: 13px; }
pdf_options:
  format: A4
  margin:
    top: 15mm
    bottom: 15mm
    left: 15mm
    right: 15mm
---

# MedVix — Architecture Diagrams

**Project**: MedVix — ML Visualization Tool for Healthcare
**Course**: SENG 430 Software Quality Assurance Laboratory — Cankaya University

---

## C4 System Context Diagram

Shows how MedVix fits into the broader environment and who interacts with it.

| Actor / System | Description |
|----------------|-------------|
| **Healthcare Professional / Student** | Uses MedVix to explore ML models on clinical datasets |
| **MedVix** | Web application guiding users through a 7-step clinical ML pipeline |
| **Kaggle / UCI ML Repo** | Public clinical datasets (20 medical domains) |

**Interactions**:
- User → MedVix: Selects domain, uploads CSV, tunes models, views results (HTTPS)
- MedVix → Kaggle: Fetches built-in datasets (pre-bundled at build time)

<div class="note">
The full interactive Mermaid diagrams are rendered on the GitHub repository Wiki and README.
</div>

---

## C4 Container Diagram

Shows the major containers (deployable units) inside MedVix and how they communicate.

| Container | Technology | Responsibility | Port |
|-----------|-----------|---------------|------|
| **Frontend** | React 18 + Vite | Browser UI — stepper, domain pills, sliders, charts | 5173 |
| **Backend API** | FastAPI + Uvicorn (Python 3.12) | REST endpoints — data upload, preprocessing, training, metrics | 8000 |
| **ML Engine** | scikit-learn, SHAP, imbalanced-learn | Model training, evaluation, SHAP explanations, SMOTE balancing | — |
| **Session Storage** | In-memory (dev) / Redis (prod) | Persists user pipeline state between steps | — |

**Communication Flow**:

```
┌──────────────────────────────────────────────────────────────┐
│                       MedVix System                          │
│                                                              │
│  ┌─────────────┐    REST/JSON    ┌──────────────────┐        │
│  │  Frontend    │ ──────────────▶│  Backend API     │        │
│  │  React 18   │                 │  FastAPI         │        │
│  │  + Vite     │                 │  (Python 3.12)   │        │
│  │  Port 5173  │                 │  Port 8000       │        │
│  └─────────────┘                 └────────┬─────────┘        │
│        ▲                                  │                  │
│        │ HTTPS                   Python   │  Read/Write      │
│        │                         calls    │                  │
│        │                    ┌─────┴────┐  │  ┌────────────┐  │
│        │                    │ ML Engine│  └─▶│  Session    │  │
│        │                    │ sklearn  │     │  Storage    │  │
│        │                    │ SHAP     │     │  In-memory  │  │
│        │                    │ SMOTE    │     └────────────┘  │
│        │                    └──────────┘                     │
└────────┼─────────────────────────────────────────────────────┘
         │
  ┌──────┴──────┐
  │  User       │
  │  (Browser)  │
  └─────────────┘
```

---

## API Endpoints Map

| Step | Method | Endpoint | Description |
|------|--------|----------|-------------|
| Health | GET | `/health` | Server health check |
| 1 | GET | `/api/domains` | List all 20 medical domains |
| 1 | GET | `/api/domains/{specialty}` | Get domain details |
| 2 | POST | `/api/data/upload` | Upload CSV or select built-in dataset |
| 2 | GET | `/api/data/summary` | Column statistics, types, missing values |
| 3 | POST | `/api/data/prepare` | Apply preprocessing pipeline |
| 4 | POST | `/api/model/train` | Train model with hyperparameters |
| 5 | GET | `/api/model/results` | Get all 6 evaluation metrics |
| 5 | GET | `/api/model/roc-curve` | ROC curve data points |
| 5 | GET | `/api/model/confusion-matrix` | Confusion matrix values |
| 6 | POST | `/api/explain/shap` | Compute SHAP values |
| 7 | GET | `/api/ethics/fairness` | Subgroup fairness metrics |
| 7 | POST | `/api/certificate/generate` | Generate PDF certificate |

---

## Data Flow — 7-Step Pipeline

```
 Step 1              Step 2              Step 3
 Clinical Context    Data Exploration    Data Preparation
┌───────────────┐   ┌───────────────┐   ┌───────────────────────┐
│ Select         │   │ Upload CSV or │   │ Train/Test Split      │
│ Specialty      │──▶│ Built-in      │──▶│ Missing Values        │
│ (20 domains)  │   │ Dataset       │   │ Normalisation         │
│               │   │ Column Mapper │   │ SMOTE (if imbalanced) │
└───────────────┘   └───────────────┘   └───────────┬───────────┘
                                                     │
                                                     ▼
 Step 7              Step 6              Step 5              Step 4
 Ethics & Bias       Explainability      Results             Model & Params
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Fairness Table│   │ SHAP Global   │   │ 6 Metrics     │   │ Select Model  │
│ EU AI Act     │◀──│ SHAP Patient  │◀──│ Confusion Mat.│◀──│ Tune Sliders  │
│ PDF Cert.     │   │ Waterfall     │   │ ROC Curve     │   │ Auto-Retrain  │
└───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

**Models**: KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | SPA with 7-step stepper UI |
| Backend | FastAPI (Python 3.12) | REST API server |
| ML | scikit-learn | 6 classification models |
| Explainability | SHAP | Feature importance + waterfall charts |
| Balancing | imbalanced-learn | SMOTE for class imbalance |
| Containers | Docker + docker-compose | Deployment |
| Version Control | GitHub | Feature branches, PRs, Wiki |
| Project Mgmt | Jira (Scrum) | Backlog, sprints, velocity |
| Design | Figma | UI/UX wireframes and prototypes |
