# MedVix — Sprint 3 Test Plan

**Project**: MedVix — ML Visualization Tool for Healthcare
**Sprint**: Sprint 3 (Weeks 5-6)
**Test Plan Version**: 1.0
**Author**: Arzu Tugce KOCA (QA Lead)
**Reviewed by**: Berkay AKTAS (Scrum Master)
**Date**: 31 March 2026
**Sprint Gate Date**: 1 April 2026

---

## 1. Introduction

### 1.1 Purpose

This document defines the test strategy, scope, and approach for Sprint 3 of the MedVix project. Sprint 3 delivers Steps 4 (Model Selection & Parameters) and 5 (Results & Evaluation), covering 8 user stories totalling 32 story points with a gate date of 1 April 2026.

### 1.2 Background

MedVix is a 7-step ML visualization tool for healthcare professionals. Sprint 2 delivered Steps 1-3 (Clinical Context, Data Exploration, Data Preparation). Sprint 3 builds on the prepared data pipeline to add ML model training, evaluation metrics, and comparison functionality.

### 1.3 Document Scope

This test plan covers all functional and performance testing for Sprint 3 deliverables, including 4 new backend API endpoints, 2 new frontend page components, and 7 performance acceptance criteria.

---

## 2. Scope

### 2.1 In Scope

| Area | Components | Test Types |
|------|-----------|------------|
| Step 4 — Model Selection | Model selector (8 cards), hyperparameter panel, auto-retrain toggle, preset buttons | Functional, UI, Performance |
| Step 5 — Results | Metrics grid (6 metrics), confusion matrix, ROC curve, PR curve, cross-validation, overfit detector, model comparison | Functional, UI, Visual |
| Step 5 — Safety | Low sensitivity danger banner (<50%), FN/FP clinical banners | Functional, Boundary |
| Backend API | GET /api/ml/hyperparams/{type}, POST /api/ml/train, GET /api/ml/models, POST /api/ml/compare | Integration, Performance |
| Cross-cutting | Domain switching with model results, metric colour thresholds at boundary values | Regression, Boundary |

### 2.2 Out of Scope

- Steps 6-7 (Explainability, Ethics & Bias) — Sprint 4
- SHAP integration — Sprint 4
- PDF certificate generation — Sprint 4
- Browser compatibility testing (Chrome only for Sprint 3)
- Mobile responsive testing
- Load/stress testing
- Security/penetration testing

### 2.3 User Stories Under Test

| Story ID | Title | Story Points | Sprint |
|----------|-------|-------------|--------|
| MV-US-013 | Select ML algorithm from 6+ models | 5 | Sprint 3 |
| MV-US-014 | Tune KNN K parameter with live slider | 3 | Sprint 3 |
| MV-US-011 | Auto-retrain toggle with debounce | 3 | Sprint 3 |
| MV-US-017 | View 6 performance metrics with colour coding | 5 | Sprint 3 |
| MV-US-018 | View confusion matrix with clinical banners | 5 | Sprint 3 |
| MV-US-019 | View ROC curve with AUC annotation | 3 | Sprint 3 |
| MV-US-015 | Compare two trained models side by side | 5 | Sprint 3 |
| MV-US-016 | View model comparison table | 3 | Sprint 3 |
| **Total** | | **32** | |

---

## 3. Test Approach

### 3.1 Testing Levels

**Level 1 — Unit Tests (pytest)**
ML service functions: model instantiation, metric computation, confusion matrix generation, ROC/PR curve calculation, cross-validation, hyperparameter validation.

**Level 2 — API Integration Tests (TestClient)**
All 4 ML endpoints tested end-to-end using FastAPI TestClient with prepared sessions. Covers success paths, error paths (400, 404), and boundary conditions.

**Level 3 — Manual Functional Tests**
Frontend UI verification: model card selection, slider interaction, auto-retrain behaviour, metric display with colour coding, chart rendering, banner visibility, comparison table workflow.

