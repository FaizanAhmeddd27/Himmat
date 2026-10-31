# HIMMAT — Digital Life Simulator
## Product Requirements Document (PRD)

> **Tagline:** Learn it. Break it. Recover from it. Master it.
> **Event:** Build4Better Hackathon
> **Version:** 1.0 | **Date:** 31 Oct 2026 | **Status:** Approved for build

---

## 1. Vision

HIMMAT is an interactive simulator of everyday digital life. It lets people who did not grow up with technology (parents, grandparents, first-time smartphone users) **safely experience** real digital situations, make mistakes, see the consequences, and learn to recover, without risking real accounts, money, or identity.

> "We don't want parents to call their children every time technology becomes confusing. We want them to become confident enough to handle it themselves. HIMMAT doesn't do things for them. It prepares them for the real world."

**One-line positioning:** Not another chatbot that does things *for* you. A safe practice world that makes you able to do things *yourself*.

---

## 2. Problem Statement

### 2.1 The problem
Older adults and first-generation technology users depend on family members for routine digital tasks (messages, payments, video calls, forms) and are disproportionately targeted by scams.

### 2.2 Why existing solutions fall short
| Existing approach | Gap |
|---|---|
| AI assistants / chatbots ("is this message fake?") | They do the thinking for the user. Dependency increases, skill does not. |
| Video tutorials / how-to guides | Passive. No practice, no consequences, no recovery. |
| Quiz-style scam awareness | Multiple-choice does not feel like the real thing; knowledge does not transfer. |
| Generic "digital skills" courses | Same course for everyone; skill improves but **confidence does not**. |

### 2.3 Research grounding (from competition research)
1. A 2024 review of 30 studies lists **unfamiliarity, emotional barriers, limited access, and physical difficulties** as main barriers to digital learning in older adults.
2. A 2023 study of 270 older adults found **proficiency improved after training but confidence did not** significantly. Teaching skill and building confidence are different problems.
3. A 2026 CHI project (DeepAware) found promise in **personalized, realistic simulations** and safe practice for older adults.
4. Scam games, simulated inboxes, and AI tutors already exist, so gamification or a chatbot alone is not a differentiator. HIMMAT goes one level deeper: **what happens when you click, how to recognize mistakes, how to recover independently.**

### 2.4 What Build4Better asks for
- Target users: parents, grandparents, people who didn't grow up with technology.
- Goal: help them understand, practise, and confidently complete everyday digital tasks.
- Bring people **closer to** technology instead of doing things for them.
- Originality required; implementation must be our own.
- Judges must see a **working demo** and understand **how the solution builds confidence**.

---

## 3. Goals and Non-Goals

### 3.1 Goals
- G1. Let users practise realistic digital situations in a fully simulated, risk-free environment.
- G2. Make every decision produce an **explainable, deterministic** consequence.
- G3. Teach **recovery**, not only prevention.
- G4. Measure **retained ability and confidence**, not lesson completion.
- G5. Keep the user in control: AI explains and hints but never performs the task.
- G6. Support Urdu, Roman Urdu, and English.
- G7. Give families consent-based visibility so support is targeted and respectful.

### 3.2 Non-Goals
- Not a real banking, messaging, or government app. Nothing real is ever connected.
- No collection of real OTPs, credentials, ID documents, or payment details.
- AI never decides simulation outcomes.
- No shaming, scoring-for-ranking, or exposing private learner activity to family without consent.
- No copying of real brands' or government portals' login pages. Fictional interfaces *inspired by* familiar experiences only.

---

## 4. Target Users and Personas

### 4.1 Primary — The Learner
**Persona: Amna (58), homemaker, Lahore**
- Has a smartphone; uses WhatsApp for family calls and voice notes.
- Calls her son whenever a message looks "official" or urgent.
- Afraid of "pressing the wrong button". Reads Urdu comfortably, limited English.
- Needs: large text, simple language, voice support, no time pressure, no humiliation.

