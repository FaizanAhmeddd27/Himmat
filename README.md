# HIMMAT — Digital Life Simulator

> **Tagline:** Learn it. Break it. Recover from it. Master it.

HIMMAT is an interactive simulator of everyday digital life. It lets people who did not grow up with technology (parents, grandparents, first-time smartphone users) **safely experience** real digital situations, make mistakes, see the consequences, and learn to recover — without risking real accounts, money, or identity.

> "We don't want parents to call their children every time technology becomes confusing. We want them to become confident enough to handle it themselves. HIMMAT doesn't do things for them. It prepares them for the real world."

---

## Core principle

**The scenario engine is deterministic and is the only source of truth for what happens in a simulation. AI is an explanation layer (hints, simplification, language support), never the decider.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Charts | Recharts |
| Client state | Zustand + TanStack React Query |
| Backend | FastAPI (Python 3.11+) |
| Scenario engine | Python + JSON state machines |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (JWT) |
| AI explanations | Gemini or OpenAI (explanation layer only, with static fallbacks) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
himmat/
├── frontend/   (Next.js app: pages, simulator components, replay, DNA, family, i18n)
├── backend/    (FastAPI: api/, engine/, skills/, ai/, db/, scenarios/*.json, tests/)
├── supabase/   (migrations, seed)
├── docs/       (PRD, SRS, arch, dev_plan, AI_USAGE)
└── .github/    (CI workflows)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- (Optional) Docker for local Postgres, or a Supabase project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at [http://localhost:8000](http://localhost:8000). Health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health).

---

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — Product Requirements Document
- [`docs/SRS.md`](docs/SRS.md) — Software Requirements Specification
- [`docs/ARCH.md`](docs/ARCH.md) — System Architecture
- [`docs/DEV_PLAN.md`](docs/DEV_PLAN.md) — Development Plan

---

## Safety & Privacy

- HIMMAT **never** connects to any real bank, wallet, messaging service, or government system.
- **No real** credentials, OTPs, ID documents, or payment data are ever collected.
- All simulated brands (ChatLine, SafeTrust Bank, PaySathi, BazaarNow, MeetKaro, e-Sahulat) are **fictional**. No real brand assets are copied.
- Family sharing is strictly **opt-in and consent-based**.

---

## AI Usage

_TBD — this section will document honestly where and how AI tools were used during the build._

---

## License

_TBD_
