# MedVix Wiki

Welcome to the MedVix project wiki — the central documentation hub for our ML Visualization Tool for Healthcare Professionals.

---

## Team Members & Roles

| Name | Role | Responsibilities |
|------|------|-----------------|
| Berkay Aktaş | Lead Developer & Scrum Master | Technical architecture, code reviews, Jira board, sprint ceremonies |
| Arzu Tuğçe Koca | QA / Documentation Lead | Test cases, manual testing, wiki maintenance, progress reports |
| Nisanur Konur | Product Owner | User stories, backlog prioritization, acceptance criteria sign-off |
| Özge Altınok | UX Designer | Figma wireframes, UI design, prototyping |

---

## Project Links

| Resource | Link |
|----------|------|
| GitHub Repository | [berkay-aktas/MedVix](https://github.com/berkay-aktas/MedVix) |
| Jira Board | [MedVix Scrum Board](https://medvix.atlassian.net/jira/software/projects/SCRUM/boards/1) |
| Figma Wireframes | [MedVix Wireframes — Sprint 1](https://www.figma.com/proto/SC3UNoIwFPNFzhrS8BiQAv/MedVix-Wireframes-%E2%80%94-Sprint-1?node-id=11-2&p=f&t=q4M5BnJmQCYI75Md-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2) |
| API Docs (local) | http://localhost:8000/docs |

---

## Branch Naming Conventions

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Main | `main` | `main` |
| Integration | `develop` | `develop` |
| Feature | `feature/US-XXX` | `feature/US-001` |
| Bug fix | `fix/US-XXX` | `fix/US-012` |
| Documentation | `docs/description` | `docs/update-wiki` |

Commit format: **Conventional Commits** — `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

---

## Sprint 1 — Foundation & Design (Weeks 1-2)

**Goal**: Set up project infrastructure, define architecture, create backlog, design wireframes.

**Deliverables**:
- Team Charter
- Domain Coverage Plan (20 medical domains)
- Jira Product Backlog (20+ user stories with Gherkin AC)
- GitHub repo structure with README and SETUP guide
- Architecture diagrams (C4 context, container, data flow)
- Figma wireframes for all 7 pipeline steps
- GitHub Wiki home page

---

## Meeting Notes

### Week 1 — Sprint Planning (26 Feb 2026)

**Attendees**: Berkay, Arzu Tuğçe, Nisanur, Özge

**Agenda**:
1. Team role assignments
2. Tech stack confirmation (React + Vite, FastAPI, scikit-learn)
3. Repository setup and branching strategy
4. Sprint 1 backlog creation
5. Domain coverage plan — dataset source assignments

**Decisions**:
- FastAPI chosen over Flask for async support and auto-generated API docs
- 7-step pipeline architecture confirmed per User Manual
- 20 clinical domains mapped to Kaggle/UCI datasets
- Branching: `main` -> `develop` -> `feature/US-XXX`
- All user stories to follow Gherkin acceptance criteria format

**Action Items**:
| Action | Owner | Status |
|--------|-------|--------|
| Set up GitHub repo structure | Berkay | Done |
| Create Jira project and epics | Berkay | Done |
| Write 20+ user stories with Gherkin AC | Nisanur | Done |
| Design Figma wireframes for all 7 steps | Özge | Done |
| Set up GitHub Wiki | Arzu Tuğçe | Done |

---

## Sprint 2 — MVP Steps 1-3 (due 18 Mar 2026)

**Status**: Complete

### Deliverables
| Artifact | Status | Link |
|----------|--------|------|
| Working App — Steps 1-3 | Done | `docker compose up` or `localhost:5173` + `localhost:8000` |
| Column Mapper Modal | Done | Validate → save → schemaOK gates Step 3 |
| Step 3 Before/After Charts | Done | Normalisation bars + SMOTE class balance bars |
| Test Report | Done | [Sprint 2 Test Report](testing/sprint2-test-report.md) |
| Progress Report | Done | [Sprint 2 Progress Report](sprint2-progress-report.md) |

### Sprint 2 Metrics
| Metric | Target | Result |
|--------|--------|--------|
| CSV Upload Success Rate | 100% | Pass (5 valid + 5 invalid) |
| Column Mapper Gate | 0 bypass | Pass |
| Step 3 Controls | All functional | Pass |
| Domain Count | 20/20 | Pass |
| Test Coverage | 100% | Pass (12/12 stories) |

### Key Documentation
- [API Documentation — Sprint 2](api-docs-sprint2.md)
- [Test Plan](testing/sprint2-test-plan.md)
- [Test Cases (50+)](testing/sprint2-test-cases.md)
- [Test Execution Report](testing/sprint2-test-report.md)
- [Progress Report](sprint2-progress-report.md)

### Week 3-4 Meeting Notes (11 Mar 2026 — Sprint 2 Planning)

**Attendees**: Berkay, Arzu Tuğçe, Nisanur, Özge

**Decisions**:
- Chose Tailwind CSS over vanilla CSS for consistent design system
- Zustand for state management (lighter than Redux, cleaner than Context)
- Synthetic datasets generated with numpy (fixed seeds) for all 20 domains
- Data quality score (0-100) added as enhancement beyond requirements
- Red blocked banner for Column Mapper gate (assignment requirement)

**Action Items**:
| Action | Owner | Status |
|--------|-------|--------|
| Backend API for Steps 1-3 (10 endpoints) | Berkay | Done |
| 20 synthetic clinical CSV datasets | Berkay | Done |
| Backend pytest suite (148 tests) | Berkay | Done |
| Frontend React + Tailwind app (41 components) | Özge | Done |
| Sprint 2 test plan, cases, and report | Arzu Tuğçe | Done |
| API documentation and progress report | Arzu Tuğçe | Done |
| Clinical context descriptions for 20 domains | Nisanur | Done |
| ML glossary with 25+ terms | Nisanur | Done |
