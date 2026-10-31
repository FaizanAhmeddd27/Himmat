# HIMMAT — Development Plan (Phase-wise)

**Event:** Build4Better Hackathon | **Build window:** 31 Oct 2026, 9:00 AM–5:00 PM (PKT)
**Plan starts:** 10:45 AM → about **6 h 15 min** left. Every phase below has a time box. When the time is up, we move on.

> **One-line goal:** By 5:00 PM we submit a working HIMMAT where a user plays a fake-bank-message scam, sees what went wrong, rewinds and tries again, practises recovery, and sees their skills improve, plus a README and a 2-minute demo video.

---

## 1. The Big Picture (read this first)

Think of building HIMMAT like building a house. We lay the foundation, put up the walls, add the special rooms, decorate, and then hand over the keys.

| Phase | Name | Time | In simple words | Priority |
|---|---|---|---|---|
| **1** | Setup | 10:45–11:15 | Create the repo and empty frontend/backend so everyone can start working | Must |
| **2** | Core Game (Scenario 1) | 11:15–1:30 | Build the "Fake Bank Message" scenario so it can be played start to finish | **P0 — Must** |
| **3** | Replay and What-if | 1:30–2:30 | Show the user their mistakes as a timeline, let them rewind and try another choice | **P1 — Must** |
| **4** | Learning Features | 2:30–3:45 | Recovery Lab, Digital DNA (skill scores), Scenario 2, and put the app online | **P1 — Must** |
| **5** | Extras | 3:45–4:15 | AI hints, Family dashboard, Roman Urdu | P2 — Nice to have |
| **6** | Polish, Demo, Submit | 4:15–5:00 | Fix bugs, record the video, finish README, submit | **Must** |

**Hard deadlines:** Phase 2 working by **1:30 PM**. Phase 4 working by **3:45 PM**. **Feature freeze at 4:15 PM**: no new features after this.

---

## 2. Who Does What (3 roles)

If you have fewer people, combine roles. Solo? Follow the order Phase 1 → 6 and do all roles yourself.

| Role | Name it | Works on | Short name |
|---|---|---|---|
| **A** | Backend / Engine | FastAPI, scenario engine, database, skill scores | "The Brain" |
| **B** | Frontend / Simulator | Next.js, fake phone screens, what the user sees | "The Face" |
| **C** | Content / AI / Docs | Scenario JSON, text in languages, hints, README, demo video | "The Story" |

**Golden rule for teamwork:**
1. In Phase 1, agree on the **API shape** (what the backend sends, what the frontend expects, see `arch.md` §12). Role B can use fake/mock data until Role A is ready, so nobody waits.
2. Everyone commits **every 20–30 minutes** with a clear message.
3. If you are stuck for more than **15 minutes**, ask a teammate.

---

## 3. Phase-by-Phase Plan

---

### PHASE 1 — Setup  (10:45 – 11:15, 30 min)

**Goal:** Everyone can run the project on their laptop.

| Role | Tasks |
|---|---|
| **A (Brain)** | Create `backend/` with FastAPI. Add `/api/v1/health` endpoint. Create Supabase project and share keys privately. |
| **B (Face)** | Create `frontend/` with Next.js + TypeScript + Tailwind + shadcn/ui. Install Framer Motion, Recharts, Zustand, React Query, next-intl. |
| **C (Story)** | Create the **new GitHub repo** `himmat`. Add `README.md` stub, `.gitignore`, `.env.example`, and `docs/` with PRD, SRS, arch, dev_plan. Agree on the API shape with A and B. |

**Output:** Repo with `frontend/`, `backend/`, `docs/`. Frontend opens in browser. Backend `/health` returns 200.

**Done when:**
- [ ] New repo exists and all 3 people can push to it
- [ ] `npm run dev` shows a landing page
- [ ] `uvicorn app.main:app --reload` and `/api/v1/health` works
- [ ] Supabase project exists
- [ ] First commit pushed: `chore: scaffold frontend and backend`

---

### PHASE 2 — Core Game: Scenario 1 "Fake Bank Message"  (11:15 – 1:30, 2 h 15 min, includes short lunch)

**Goal:** A user can play the full fake-bank-message story, make choices, and see the consequences.

