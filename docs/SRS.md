# HIMMAT — Digital Life Simulator
## Software Requirements Specification (SRS)

**Version:** 1.0 | **Date:** 31 Oct 2026 | **Standard reference:** IEEE 830-style structure

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements of **HIMMAT**, an interactive digital-life simulator that helps older adults and first-generation technology users practise everyday digital tasks safely. It is the contract between product (`PRD.md`), architecture (`arch.md`), and delivery (`dev_plan.md`).

### 1.2 Scope
HIMMAT consists of:
- A **web application** (Next.js) with simulated app interfaces ("Reality Mode").
- A **backend API** (FastAPI) hosting a **deterministic scenario engine**, skill model, replay/what-if, recovery evaluation, AI explanation gateway, and family sharing.
- A **PostgreSQL/Supabase** data layer with authentication.

HIMMAT **does not** connect to any real bank, wallet, messaging service, or government system and **never** processes real credentials, OTPs, ID documents, or payment data.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Scenario | A data-defined simulation (JSON state machine) teaching specific skills |
| Node | A state in a scenario (screen, decision, outcome) |
| Action | A user choice available at a node |
| Session | One run of a scenario by a learner |
| Branch | A what-if session forked from a prior session at a given step |
| Consequence | Deterministic result of an action, with explanation |
| Digital DNA | The learner's per-skill mastery profile |
| Mastery Test | An unaided (no hints) variant used to measure retained ability |
| Learner / Supporter | Primary user / consenting family member |

### 1.4 References
- Build4Better Participant Rulebook (official)
- `PRD.md`, `arch.md`, `dev_plan.md`

---

## 2. Overall Description

### 2.1 Product perspective
Standalone web product. Three internal subsystems: **Simulator UI**, **Engine/Skill API**, **AI Explanation Service** (optional, replaceable by static content).

### 2.2 Product functions (summary)
Onboarding and assessment → realistic simulation → consequence explanation → mistake replay and what-if → recovery practice → mastery testing → skill profile → family dashboard → recommendations.

### 2.3 User classes
| Class | Description | Technical skill |
|---|---|---|
| Learner | Parent/grandparent/new technology user | Low |
| Supporter | Family member with consent | Medium–high |
| Admin/Author (internal) | Adds scenarios via JSON | High |

### 2.4 Operating environment
- Modern mobile and desktop browsers (Chrome, Safari, Edge, Firefox; last 2 versions). Mobile-first, 360px+ width.
- Backend: Python 3.11+, Linux container.
- DB: PostgreSQL 15+ (Supabase).

### 2.5 Design and implementation constraints
- Deterministic engine is the **only** source of simulation truth. AI must not alter state.
- All simulated brands are fictional.
- Stack is fixed (see §2.6). Implementation must be original work developed within the competition window in a new Git repository with regular commits.
- README must document AI usage and the final commit.

### 2.6 Technology stack
| Layer | Technology |
|---|---|
| Frontend framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Client state | Zustand (+ React Query for server state) |
| Charts | Recharts |
| i18n | next-intl (en, ur, ur-Latn "Roman Urdu") |
| Backend | FastAPI (Python), Pydantic v2, SQLAlchemy 2 + Alembic |
| Scenario engine | Python + JSON state machines (validated by JSON Schema) |
| Database | Supabase |
| Auth | Supabase Auth (JWT) |
| AI | Gemini or OpenAI API (explanation layer only) |
| Testing | Pytest, Vitest, Playwright |
| Deployment | Vercel (frontend), Render (backend), Supabase (DB/Auth) |

### 2.7 Module structure (condensed; full tree in `arch.md` §19)
```
himmat/
├── frontend/   (Next.js app: pages, simulator components, replay, DNA, family, i18n)
├── backend/    (FastAPI: api/, engine/, skills/, ai/, db/, scenarios/*.json, tests/)
├── supabase/   (migrations, seed)
├── docs/       (PRD, SRS, arch, dev_plan, AI_USAGE)
└── .github/    (CI workflows)
```

### 2.8 Assumptions and dependencies
- Learner has a device with a browser and internet access during use.
- AI API availability is optional; all critical content has static fallbacks.
- Supabase and hosting accounts are available.

---

## 3. Functional Requirements

Priority key: **P0** essential, **P1** differentiator, **P2** advanced, **P3** future.

