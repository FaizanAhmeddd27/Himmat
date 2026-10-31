# HIMMAT: Digital Life Simulator

**Learn it. Break it. Recover from it. Master it.**

HIMMAT is a practice phone for parents, grandparents and anyone who did not grow up with technology. A scam message arrives. You tap what you would really tap, see what it costs in practice money, rewind the choice, and learn what to do if it ever happens for real. Nothing in it can touch a real account.

> "We don't want parents to call their children every time technology becomes confusing. We want them to become confident enough to handle it themselves. HIMMAT doesn't do things for them. It prepares them for the real world."

Built for the Build4Better hackathon, 31 October 2026.

## What you can do

| Feature | What it does |
|---|---|
| **Reality Mode** | A phone with fictional apps. You tap the sender's name or the link in the message, with no quiz buttons. |
| **Consequence Engine** | Choices change what happens. Sharing the code shows a bank alert: PKR 48,500 of practice money gone. Then four plain questions: what happened, why, what should have happened, and what to do differently. |
| **Mistake Replay + What-if** | Your path, step by step. Rewind any decision, choose again, and see both endings side by side: PKR 1,500 or PKR 50,000. |
| **Recovery Lab** | Put the steps in order after sharing an OTP, with feedback on each step. |
| **Mastery test** | A new scam, a lucky draw, with hints switched off, to show what you can do alone. |
| **Digital DNA** | Skill scores that change with what you do, how sure you feel before and after, and a next step chosen from your own results. |
| **Ustad** | Three levels of written hints, plus an AI that answers questions in English or Roman Urdu. |
| **Family dashboard** | The learner chooses what a family member sees, by category. Mistakes are never shown. |
| **Accessibility** | Three text sizes, high contrast, read aloud, tap targets of at least 44px, and Roman Urdu. |

## The core rule

**The engine decides. AI only explains.**

Every outcome comes from a deterministic state machine reading JSON scenarios, so the same choices always give the same result and every result traces back to a rule. The AI never sees what a choice leads to and has no way to change anything. Written hints are shown exactly as authored, because safety wording should not be paraphrased by a model.

## Run it

Full steps, a guided walkthrough and troubleshooting are in **[docs/HOW_TO_RUN.md](docs/HOW_TO_RUN.md)**. Short version:

```powershell
# Terminal 1
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env
.venv\Scripts\python -m uvicorn app.main:app --port 8000

# Terminal 2
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. Without a Groq key everything still works except free-text questions to Ustad.

## Architecture

```
Next.js frontend  --REST-->  FastAPI backend
                               |- engine/   state machine, replay, branching, recovery, input safety
                               |- skills/   Digital DNA, mastery, recommendations, family consent
                               |- ai/       Groq client, prompt rules, guardrails (read-only)
                               |- scenarios/*.json   all scenario content, in two languages
```

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion, Recharts, Zustand |
| Backend | FastAPI, Pydantic v2 |
| AI | Groq, explanation only, with a written fallback |
| Tests | Pytest (engine, replay, recovery, skills, AI guardrails), ESLint, Ruff, Black, mypy |

Sessions are event-sourced: every choice is an immutable event holding the state before and after it. That is what makes replay and What-if possible, and a What-if branch never modifies the original try. A new scenario is a new JSON file, with no engine change. The full design is in [docs/ARCH.md](docs/ARCH.md).

## Safety

- HIMMAT never connects to a real bank, wallet, messaging service or government system.
- The OTP field accepts only the practice code on screen. Card and CNIC-shaped numbers are refused with a calm message.
- All brands are fictional (ChatLine, SafeTrust Bank, InamGhar), and all links use the reserved `.example` domain, so they can never reach a real site.
- Personal numbers and emails are stripped from questions before they reach the AI. Replies that ask for a code, or pick the answer for the learner, are blocked.
- Secrets live only in `backend/.env`, which git ignores.

## AI usage

The rules ask for this, so here it is in full. Details are in [docs/AI_USAGE.md](docs/AI_USAGE.md).

- **ChatGPT:** concept research and the product idea.
- **OpenCode (Claude):** project scaffolding: backend skeleton, frontend scaffold, config and docs.
- **Claude Code:** most of the application code, scenario content, tests and documentation, directed and reviewed by the team.
- **In the app:** Groq (`openai/gpt-oss-20b`) answers free-text questions to Ustad. It never decides an outcome.

## Limitations

Built in one day, so here is what is not done:

- **Content:** one practice scenario, one mastery scenario and one recovery lab. Send Money, Video Calls, Shopping and Government Forms are planned, and Digital DNA shows those skills as sample starting points.
- **Accounts:** guest mode is the default, with a random ID kept in the browser. Sign-in pages are built on Supabase but need its keys, and the backend does not check sign-in tokens yet, so a profile is protected only by its long random ID.
- **Family:** a supporter opens a private link rather than linking two accounts. Anyone with that link sees what the learner chose to share.
- **Storage:** JSON files on the server, not Postgres. Swapping only touches the store modules.
- **Language:** English and Roman Urdu. Urdu script is not shipped, and a few labels inside the fake apps stay in English.
- **Learning science:** the dashboard schedules practice again at growing intervals (1, 3, 7, then 14 days), but it repeats the same scenario rather than a new variant, sends no reminders, and skills do not decay yet.
- **Deployment:** runs locally.
- **Starting scores:** the first check uses self-reported answers. Anyone who skips it starts from a sample profile.
- **Testing:** not yet tested with real older adults, so we make no claim about learning outcomes.

## Credits

- `frontend/public/loading.lottie` comes from our teammate's earlier project and is recoloured to this theme.
- Mascots and logo were supplied by the team.

## Final commit

`e44db17` is the final code commit. The only later commit adds this line.