### 3.2 Test Execution Order

1. Prepare a session through Steps 1-3 (load cardiology dataset, map columns, apply preparation)
2. Execute Level 1 unit tests for ML service
3. Execute Level 2 API integration tests for all 4 endpoints
4. Execute Level 3 manual tests for Step 4 UI (model selector, hyperparameters, auto-retrain)
5. Execute Level 3 manual tests for Step 5 UI (metrics, confusion matrix, ROC, comparison)
6. Execute performance tests (training latency, debounce timing)
7. Execute cross-domain regression tests (5 domains)

### 3.3 Test Data Strategy

**Built-in Datasets (primary)**:
- Cardiology (303 rows, binary) — default test domain
- Nephrology (400 rows, binary) — cross-domain test
- Oncology-Breast (569 rows, binary) — cross-domain test
- Neurology (195 rows, binary) — small dataset test
- Endocrinology (768 rows, binary) — larger dataset test

**Synthetic CSV** (from conftest.py):
- `make_valid_csv(rows=50)` — cardiology-shaped CSV for upload tests

### 3.4 Defect Classification

| Priority | Definition | Resolution SLA |
|----------|-----------|---------------|
| P1 Critical | Blocks sprint gate; model training fails completely | Fix within 4 hours |
| P2 High | Major feature broken; metrics not displaying | Fix within 8 hours |
| P3 Medium | Minor feature gap; visual inconsistency | Fix before gate if possible |
| P4 Low | Cosmetic issue; minor text error | Log for next sprint |

---

## 4. Entry Criteria

- [ ] Sprint 2 exit criteria met (Steps 1-3 functional)
- [ ] All 8 Sprint 3 stories in Review or Done status in Jira
- [ ] Backend ML endpoints responding (GET /api/ml/hyperparams/knn returns 200)
- [ ] Frontend Step 4 and Step 5 pages rendering without errors
- [ ] Prepared session available (cardiology dataset loaded, mapped, prepared)
- [ ] pytest framework installed and existing Step 1-3 tests passing
- [ ] Test environment matches production configuration (Python 3.12, Node 20)

---

## 5. Exit Criteria

- [ ] All test cases executed (100% execution rate)
- [ ] Zero P1 Critical defects open
- [ ] Zero P2 High defects open
- [ ] All 6 core model types train successfully
- [ ] All 6 performance metrics display with correct colour thresholds
- [ ] Low sensitivity danger banner triggers at <50% boundary
- [ ] Model comparison table allows 6 models with no duplicates
- [ ] Training latency < 3,000ms verified
- [ ] Test report reviewed and signed off by Scrum Master

---

## 6. Test Matrix: Stories x Acceptance Criteria

| Story ID | AC Scenario | Test Case IDs | Automated? |
|----------|------------|---------------|------------|
| MV-US-013 | 8 model cards displayed | TC-101, TC-102, TC-103 | No |
| MV-US-013 | Clicking model loads params | TC-104, TC-105, TC-106 | No |
| MV-US-014 | KNN K slider range 1-50 | TC-107, TC-108 | Yes |
| MV-US-014 | Distance/weight dropdowns | TC-109, TC-110 | No |
| MV-US-014 | Preset buttons work | TC-111, TC-112 | No |
| MV-US-011 | Auto-retrain on toggle | TC-113, TC-114 | No |
| MV-US-011 | Auto-retrain off stops retrain | TC-115, TC-116 | No |
| MV-US-017 | 6 metrics with colour thresholds | TC-117 to TC-122 | Partial |
| MV-US-018 | 2x2 confusion matrix with labels | TC-123, TC-124, TC-127 | Yes |
| MV-US-018 | FN/FP clinical banners | TC-125, TC-126 | No |
| MV-US-019 | ROC with diagonal + AUC | TC-128 to TC-131 | Yes |
| MV-US-017 | Sensitivity danger banner | TC-132 to TC-134 | No |
| MV-US-015 | + Compare button workflow | TC-135 to TC-139 | No |
| MV-US-016 | Comparison table features | TC-140 to TC-143 | No |
| Cross-cutting | Performance tests | TC-144 to TC-148 | Partial |