**Why this matters:** This is the heart of HIMMAT. If this works, we already have a demo. Everything else builds on top of it.

#### Step 2.1 — Build the pieces (11:15 – 12:15)

| Role | Tasks |
|---|---|
| **A (Brain)** | Build the **scenario engine**: load scenario JSON, keep state, apply an action, return next screen + consequence. Same action must always give the same result. Files: `engine/models.py`, `loader.py`, `state_machine.py`, `consequence.py`. Add `POST /sessions` and `POST /sessions/{id}/actions` (in-memory first). |
| **B (Face)** | Build the shell: layout, "Practice world, nothing is real" banner, `PhoneFrame`, `ScenarioPlayer` that calls the API, text-size toggle. |
| **C (Story)** | Write `fake_bank_message.json` (screens, choices, outcomes). Write English + Roman Urdu text. Write 3-level hints for every decision screen. |

#### Step 2.2 — Make it playable (12:15 – 1:00)

| Role | Tasks |
|---|---|
| **A** | Save sessions and every step (events) to the database. Refresh mid-game should resume. Add input safety (reject real-looking card/CNIC numbers). |
| **B** | Build fake apps: `ChatLine` chat thread, `SenderDetails`, `FakeVerifyPage`. Build `ConsequencePanel` showing: **What happened / Why / What should have happened / What to do differently**. |
| **C** | Test every path in the scenario. Fix wording. Make sure the tone is calm and never shames the user. |

#### Step 2.3 — Checkpoint (1:00 – 1:30)  *(short lunch + test)*
Everyone plays Scenario 1 through **all branches** together and fixes blockers. Tag `v0.1-p0`.

**Output:** Scenario 1 playable start to finish with consequences.

**Done when:**
- [ ] User can reach a safe ending AND a compromised ending
- [ ] Consequence panel shows 4 parts after risky choices
- [ ] Same choices always give the same result
- [ ] Entering a 16-digit card number is rejected gently
- [ ] Refresh mid-game does not lose progress
- [ ] Commits: `feat(engine): state machine`, `feat(ui): phone frame and player`, `feat: scenario 1 playable end-to-end`

---

### PHASE 3 — Signature Feature: Mistake Replay + What-if  (1:30 – 2:30, 1 hour)

**Goal:** After the game, show the user their path step by step, let them rewind to a choice, pick differently, and compare both outcomes.

**Why this matters:** This is what makes HIMMAT different from every scam quiz. Judges should remember this.

| Role | Tasks |
|---|---|
| **A (Brain)** | `replay.py` (turn saved steps into a plain-language timeline, each step tagged safe / risky / neutral). `branching.py` (create a new session from an earlier step, original stays untouched). Endpoints: `GET /sessions/{id}/replay`, `POST /sessions/{id}/branch`, `GET /sessions/{id}/compare/{branchId}`. |
| **B (Face)** | `ReplayTimeline`, `WhatIfPicker` ("What if I checked the sender?"), `OutcomeComparison` side-by-side. Use Framer Motion for smooth rewind animation. |
| **C (Story)** | Write the replay sentences for each step (e.g., "You trusted the sender without checking"). Keep the tone kind. |

**Output:** Replay page + What-if + side-by-side comparison.

**Done when:**
- [ ] Replay lists every step the user took with a safe/risky tag
- [ ] User can rewind to any decision and choose another action
- [ ] Original run is unchanged; new run is shown beside it
- [ ] Commit: `feat: mistake replay and what-if`

---

### PHASE 4 — Learning Features: Recovery Lab, Digital DNA, Scenario 2, Deploy  (2:30 – 3:45, 1 h 15 min)

**Goal:** Teach recovery after mistakes, track skills, add a second scenario, and put the app online.

#### Step 4.1 — Recovery Lab + Digital DNA (2:30 – 3:15)

| Role | Tasks |
|---|---|
| **A (Brain)** | `recovery.py` + `recovery_shared_otp.json` (user must do recovery steps in a sensible order). Skill scoring: `skills/mastery.py`, `recommender.py`. Endpoints: `/skills/dna`, `/skills/recommendation`, `/mastery/start` (test with no hints). |
| **B (Face)** | `StepSequencer` (Recovery Lab UI), `SkillRadar` chart, recommendation card on dashboard, Mastery Test mode (hints turned off). |
| **C (Story)** | Write recovery steps and explanations. Start Scenario 2 JSON `send_money_safely`. |