**Persona: Abdul Rehman (72), retired teacher**
- Uses a phone for calls; wants to join video calls with grandchildren abroad and use mobile payments.
- Mild vision and tremor issues. Needs large touch targets and high contrast.

### 4.2 Secondary — The Family Supporter
**Persona: Bilal (29), software engineer, Karachi**
- Wants his parents to be safer and more independent, but can't be on call 24/7.
- Needs: a progress view, not surveillance; to know *which* skills need help.

### 4.3 Tertiary (future)
Community digital-literacy trainers, NGOs, banks and telcos running awareness programmes.

---

## 5. Core Concept — How HIMMAT Works

```
Create profile → Skill assessment → Enter realistic simulation
   → Decision + Consequence Engine → Mistake Replay / What-if
   → Recovery Lab → Mastery Test (no hints) → Digital DNA updated
   → Family dashboard (consent-based) → Next recommended scenario
```

**Key principle:** A deterministic scenario engine (JSON state machines) is the **source of truth**. AI is only the **explanation layer** (hints, simplification, language support).

---

## 6. Features

### 6.1 Priority overview
| Priority | Features |
|---|---|
| **P0 — Essential** | Reality Mode simulator, branching scenarios, Consequence Engine |
| **P1 — Differentiators** | Mistake Replay + What-if, Recovery Lab, Digital DNA |
| **P2 — Advanced** | AI Mentor, Family Dashboard, Urdu / Roman Urdu |
| **P3 — Future vision** | Voice-call simulations, deepfake awareness, adaptive scenario generation, full spaced repetition |

### 6.2 Feature specifications

#### F1. Reality Mode (P0)
Realistic, fully fictional UIs rendered inside a phone frame:
- Chat app (WhatsApp-style, fictional "ChatLine")
- Mobile banking (fictional "SafeTrust Bank")
- Mobile wallet transfer (Easypaisa/JazzCash-style, fictional "PaySathi")
- Online shopping (fictional "BazaarNow")
- Video call app (fictional "MeetKaro")
- Government portal (fictional "e-Sahulat")

All accounts, balances, OTPs, links, and transactions are simulated. Any OTP/credential field accepts only simulated values.

#### F2. Consequence Engine (P0)
Every action changes simulation state. After each meaningful decision the user sees:
1. **What happened?**
2. **Why did it happen?**
3. **What should have happened?**
4. **What could you do differently?**

Example: sharing the simulated OTP leads to a "compromised account" branch; verifying the sender first opens the "safe path".

#### F3. Mistake Replay + What-if Engine (P1) — *Signature feature*
After a scenario (especially a mistake) the user sees a **timeline replay** of their decision path, e.g.:
1. Received urgent message → 2. Trusted sender without checking → 3. Opened link → 4. Entered simulated OTP → 5. Simulated account compromised.

Then **"What if?"**: rewind to any decision step, pick another action, and **compare outcomes side by side** (original path vs alternate path).

#### F4. Recovery Lab (P1)
Teaches what to do **after** a mistake:
- Accidentally shared an OTP
- Clicked a suspicious link
- Sent money to a wrong (simulated) recipient
- Changed an important phone setting
- Lost access to an account

The user practises the correct recovery **sequence** (e.g., contact bank via official channel → block card → change PIN → report). Order and completeness are evaluated.

#### F5. Digital DNA — Personal Skill Intelligence (P1)
A dynamic skill profile instead of a fixed course:

| Skill | Example mastery |
|---|---|
| Messaging | 90% |
| Scam detection | 35% |
| Online payments | 45% |
| Privacy settings | 70% |
| Video calls | 85% |

The engine finds weak skills and **recommends the next simulation**. Mastery reflects *retained* ability (decays without practice) and *independence* (hint usage lowers evidence).

#### F6. Invisible AI Mentor (P2)
Never performs the task. It can:
- Explain unfamiliar buttons and terms.
- Understand **Urdu, Roman Urdu, and English** questions.
- Give **progressive hints** (nudge → pointer → explanation).
- Explain mistakes in simple language.
- Ask the user to explain their decision ("Why did you choose this?").