### 3.1 Accounts, Onboarding, Preferences
| ID | Requirement | Pri |
|---|---|---|
| FR-1.1 | System shall allow sign-up/login via Supabase Auth (email/password; magic link optional) | P0 |
| FR-1.2 | System shall allow a **demo/guest mode** with no real personal data for judges and first-time trials | P0 |
| FR-1.3 | Learner shall select language: English, Urdu, Roman Urdu | P0 |
| FR-1.4 | Learner shall set accessibility options: text size (3 levels), high contrast, read-aloud on/off | P0 |
| FR-1.5 | System shall run an initial skill assessment (3–5 mini-situations) to seed Digital DNA | P1 |
| FR-1.6 | Learner shall be able to delete their account and all associated data | P1 |

### 3.2 Reality Mode (Simulator)
| ID | Requirement | Pri |
|---|---|---|
| FR-2.1 | System shall render fictional app UIs (chat, bank, wallet, shop, video call, gov portal) inside a phone-frame component | P0 |
| FR-2.2 | Each scenario screen shall be defined by data (component + props) so no code change is needed to add scenarios | P0 |
| FR-2.3 | User shall interact via tap/click/type; inputs accept **simulated values only** | P0 |
| FR-2.4 | System shall display clear "Simulation" indicator at all times so users never confuse it with real apps | P0 |
| FR-2.5 | System shall validate inputs and **reject real-looking sensitive data** (e.g., 16-digit card numbers, CNIC-formatted numbers, real-format OTP entry beyond simulated OTP) with a gentle message | P0 |
| FR-2.6 | System shall support step-back/pause/exit-and-resume of a session | P1 |
| FR-2.7 | Scenarios shall support urgency simulation (e.g., countdown inside the fake message) **without** enforcing time pressure on the learner | P0 |

### 3.3 Scenario Engine and Consequence Engine
| ID | Requirement | Pri |
|---|---|---|
| FR-3.1 | Engine shall load scenarios from JSON validated against a published JSON Schema | P0 |
| FR-3.2 | Each scenario shall define: starting situation, available actions per node, decision branches, consequences, recovery instructions, evaluated skills, completion criteria | P0 |
| FR-3.3 | Engine shall be **deterministic**: same state + same action ⇒ same next node and consequence | P0 |
| FR-3.4 | Engine shall maintain a state object of flags/values (e.g., `sender_verified`, `link_clicked`, `otp_shared`, `risk_score`) | P0 |
| FR-3.5 | After each decision with consequence, system shall show **What happened / Why / What should have happened / What to do differently** | P0 |
| FR-3.6 | Each action shall emit **skill evidence** (positive/negative, weight) tied to a skill ID | P1 |
| FR-3.7 | Engine shall record every step as an immutable **session event** (node, action, state-before, state-after, timestamp, hints used) | P0 |
| FR-3.8 | Engine shall reject invalid actions (not available at current node) with a structured error | P0 |
| FR-3.9 | Scenarios shall support **variants** (parameterized text/sender/amount) for retesting the same skill | P1 |
| FR-3.10 | Scenario completion shall be determined solely by defined completion criteria | P0 |

### 3.4 Mistake Replay and What-if
| ID | Requirement | Pri |
|---|---|---|
| FR-4.1 | System shall generate a **replay timeline** from session events in plain language (numbered steps) | P1 |
| FR-4.2 | Each timeline step shall be marked as safe/risky/neutral with a one-line reason | P1 |
| FR-4.3 | User shall be able to **rewind to any decision step** and choose a different action, creating a **branch session** (`parent_session_id`, `branch_from_step`) | P1 |
| FR-4.4 | System shall present **side-by-side outcome comparison** of original path vs branch | P1 |
| FR-4.5 | Original session data shall remain unmodified when a branch is created | P1 |
| FR-4.6 | Replay tone shall be neutral and non-judgmental (no punitive visuals) | P1 |

### 3.5 Recovery Lab
| ID | Requirement | Pri |
|---|---|---|
| FR-5.1 | System shall offer recovery scenarios: shared OTP, clicked suspicious link, wrong transfer, changed important phone setting, lost account access | P1 |
| FR-5.2 | A recovery scenario shall define an **ordered/partially ordered set of required steps** and optional steps | P1 |
| FR-5.3 | System shall evaluate completeness and order and explain missed or misordered steps | P1 |
| FR-5.4 | A mistake in a main scenario shall offer a direct link into the matching recovery scenario | P1 |