#### Step 4.2 — Scenario 2 + Deploy (3:15 – 3:45)

| Role | Tasks |
|---|---|
| **A** | Deploy backend on Render. Set environment variables. |
| **B** | Build `PaySathi` screens for Scenario 2. Deploy frontend on Vercel. |
| **C** | Finish Scenario 2 content (wrong transfer branch). Smoke-test the live URLs. |

**Output:** Recovery Lab works, Digital DNA updates after each play, Scenario 2 is playable, app is live online.

**Done when:**
- [ ] Wrong recovery order is flagged and explained
- [ ] After playing Scenario 1, "scam detection" score changes and next scenario is recommended
- [ ] Mastery Test runs with hints off
- [ ] Scenario 2 playable (or clearly marked as stretch)
- [ ] Live Vercel + Render URLs work
- [ ] Commits: `feat: recovery lab and digital dna`, `feat: scenario 2`, `chore: deploy`

---

### PHASE 5 — Extras (Nice to have)  (3:45 – 4:15, 30 min)

**Goal:** Add the "wow" extras only if Phases 1–4 are working.

| Role | Tasks |
|---|---|
| **A (Brain)** | AI mentor endpoint `/mentor/hint` (Gemini/OpenAI). Hide personal numbers, 6-second timeout, **fall back to the written hints** if AI fails. AI must never change the game. Family dashboard API that shows only what the learner agreed to share. Run `seed_demo_data.py`. |
| **B (Face)** | Hint drawer (3 levels). Family dashboard page with consent toggles. Language switch English ↔ Roman Urdu. |
| **C (Story)** | Prepare demo seed data (learner "Amna", supporter "Bilal"). Write `AI_USAGE.md`. Draft the README. |

**Output:** AI hints, family dashboard (seeded data is fine), language switch.

**Done when:**
- [ ] Hints work with AI on, and still work with AI off
- [ ] Family dashboard shows only consented categories
- [ ] English and Roman Urdu both work for Scenario 1
- [ ] Commits: `feat: ai hints with fallback`, `feat: family dashboard`

**If we are behind, cut in this order:** Scenario 2 → real family linking (keep seeded data) → Urdu script → live AI calls (keep written hints) → spaced repetition.

---

### PHASE 6 — Polish, Demo, Submit  (4:15 – 5:00, 45 min)

**Goal:** A clean, working submission handed in before the deadline.

#### Step 6.1 — Feature freeze + polish (4:15 – 4:30)
No new features. Everyone fixes bugs, empty screens, mobile layout, text size, contrast, button size (at least 48px).

#### Step 6.2 — Record demo (4:30 – 4:45)
Follow the 2-minute story:

| Time | Show |
|---|---|
| 0:00–0:20 | The problem: a mother calls her son for every confusing message |
| 0:20–0:45 | Fake bank message in the simulator, she taps the link |
| 0:45–1:10 | She enters the practice OTP; consequence panel explains what happened |
| 1:10–1:30 | Mistake Replay: rewind, choose "inspect sender", compare outcomes |
| 1:30–1:45 | New scenario, no hints, she spots the danger herself |
| 1:45–2:00 | Family dashboard shows skills improving |

**Closing line:** "We don't want parents to call their children every time technology becomes confusing. We want them to become confident enough to handle it themselves. HIMMAT doesn't do things for them. It prepares them for the real world."

#### Step 6.3 — Submit (4:45 – 5:00)
- Finish README: what it is, how to run, architecture, **AI usage**, limitations, **final commit hash**
- Make the final commit and push
- Check the live URL and the video link
- Submit

**Done when:**
- [ ] Demo video is **2 minutes or less**
- [ ] README has AI usage and the final commit hash
- [ ] Live URL works; local copy also runs as a backup
- [ ] Submitted before 5:00 PM (aim for 4:45 to leave a safety buffer)

---

## 4. Competition Rules Checklist (do not skip)