#### F7. Family Intelligence Dashboard (P2)
With the learner's explicit consent, a family supporter sees:
- Skills mastered, situations causing difficulty, where help is needed, progress over time.
- **Never** exposed: private conversation content, raw mistakes presented as shaming, anything the learner hasn't consented to share.

#### F8. Digital Escape Room (P2/P3)
A multi-step crisis scenario (suspicious message + locked account + someone pretending to be family). The user completes a chain of safe actions; every decision affects the outcome.

#### F9. Memory Reinforcement Engine (P2/P3)
Resurfaces a **different variant** testing the same skill after a suitable interval (spaced repetition). Measures retained ability, not completed lessons.

#### F10. Accessibility and Language (cross-cutting, P0/P2)
- Large-text mode, high-contrast mode, minimum 48px touch targets.
- Read-aloud (text-to-speech) for screens and explanations.
- RTL layout and Urdu typography (Nastaliq-friendly font), Roman Urdu, English.
- Calm tone, no timers that punish (urgency is *simulated by the scenario*, not enforced on the user).

---

## 7. Scenario Catalogue

| # | Scenario | Skills trained | MVP target |
|---|---|---|---|
| 1 | **The Fake Bank Message** | Identify suspicious sender, detect urgency/manipulation, OTP safety, safe reporting | **Fully polished** |
| 2 | **Send Money Safely** | Select recipient, verify account details, read confirmation screens, handle wrong transfer | **Fully polished** |
| 3 | **Video Call Rescue** | Mic/camera permissions, fix camera issues, join a meeting, mute/speaker settings | Polished if time allows |
| 4 | **Online Shopping Trap** | Spot suspicious stores, compare payment options, recognize fake discounts, check order status | Functional |
| 5 | **Government Portal Challenge** | Complete application, upload document, understand required fields, correct a mistake | Functional / stretch |

Scenario authoring is **data-driven** (JSON), so new scenarios need no engine changes.

---

## 8. User Journeys

### 8.1 Learner — first session
1. Opens HIMMAT → chooses language (Urdu / Roman Urdu / English) and accessibility options.
2. Short skill assessment (3–5 mini situations) → initial Digital DNA.
3. Dashboard recommends "The Fake Bank Message".
4. Plays in Reality Mode; makes a choice; sees consequence.
5. Watches Mistake Replay; uses What-if to try a safer choice.
6. Completes Recovery Lab if a mistake happened.
7. Takes an unaided Mastery Test (new variant, no hints).
8. Sees updated Digital DNA and next recommendation.

### 8.2 Family supporter
1. Learner invites family member (or generates a share code) and **grants consent per category**.
2. Supporter opens the Family Dashboard → skill levels, trends, "needs help with" list, suggested ways to help.

---

## 9. Success Metrics

### 9.1 Product metrics
| Metric | Target (post-MVP) |
|---|---|
| Scenario completion rate | ≥ 70% |
| Mistake → improved decision on What-if retry | ≥ 60% |
| Unaided mastery pass rate after Recovery Lab | ≥ 65% |
| Self-reported confidence (1–5) change after 3 scenarios | +1.0 or more |
| Hint dependency (hints per scenario) trending down across sessions | Decreasing |
| Family-supporter "calls for help" self-report | Decreasing |

### 9.2 Hackathon success criteria
- Live demo works end-to-end in ≤ 2 minutes.
- Judges can see: Reality Mode → Consequence → Mistake Replay/What-if → unaided re-test → Family dashboard.
- Clear explanation of **how confidence is built**.

---

## 10. Competitive Landscape and Differentiation

| Concept | Typical offering | HIMMAT difference |
|---|---|---|
| AI tutor / chatbot | Answers questions | AI never acts; practice world is deterministic and explainable |
| Scam quiz games | Multiple choice | Realistic interfaces with branching consequences |
| Simulated inbox trainers | Spot phishing | Plus recovery, replay, what-if, mastery tracking |
| Digital skills courses | Fixed curriculum | Personalized Digital DNA, spaced reinforcement |

