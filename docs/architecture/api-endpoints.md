# API Endpoints

Planned REST API route map for MedVix backend.

```mermaid
graph LR
    subgraph Health
        H1["GET /health"]
    end

    subgraph Domains ["Step 1 — Domains"]
        D1["GET /api/domains"]
        D2["GET /api/domains/{specialty}"]
    end

    subgraph Data ["Steps 2-3 — Data"]
        DA1["POST /api/data/upload"]
        DA2["GET /api/data/summary"]
        DA3["POST /api/data/prepare"]
    end

    subgraph Model ["Steps 4-5 — Model"]
        M1["POST /api/model/train"]
        M2["GET /api/model/results"]
        M3["GET /api/model/roc-curve"]
        M4["GET /api/model/confusion-matrix"]
    end

    subgraph Explain ["Step 6 — Explainability"]
        E1["POST /api/explain/shap"]
    end

    subgraph Ethics ["Step 7 — Ethics"]
        ET1["GET /api/ethics/fairness"]
        ET2["POST /api/certificate/generate"]
    end

    style Health fill:#2e7d32,stroke:#1b5e20,color:#fff
    style Domains fill:#1565c0,stroke:#0d47a1,color:#fff
    style Data fill:#00838f,stroke:#006064,color:#fff
    style Model fill:#e65100,stroke:#bf360c,color:#fff
    style Explain fill:#6a1b9a,stroke:#4a148c,color:#fff
    style Ethics fill:#c62828,stroke:#b71c1c,color:#fff
```

## Endpoint Details

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |

### Step 1 — Clinical Context
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/domains` | List all 20 medical domains |
| GET | `/api/domains/{specialty}` | Get domain details (description, target variable, dataset info) |

### Steps 2-3 — Data
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/data/upload` | Upload CSV file or select built-in dataset |
| GET | `/api/data/summary` | Column statistics, types, missing values |
| POST | `/api/data/prepare` | Apply preprocessing (split, impute, normalise, SMOTE) |

### Steps 4-5 — Model & Results
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/model/train` | Train selected model with hyperparameters |
| GET | `/api/model/results` | Get all 6 evaluation metrics |
| GET | `/api/model/roc-curve` | ROC curve data points |
| GET | `/api/model/confusion-matrix` | Confusion matrix values |

### Step 6 — Explainability
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/explain/shap` | Compute SHAP values (global + single patient) |

### Step 7 — Ethics & Bias
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ethics/fairness` | Subgroup fairness metrics table |
| POST | `/api/certificate/generate` | Generate PDF summary certificate |
