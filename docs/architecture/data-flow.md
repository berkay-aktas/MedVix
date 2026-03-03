# Data Flow — 7-Step Pipeline

Sequence diagram showing data flow through all 7 pipeline steps.

```mermaid
sequenceDiagram
    actor User as Healthcare Professional
    participant FE as Frontend (React)
    participant API as Backend (FastAPI)
    participant ML as ML Engine (scikit-learn)

    Note over User,ML: Step 1 — Clinical Context
    User->>FE: Select medical specialty from pill bar
    FE->>API: GET /api/domains/{specialty}
    API-->>FE: Domain metadata (description, target variable)
    FE-->>User: Display clinical context page

    Note over User,ML: Step 2 — Data Exploration
    User->>FE: Upload CSV or select built-in dataset
    FE->>API: POST /api/data/upload
    API-->>FE: Column summary (types, missing %, stats)
    FE-->>User: Render feature table with colour-coded tags

    Note over User,ML: Step 3 — Data Preparation
    User->>FE: Configure split ratio, imputation, normalisation, SMOTE
    FE->>API: POST /api/data/prepare
    API->>ML: Apply preprocessing pipeline
    ML-->>API: Prepared train/test sets
    API-->>FE: Preparation summary
    FE-->>User: Show before/after statistics

    Note over User,ML: Step 4 — Model & Parameters
    User->>FE: Select model, adjust hyperparameter sliders
    FE->>API: POST /api/model/train
    API->>ML: Train selected model with parameters
    ML-->>API: Trained model + metrics
    API-->>FE: Accuracy, F1, confusion matrix data
    FE-->>User: Update charts within 300ms

    Note over User,ML: Step 5 — Results & Evaluation
    User->>FE: View results dashboard
    FE->>API: GET /api/model/results
    API-->>FE: All 6 metrics + ROC curve + confusion matrix
    FE-->>User: Render metric cards, ROC chart, matrix heatmap

    Note over User,ML: Step 6 — Explainability
    User->>FE: Request SHAP explanation
    FE->>API: POST /api/explain/shap
    API->>ML: Compute SHAP values
    ML-->>API: Feature importance + waterfall data
    API-->>FE: SHAP JSON
    FE-->>User: Bar chart (global) + waterfall (single patient)

    Note over User,ML: Step 7 — Ethics & Bias
    User->>FE: Review fairness table, click Download Certificate
    FE->>API: POST /api/certificate/generate
    API-->>FE: PDF binary
    FE-->>User: Download PDF summary certificate
```

## Pipeline Summary

| Step | API Endpoint | Input | Output |
|------|-------------|-------|--------|
| 1. Clinical Context | `GET /api/domains/{specialty}` | Specialty name | Domain metadata |
| 2. Data Exploration | `POST /api/data/upload` | CSV file or dataset ID | Column summary |
| 3. Data Preparation | `POST /api/data/prepare` | Preprocessing config | Prepared datasets |
| 4. Model & Parameters | `POST /api/model/train` | Model type + hyperparams | Trained model + metrics |
| 5. Results | `GET /api/model/results` | — | 6 metrics + charts |
| 6. Explainability | `POST /api/explain/shap` | — | SHAP values |
| 7. Ethics & Bias | `POST /api/certificate/generate` | — | PDF certificate |
