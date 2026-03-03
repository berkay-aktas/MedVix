# C4 — System Context Diagram

Shows how MedVix fits into the broader environment and who interacts with it.

```mermaid
graph TB
    User["Healthcare Professional / Student<br/><i>Uses MedVix to explore ML models<br/>on clinical datasets</i>"]

    MedVix["MedVix<br/><b>ML Visualization Tool</b><br/><i>Web application that guides users<br/>through a 7-step clinical ML pipeline</i>"]

    Kaggle["Kaggle / UCI ML Repo<br/><i>Public clinical datasets<br/>(20 medical domains)</i>"]

    User -->|"Selects domain, uploads CSV,<br/>tunes models, views results"| MedVix
    MedVix -->|"Fetches built-in datasets"| Kaggle

    style MedVix fill:#2e7d32,stroke:#1b5e20,color:#fff
    style User fill:#1565c0,stroke:#0d47a1,color:#fff
    style Kaggle fill:#616161,stroke:#424242,color:#fff
```

## Actors

| Actor | Description |
|-------|-------------|
| Healthcare Professional | Doctor, nurse, or clinical researcher using MedVix for ML-guided analysis |
| Student | University student learning ML concepts through the interactive pipeline |

## External Systems

| System | Description |
|--------|-------------|
| Kaggle / UCI ML Repository | Source for the 20 built-in clinical datasets |
