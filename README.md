# MedVix

**ML Visualization Tool for Healthcare Professionals**

SENG 430 — Software Quality Assurance Laboratory, Cankaya University

---

## About

MedVix is a web-based machine-learning visualization tool that guides healthcare professionals through a **7-step clinical ML pipeline** across **20 medical domains**. Users select a specialty, explore data, train models, evaluate results, and review explainability and ethics — all from an interactive dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | FastAPI (Python 3.12) |
| ML Engine | scikit-learn (KNN, SVM, Decision Tree, Random Forest, Logistic Regression, Naive Bayes) |
| Explainability | SHAP |
| Class Balancing | imbalanced-learn (SMOTE) |
| Containerization | Docker + docker-compose |
| Project Management | Jira (Scrum) |
| UI/UX Design | Figma |
| Documentation | GitHub Wiki |
| Accessibility | Lighthouse, axe |

## Repository Structure

```
MedVix/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routers/             # API route handlers
│   │   │   └── health.py        # Health-check endpoint
│   │   ├── services/            # Business logic
│   │   ├── models/              # Pydantic schemas
│   │   └── utils/               # Helper functions
│   ├── data/                    # Built-in CSV datasets (20 domains)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page-level views (7 steps)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Helper functions
│   │   ├── styles/              # Global styles / theme
│   │   └── assets/              # Images, icons
│   └── Dockerfile
├── docs/
│   └── architecture/            # C4, data-flow, API diagrams
├── .github/
│   └── pull_request_template.md
├── docker-compose.yml
├── SETUP.md
└── README.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

### Docker (both services)

```bash
docker compose up --build
```

## 7-Step Pipeline

| Step | Name | Description |
|------|------|-------------|
| 1 | Clinical Context | Select medical specialty and view domain overview |
| 2 | Data Exploration | Upload CSV or use built-in dataset, inspect columns |
| 3 | Data Preparation | Train/test split, handle missing values, normalize, SMOTE |
| 4 | Model & Parameters | Select model, tune hyperparameters via sliders |
| 5 | Results | View accuracy, F1, AUC-ROC, confusion matrix, ROC curve |
| 6 | Explainability | SHAP feature importance and single-patient waterfall |
| 7 | Ethics & Bias | Subgroup fairness, EU AI Act checklist, PDF certificate |

## Branching Strategy

```
main ─── develop ─── feature/US-XXX
              └──── feature/US-YYY
```

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code (protected) |
| `develop` | Integration branch for current sprint |
| `feature/US-XXX` | Individual user story branches |

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).

## Team

| Name | Role |
|------|------|
| Berkay Aktaş | Lead Developer & Scrum Master |
| Arzu Tuğçe Koca | QA / Documentation Lead |
| Nisanur Konur | Product Owner |
| Özge Altınok | UX Designer |

## Links

| Resource | URL |
|----------|-----|
| Jira Board | [MedVix Scrum Board](https://medvix.atlassian.net/jira/software/projects/SCRUM/boards/1) |
| Figma Wireframes | [MedVix Wireframes](https://www.figma.com/design/JFhrBflLLmjMYzJIK8Qnbe) |
| GitHub Wiki | [Wiki](../../wiki) |
| API Docs (local) | http://localhost:8000/docs |