---

## 7. Risk and Mitigation Table

| Risk ID | Risk Description | Likelihood | Impact | Mitigation |
|---------|-----------------|-----------|--------|------------|
| R-301 | SVM training exceeds 3s on larger datasets | Medium | Medium | Test with all 20 domains; document SVM timing separately |
| R-302 | Debounce timing varies across browsers | Low | Low | Test on Chrome; document as Chrome-verified |
| R-303 | SMOTE interaction changes model performance | Medium | Low | Test training both with and without SMOTE |
| R-304 | Multiclass datasets break binary-only charts | Medium | High | Verify ROC/PR graceful degradation on multiclass domains |
| R-305 | Comparison table duplicates from rapid clicking | Low | Medium | Verify frontend dedup logic with rapid clicks |
| R-306 | Metric colour boundaries off-by-one | Low | High | Test exact boundary values (0.60, 0.80) |
| R-307 | Cross-validation fails on very small datasets | Medium | Medium | Test with neurology (195 rows); verify adaptive fold count |
| R-308 | XGBoost/LightGBM import failure | Low | Low | Lazy imports with graceful fallback; test with pytest.importorskip |

---

## 8. Test Environment

### 8.1 Software Environment

| Component | Version | Notes |
|-----------|---------|-------|
| Python | 3.12.0 | Backend runtime |
| FastAPI | 0.115.6 | Web framework |
| scikit-learn | 1.6.1 | ML models |
| SHAP | 0.46.0 | Installed, not tested in Sprint 3 |
| Node.js | 20 LTS | Frontend runtime |
| React | 18.3.1 | UI framework |
| Recharts | 3.8.0 | Chart library |
| pytest | 9.0.2 | Test framework |
| Chrome | 122+ | Browser for manual tests |

### 8.2 URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| Frontend Dev | http://localhost:5173 |
| Live Demo | https://bewrkay-medvix.hf.space |

### 8.3 Test Data Locations

| Dataset | Location |
|---------|----------|
| Cardiology (built-in) | backend/data/heart.csv |
| Nephrology (built-in) | backend/data/kidney_disease.csv |
| Oncology-Breast (built-in) | backend/data/breast_cancer.csv |
| Synthetic CSV | Generated in conftest.py |

---

## 9. Roles and Responsibilities

| Role | Name | Responsibilities |
|------|------|-----------------|
| QA Lead | Arzu Tugce KOCA | Write test plan, test cases, execute tests, write test report |
| Scrum Master | Berkay AKTAS | Review test plan, triage defects, approve test report |
| Product Owner | Nisanur KONUR | Accept stories based on test results |
| UX Designer | Ozge ALTINOK | Validate UI components, verify tooltip clinical language |

---

## 10. Definition of Done Checklist

A Sprint 3 story is Done when:

- [ ] All acceptance criteria pass manual and/or automated verification
- [ ] No P1 or P2 defects remain open for the story
- [ ] Backend endpoint returns correct response schema (validated by pytest)
- [ ] Frontend component renders without console errors
- [ ] Metric colour thresholds match specification (green ≥80%, amber ≥60%, red <60%)
- [ ] Code committed to main branch with conventional commit message
- [ ] Test cases documented in sprint3-test-cases.md
- [ ] Story demonstrated in sprint review

---

## 11. Approvals

| Name | Role | Signature | Date |
|------|------|-----------|------|
| Arzu Tugce KOCA | QA Lead | | 31 March 2026 |
| Berkay AKTAS | Scrum Master | | 31 March 2026 |
| Nisanur KONUR | Product Owner | | 31 March 2026 |