### 3.6 Digital DNA and Mastery
| ID | Requirement | Pri |
|---|---|---|
| FR-6.1 | System shall maintain per-learner, per-skill mastery scores (0–100) across the skill taxonomy: Messaging, Scam Detection, Online Payments, Privacy Settings, Video Calls, Shopping Safety, Government Forms | P1 |
| FR-6.2 | Mastery shall update using weighted evidence with hint-usage penalty (see arch §9) | P1 |
| FR-6.3 | Mastery shall **decay** over time without practice (retention model) | P2 |
| FR-6.4 | System shall recommend the **next scenario** targeting the weakest/most-decayed skill | P1 |
| FR-6.5 | System shall provide an **unaided Mastery Test** (new variant, hints disabled) per skill | P1 |
| FR-6.6 | System shall track a self-reported **confidence rating** (1–5) before/after scenarios | P1 |
| FR-6.7 | System shall display Digital DNA as chart(s) (radar/bar) and trend over time | P1 |

### 3.6.1 Memory Reinforcement
| ID | Requirement | Pri |
|---|---|---|
| FR-6.8 | System shall schedule review of weak skills at increasing intervals (e.g., 1, 3, 7, 14 days) using a different scenario variant | P2 |
| FR-6.9 | System shall measure retained ability on review, not just completion | P2 |

### 3.7 AI Mentor
| ID | Requirement | Pri |
|---|---|---|
| FR-7.1 | Mentor shall accept questions in English, Urdu, Roman Urdu and respond in the learner's language | P2 |
| FR-7.2 | Mentor shall provide **progressive hints** at 3 levels (nudge → pointer → explanation) | P2 |
| FR-7.3 | Mentor shall receive **read-only** scenario context (current node, visible UI text, learner-visible state) | P2 |
| FR-7.4 | Mentor shall **never** perform actions, reveal future branch outcomes prematurely at level 1–2, or alter simulation state | P2 |
| FR-7.5 | Mentor shall be able to ask the learner to explain their decision and respond to the reasoning | P2 |
| FR-7.6 | If the AI service fails or times out, system shall fall back to **pre-authored static hints** per node | P0 |
| FR-7.7 | Mentor output shall pass guardrails (no collection of real personal data, simple language, safe content) | P2 |
| FR-7.8 | Hint usage shall be logged and affect mastery evidence | P2 |

### 3.8 Family Dashboard
| ID | Requirement | Pri |
|---|---|---|
| FR-8.1 | Learner shall invite/link a supporter via share code or email | P2 |
| FR-8.2 | Learner shall grant/revoke **consent by category** (skills summary, difficulty areas, activity timeline) | P2 |
| FR-8.3 | Supporter shall see: mastered skills, difficult situations, areas needing help, progress over time | P2 |
| FR-8.4 | Supporter shall **never** see simulated conversation content or step-level mistakes unless explicitly consented | P2 |
| FR-8.5 | Dashboard shall provide suggestions on how the supporter can help (non-intrusive) | P2 |
| FR-8.6 | Consent revocation shall take effect immediately | P2 |

### 3.9 Digital Escape Room
| ID | Requirement | Pri |
|---|---|---|
| FR-9.1 | System shall support multi-step crisis scenarios with a task chain and branching outcomes | P3 |

### 3.10 Localization and Accessibility
| ID | Requirement | Pri |
|---|---|---|
| FR-10.1 | All UI strings and scenario text shall live in locale files, not code | P0 |
| FR-10.2 | Urdu shall render RTL with an Urdu-suitable font | P2 |
| FR-10.3 | Read-aloud shall use browser Web Speech API (fallback: no audio) | P1 |
| FR-10.4 | Touch targets ≥ 48×48px; contrast ratio ≥ WCAG AA | P0 |

### 3.11 Scenario Content Requirements (initial catalogue)
| ID | Scenario | Required capabilities | Pri |
|---|---|---|---|
| FR-11.1 | **Fake Bank Message** | Inspect sender, open simulated link, fake verification page, OTP decision, report/block, consequence branches, recovery link | P0 |
| FR-11.2 | **Send Money Safely** | Choose recipient, verify account details, confirmation screens, wrong-transfer handling | P0 |
| FR-11.3 | **Video Call Rescue** | Permission prompts, camera/mic fix, join meeting, mute/speaker | P1 |
| FR-11.4 | **Online Shopping Trap** | Suspicious store cues, payment options compare, fake discount detection, order status | P1 |
| FR-11.5 | **Government Portal Challenge** | Form completion, document upload (simulated), required fields, correct a mistake | P1 |

