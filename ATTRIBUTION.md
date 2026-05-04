# Attribution

MedVix is built on a stack of open-source libraries and tools. This file
acknowledges the projects that made it possible.

> All third-party licenses are MIT, BSD, Apache 2.0, or compatible. No
> third-party code has been redistributed in modified form. No third-party
> patient data has been redistributed; all clinical datasets bundled with
> MedVix are synthetically generated (see `DATA_LICENSES.md`).

---

## Frontend

| Library | Version | License | Purpose |
|---|---|---|---|
| [React](https://react.dev) | 18.x | MIT | UI framework |
| [Vite](https://vitejs.dev) | 6.x | MIT | Build tool / dev server |
| [Tailwind CSS](https://tailwindcss.com) | 3.x | MIT | Utility-first styling |
| [Zustand](https://zustand-demo.pmnd.rs) | 5.x | MIT | Client state management |
| [Recharts](https://recharts.org) | 3.x | MIT | Charts (ROC, PR, confusion matrix, comparison) |
| [Axios](https://axios-http.com) | 1.x | MIT | HTTP client |
| [react-dropzone](https://react-dropzone.js.org) | 14.x | MIT | CSV upload drag/drop |
| [react-hot-toast](https://react-hot-toast.com) | 2.x | MIT | Notifications |
| [lucide-react](https://lucide.dev) | latest | ISC | Icons |
| [clsx](https://github.com/lukeed/clsx) | 2.x | MIT | Conditional CSS classes |
| [react-router-dom](https://reactrouter.com) | 6.x | MIT | Client routing |

## Backend

| Library | Version | License | Purpose |
|---|---|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | 0.115.x | MIT | ASGI web framework |
| [Uvicorn](https://www.uvicorn.org) | 0.30.x | BSD-3-Clause | ASGI server |
| [Pydantic](https://docs.pydantic.dev) | 2.x | MIT | Data validation |
| [scikit-learn](https://scikit-learn.org) | 1.6.x | BSD-3-Clause | ML models, metrics, preprocessing |
| [SHAP](https://shap.readthedocs.io) | 0.46.x | MIT | Model explainability |
| [imbalanced-learn](https://imbalanced-learn.org) | 0.13.x | MIT | SMOTE class balancing |
| [XGBoost](https://xgboost.ai) | 2.x | Apache-2.0 | Gradient boosting (bonus model) |
| [LightGBM](https://lightgbm.readthedocs.io) | 4.x | MIT | Gradient boosting (bonus model) |
| [pandas](https://pandas.pydata.org) | 2.x | BSD-3-Clause | Tabular data processing |
| [NumPy](https://numpy.org) | 2.x | BSD-3-Clause | Numerical arrays |
| [SciPy](https://scipy.org) | 1.x | BSD-3-Clause | Statistical functions |
| [fpdf2](https://github.com/py-pdf/fpdf2) | 2.8.x | LGPL-3.0 | Certificate PDF generation |
| [python-multipart](https://github.com/Kludex/python-multipart) | 0.x | Apache-2.0 | File upload parsing |

## Tooling and Infrastructure

| Tool | License | Purpose |
|---|---|---|
| [Docker](https://www.docker.com) | Apache-2.0 | Containerization |
| [nginx](https://nginx.org) | BSD-2-Clause | Static asset serving and reverse proxy |
| [pytest](https://pytest.org) | MIT | Backend test framework |
| [Playwright](https://playwright.dev) | Apache-2.0 | PDF generation via headless Chromium |
| [pymupdf (fitz)](https://pymupdf.readthedocs.io) | AGPL-3.0 | PDF post-processing for sprint reports |
| [GitHub Actions](https://github.com/features/actions) | proprietary, free for public repos | CI/CD |
| [Hugging Face Spaces](https://huggingface.co/spaces) | proprietary, free tier | Public deployment |
| [Render](https://render.com) | proprietary, free tier | Alternate deployment target |

## Methodology and Standards

- **Scrum** — agile project management framework (5 two-week sprints)
- **WCAG 2.2** — Web Content Accessibility Guidelines (target AA conformance)
- **ISO/IEC 25010** — software quality model (referenced in self-assessment)
- **EU AI Act (Reg. 2024/1689)** — transparency and bias requirements applied to Step 7
- **Conventional Commits** — commit message format (`feat:`, `fix:`, `docs:`, ...)
- **C4 Model** — software architecture diagrams (Context, Container, Component levels)

## Course Context

MedVix was developed for **SENG 430 — Software Quality Assurance Laboratory**
at Çankaya University, under the supervision of **Dr. Sevgi Koyuncu Tunç**.
The course's reference user guide and clinical-domain coverage plan informed
the product design. All software, documentation, tests, and deployments are
the original work of the MedVix team.

## Reporting Issues

If you believe an attribution is missing or incorrect, please open an issue
on the [GitHub repository](https://github.com/berkay-aktas/MedVix/issues).
