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
| Jira Board | _Link to be added_ |
| Figma Wireframes | _Link to be added_ |
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
| Create Jira project and epics | Berkay | In Progress |
| Write 20+ user stories with Gherkin AC | Nisanur | In Progress |
| Design Figma wireframes for all 7 steps | Özge | In Progress |
| Set up GitHub Wiki | Arzu Tuğçe | Done |