### 3.12 Admin / Content Authoring
| ID | Requirement | Pri |
|---|---|---|
| FR-12.1 | Scenarios shall be added by placing a JSON file in `backend/app/scenarios/` and registering via loader (no code change in engine) | P0 |
| FR-12.2 | CLI/validation script shall validate all scenarios against the schema and detect unreachable nodes and dead ends | P1 |

---

## 4. External Interface Requirements

### 4.1 User interface
- Mobile-first, phone-frame simulator in center; explanation/hint panel adjacent (desktop) or as bottom sheet (mobile).
- Large, high-contrast, low-clutter; one primary action per screen.
- Persistent "This is a practice world — nothing is real" banner.

### 4.2 Software interfaces
| Interface | Purpose | Protocol |
|---|---|---|
| Frontend ⇄ Backend | App data | REST/JSON over HTTPS, JWT bearer |
| Backend ⇄ Supabase Postgres | Persistence | SQLAlchemy (asyncpg) |
| Frontend ⇄ Supabase Auth | Login/session | Supabase JS client |
| Backend ⇄ AI provider | Hints/explanations | HTTPS (Gemini/OpenAI SDK) |

### 4.3 REST API (summary; details in `arch.md` §12)
`/api/v1/health`, `/scenarios`, `/sessions`, `/sessions/{id}/actions`, `/sessions/{id}/replay`, `/sessions/{id}/branch`, `/recovery/*`, `/skills/dna`, `/skills/recommendation`, `/mastery/*`, `/mentor/hint`, `/mentor/ask`, `/family/*`.

### 4.4 Hardware interfaces
None beyond standard device (touchscreen, optional speaker/microphone for read-aloud; microphone only if voice input added in future).

---

## 5. Non-Functional Requirements

### 5.1 Performance
| ID | Requirement |
|---|---|
| NFR-P1 | Scenario action → next-node response ≤ 300 ms p95 (engine only, no AI) |
| NFR-P2 | AI hint response ≤ 4 s p95; timeout at 6 s with static fallback |
| NFR-P3 | First meaningful paint ≤ 2.5 s on 4G mid-range phone |
| NFR-P4 | Frontend bundle for simulator route ≤ 300 KB gzipped (excluding fonts/images) |

### 5.2 Reliability and availability
| ID | Requirement |
|---|---|
| NFR-R1 | Core simulation (non-AI) shall work even if AI provider is down |
| NFR-R2 | Session events shall be persisted per action; resume after refresh |
| NFR-R3 | Target availability 99% during demo/judging period |

### 5.3 Security and privacy
| ID | Requirement |
|---|---|
| NFR-S1 | HTTPS everywhere; JWT validation on all protected endpoints |
| NFR-S2 | Row-level security in Supabase: users read/write only their own data |
| NFR-S3 | No real credentials/OTP/ID/payment data collected; input validators enforce this |
| NFR-S4 | AI prompts shall exclude personal identifiers; learner free-text redacted of digit sequences ≥ 6 |
| NFR-S5 | Secrets only via environment variables; none in repo |
| NFR-S6 | Rate limiting on AI and auth endpoints |
| NFR-S7 | Family data sharing strictly opt-in; revocation immediate |
| NFR-S8 | CORS restricted to known frontend origins |

### 5.4 Usability and accessibility
| ID | Requirement |
|---|---|
| NFR-U1 | A first-time learner shall start a scenario in ≤ 3 taps/clicks after onboarding |
| NFR-U2 | Language level: short sentences, avoid jargon; every technical term has tap-to-explain |
| NFR-U3 | WCAG 2.1 AA targets for contrast and focus; keyboard navigable on desktop |
| NFR-U4 | No punitive visual language (no large red crosses/"You failed") |

### 5.5 Maintainability and extensibility
| ID | Requirement |
|---|---|
| NFR-M1 | Engine, skills, AI, and API layers are separate modules with defined interfaces |
| NFR-M2 | New scenario = new JSON file + optional UI component |
| NFR-M3 | Engine unit-test coverage ≥ 85% |
| NFR-M4 | Linting/formatting enforced (ESLint/Prettier, Ruff/Black) in CI |

### 5.5.1 Explainability
| ID | Requirement |
|---|---|
| NFR-X1 | Every outcome shall be traceable to a node, action, and rule in the scenario JSON |

### 5.6 Portability
Containerized backend (Docker); frontend deployable on any Next.js-compatible host.

---

## 6. Data Requirements

### 6.1 Logical entities
`profiles`, `learner_settings`, `scenarios` (catalogue metadata), `sessions`, `session_events`, `skills`, `skill_scores`, `skill_evidence`, `mastery_attempts`, `review_schedule`, `confidence_ratings`, `family_links`, `consents`, `mentor_messages`.