> From the rulebook summary. **Re-verify against the official PDF before submitting.**

- [ ] **New repository** created for this build
- [ ] **Regular Git commits** during the window (every 20–30 minutes)
- [ ] All app code written between **9 AM and 5 PM** on 31 Oct (docs and planning are fine)
- [ ] **README** includes overview, setup, **AI usage**, **final commit hash**
- [ ] **Demo video ≤ 2 minutes**
- [ ] Original work, **fictional** apps and brands only (no real bank or government look-alikes)
- [ ] No real OTPs, passwords, ID numbers, or card details anywhere

---

## 5. Simple Rules for the Whole Team

1. **Scenario 1 first.** One scenario done perfectly beats five half-done.
2. **The engine decides, AI only explains.** AI never decides what happens in the simulation.
3. **Never cut:** Scenario 1, Consequence panel, Replay + What-if, Digital DNA view, README, demo video.
4. **Commit often.** Every 20–30 minutes, with a clear message (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
5. **Tags:** `v0.1-p0` after Phase 2, `v0.2-p1` after Phase 4, `v1.0-submission` at the end.
6. **Main branch always works** after 3 PM. Do not push broken code at the end.
7. **Stuck for 15 minutes? Ask.**

---

## 6. Risks (and what we do about them)

| Risk | How likely | What we do |
|---|---|---|
| Running out of time | High | Follow the cut order; use seeded data; written hints |
| Engine bugs late in the day | Medium | Write determinism tests first; freeze at 4:15 |
| Deployment problems | Medium | Deploy a skeleton early; keep a local copy ready |
| Urdu script layout issues | Medium | Ship English + Roman Urdu first |
| AI API fails or is slow | Medium | Written hints always work; AI is optional |
| Database permission (RLS) errors | Medium | Use the service role on the backend for the MVP, tighten later |
| Demo recording takes too long | Medium | Script is ready; rehearse once; keep 4:30–4:45 free |

---

## 7. MVP Definition of Done

- [ ] Scenario 1 playable across at least 2 different endings; same choices always give the same result
- [ ] Consequence panel shows What happened / Why / Should have / Do differently
- [ ] Mistake Replay and What-if with side-by-side comparison work
- [ ] Recovery Lab (shared OTP) checks order and completeness
- [ ] Digital DNA updates and recommends the next scenario
- [ ] Scenario 2 playable (or documented as stretch)
- [ ] AI hints with written fallback; AI never changes the game
- [ ] Family dashboard shows only consented data
- [ ] English + Roman Urdu available
- [ ] Live deployment + local backup
- [ ] README (with AI usage + final commit) and ≤ 2-minute demo video submitted before 5:00 PM

---

## 8. Quick-Start Commands (Phase 1)

```bash
# Repo
git init himmat && cd himmat
mkdir docs        # copy PRD.md SRS.md arch.md dev_plan.md into docs/

# Frontend
npx create-next-app@latest frontend --ts --tailwind --app --eslint --src-dir
cd frontend && npx shadcn@latest init
npm i framer-motion recharts zustand @tanstack/react-query next-intl zod react-hook-form @supabase/supabase-js lucide-react
cd ..

# Backend
mkdir -p backend/app && cd backend
python -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings sqlalchemy asyncpg alembic \
            jsonschema python-jose httpx slowapi pytest pytest-asyncio ruff black mypy \
            google-generativeai openai
uvicorn app.main:app --reload --port 8000

# Validate scenarios (once created)
python scripts/validate_scenarios.py
```

---

## 9. After the Hackathon (Roadmap)

| Phase | When | What |
|---|---|---|
| **A — Stabilize** | Week 1–2 | Tighten database security, proper tests, real family linking, finish Scenarios 3–5 in all languages |
| **B — Learning science** | Weeks 3–6 | Spaced repetition with reminders, confidence-vs-skill analytics, pilot with 10–20 real learners |
| **C — Differentiation** | Weeks 7–12 | Digital Escape Room, voice-call scam simulation, deepfake awareness, voice interface |
| **D — Scale** | Months 3–6 | AI-proposed scenarios (human-reviewed), NGO/bank/telco dashboards, offline PWA, more languages |