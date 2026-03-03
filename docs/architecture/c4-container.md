# C4 — Container Diagram

Shows the major containers (deployable units) inside MedVix and how they communicate.

```mermaid
graph TB
    subgraph MedVix ["MedVix System"]
        Frontend["<b>Frontend</b><br/>React 18 + Vite<br/><i>Single-page application<br/>with 7-step stepper UI</i><br/>Port 5173"]

        Backend["<b>Backend API</b><br/>FastAPI (Python 3.12)<br/><i>REST API — data processing,<br/>model training, predictions</i><br/>Port 8000"]

        MLEngine["<b>ML Engine</b><br/>scikit-learn<br/><i>6 classification models,<br/>SHAP explanations, SMOTE</i>"]

        SessionStore["<b>Session Storage</b><br/>In-memory / File<br/><i>Stores pipeline state<br/>per user session</i>"]
    end

    User["Healthcare Professional / Student"]

    User -->|"HTTPS"| Frontend
    Frontend -->|"REST API<br/>JSON"| Backend
    Backend -->|"Python calls"| MLEngine
    Backend -->|"Read / Write"| SessionStore

    style Frontend fill:#1565c0,stroke:#0d47a1,color:#fff
    style Backend fill:#2e7d32,stroke:#1b5e20,color:#fff
    style MLEngine fill:#e65100,stroke:#bf360c,color:#fff
    style SessionStore fill:#616161,stroke:#424242,color:#fff
    style User fill:#7b1fa2,stroke:#4a148c,color:#fff
```

## Container Details

| Container | Technology | Responsibility |
|-----------|-----------|---------------|
| Frontend | React 18 + Vite | Browser UI — stepper, domain pills, sliders, charts, PDF export |
| Backend API | FastAPI + Uvicorn | REST endpoints — data upload, preprocessing, training, metrics |
| ML Engine | scikit-learn, SHAP, imbalanced-learn | Model training, evaluation, SHAP explanations, SMOTE balancing |
| Session Storage | In-memory (dev) | Persists user pipeline state between steps |