Full SQL in `arch.md` §11.

### 6.2 Data retention
- Simulated session data retained while the account exists; deleted on account deletion.
- AI prompts/responses stored only as needed for hint history, without PII.

### 6.3 Data integrity
- Session events append-only.
- Branch sessions reference immutable parent sessions.

---

## 7. Scenario Specification Format (normative summary)

```json
{
  "id": "fake_bank_message",
  "version": 1,
  "title": {"en": "...", "ur": "...", "ur-Latn": "..."},
  "skills": ["scam_detection", "otp_safety", "reporting"],
  "initial_node": "n_message_received",
  "initial_state": {"sender_verified": false, "link_clicked": false, "otp_shared": false, "risk": 0},
  "nodes": {
    "n_message_received": {
      "type": "screen",
      "ui": {"component": "ChatThread", "props": {"messageKey": "msg.bank_urgent"}},
      "actions": [
        {"id": "a_inspect_sender", "label_key": "act.inspect_sender", "effects": {"set": {"sender_verified": true}},
         "evidence": [{"skill": "scam_detection", "value": 1, "weight": 0.6}], "next": "n_sender_details"},
        {"id": "a_open_link", "label_key": "act.open_link", "effects": {"set": {"link_clicked": true}, "inc": {"risk": 2}},
         "evidence": [{"skill": "scam_detection", "value": 0, "weight": 0.8}], "next": "n_fake_page"}
      ],
      "hints": ["hint.l1.sender", "hint.l2.sender", "hint.l3.sender"]
    }
  },
  "outcomes": {
    "o_safe": {"criteria": {"otp_shared": false}, "consequence_key": "cons.safe"},
    "o_compromised": {"criteria": {"otp_shared": true}, "consequence_key": "cons.compromised", "recovery": "recovery_shared_otp"}
  }
}
```
Normative JSON Schema lives at `backend/app/scenarios/schema/scenario.schema.json`.

---

## 8. Acceptance Criteria (MVP)

| # | Criterion | Verified by |
|---|---|---|
| AC-1 | User can complete Scenario 1 (Fake Bank Message) through ≥ 2 distinct branches | E2E test + manual |
| AC-2 | Same actions in same order always produce the same outcome | Engine determinism unit tests |
| AC-3 | Consequence panel shows what/why/should/different for every risky decision | UI test |
| AC-4 | Mistake Replay lists all steps; What-if rewind from any decision creates a new branch and comparison view | E2E test |
| AC-5 | Recovery Lab scenario for "shared OTP" evaluates order and completeness | Unit + E2E |
| AC-6 | Digital DNA updates after a session and recommends next scenario | Integration test |
| AC-7 | Scenario 2 (Send Money Safely) playable end-to-end | E2E test |
| AC-8 | Hints work with AI on and fall back to static hints with AI off | Integration test |
| AC-9 | Entering a real-format card/ID number is rejected | Validator tests |
| AC-10 | Family dashboard shows data only for consented categories | Integration test |
| AC-11 | English and Roman Urdu available at minimum; language switch live | Manual + UI test |
| AC-12 | Repo is new, has regular commits, README documents AI usage and final commit; demo video ≤ 2 min | Submission checklist |

---

## 9. Traceability (PRD → SRS)

| PRD feature | SRS requirements |
|---|---|
| F1 Reality Mode | FR-2.x, FR-11.x |
| F2 Consequence Engine | FR-3.x |
| F3 Mistake Replay + What-if | FR-4.x |
| F4 Recovery Lab | FR-5.x |
| F5 Digital DNA | FR-6.x |
| F6 AI Mentor | FR-7.x |
| F7 Family Dashboard | FR-8.x |
| F8 Escape Room | FR-9.x |
| F9 Memory Reinforcement | FR-6.8, FR-6.9 |
| F10 Accessibility/Language | FR-10.x, NFR-U.x |

---

## 10. Appendices

### 10.1 Skill taxonomy (initial)
`messaging`, `scam_detection`, `otp_safety`, `reporting`, `online_payments`, `payment_verification`, `privacy_settings`, `video_calls`, `device_permissions`, `shopping_safety`, `form_completion`, `document_upload`, `account_recovery`.

### 10.2 Glossary of fictional apps
ChatLine (chat), SafeTrust Bank (banking), PaySathi (wallet), BazaarNow (shop), MeetKaro (video), e-Sahulat (government portal). All fictional; none copy real brand assets.