Alternative concepts considered (folded into HIMMAT): *Digital Time Machine* (decision rewind), *ScamVerse* (threat-awareness world), *Digital Independence OS* (measuring independence).

---

## 11. Technology Summary (full detail in `arch.md`)

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | FastAPI (Python) |
| Scenario engine | Python + JSON state machines |
| Database | PostgreSQL / Supabase |
| Auth | Supabase Auth |
| AI explanations | Gemini or OpenAI API |
| Deployment | Vercel (frontend) + Render (backend) |

Top-level structure: `frontend/`, `backend/`, `supabase/`, `docs/`, `.github/`. Full tree in `arch.md` §19.

---

## 12. Constraints and Compliance

- **Competition rules (verify against the official rulebook before submitting):**
  - Official build window **9 AM–5 PM on 31 October**.
  - **New repository** with **regular Git commits** throughout the build.
  - **Maximum 2-minute demo video.**
  - **README** documenting **AI usage** and the **final commit**.
  - Originality: implementation must be our own.
- **Safety:** no real OTPs, credentials, ID documents, or payment info, ever.
- **Branding:** fictional apps only; no copied bank or government login pages.
- **Privacy:** family sharing is opt-in and category-based.

---

## 13. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Scope too big for the build window | Unfinished demo | Strict P0→P1→P2 order; MVP = 2 polished scenarios (+ third if time); seeded dashboard data |
| AI hallucinating security outcomes | Wrong teaching | Deterministic engine is source of truth; AI is read-only explainer with static fallbacks |
| AI API failure or latency during demo | Demo breaks | Pre-authored hints per node; cached explanations; AI optional |
| Users feel judged by mistakes | Disengagement | Neutral tone, replay-as-learning, no red-cross shaming |
| Sensitive data misuse | Trust/legal | Simulated data only, field validators reject real-looking numbers, consent-based sharing |
| Urdu rendering/RTL bugs | Poor UX | Early RTL pass, dedicated font, locale files from day one |
| Looks like a copy of real brands | Rule/IP issue | Fictional brand names and original visuals |

---

## 14. Roadmap

| Phase | Scope |
|---|---|
| **MVP (hackathon, 31 Oct)** | Engine, Scenarios 1–2 (+3), Consequence Engine, Mistake Replay + What-if, basic Recovery Lab, Digital DNA, seeded Family Dashboard, EN + Roman Urdu/Urdu strings, demo video, README |
| **v1.0** | Scenarios 3–5 polished, AI Mentor, real family linking with consent, spaced repetition, full Urdu |
| **v1.5** | Digital Escape Room, voice-call scam simulations, deepfake awareness module |
| **v2.0** | Adaptive scenario generation (AI-authored, validated against engine schema), partner/NGO dashboards, offline-capable PWA |

---

## 15. Demo Plan (2 minutes) — "A Mother's Digital Independence Journey"

| Time | Segment | Shows |
|---|---|---|
| 0:00–0:20 | The problem | Fictional mother depends on her son for every unfamiliar message |
| 0:20–0:45 | Reality Mode | Realistic fake bank message; she makes a decision |
| 0:45–1:10 | Consequence Engine | Decision changes the simulation; what/why/should-have |
| 1:10–1:30 | Mistake Replay + What-if | Rewind, choose safer action, compare |
| 1:30–1:45 | Independent mastery | New scenario, no hints, she spots the danger |
| 1:45–2:00 | Family dashboard | Digital DNA improvement and remaining support areas |

**Closing line:** "We don't want parents to call their children every time technology becomes confusing. We want them to become confident enough to handle it themselves. HIMMAT doesn't do things for them. It prepares them for the real world."

---

## 16. Open Questions
- Team size and role split (affects `dev_plan.md` tracks).
- Hosting accounts ready (Vercel, Render, Supabase) before the build starts?
- Which AI provider key is available (Gemini vs OpenAI)?
- Final decision on languages shipped in the MVP (EN + Roman Urdu minimum; Urdu script if time allows).