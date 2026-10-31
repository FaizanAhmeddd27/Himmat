# How to run HIMMAT

For anyone running HIMMAT on their own laptop. Takes about 5 minutes the first time, and about 30 seconds after that.

You need **Node.js 20 or newer** and **Python 3.11 or newer**. Check with `node --version` and `python --version`.

The commands below are for Windows PowerShell. Run them from the repo folder. HIMMAT needs two terminals open at the same time, one for the backend and one for the frontend.

---

## First time only

### 1. Set up the backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

### 2. Add the secret settings

Create a file at `backend\.env`. Copy `backend\.env.example` and fill it in. These lines matter:

```
DATABASE_URL=your-supabase-connection-string
AI_PROVIDER=groq
GROQ_API_KEY=your-key-here
```

- Get the values from a teammate. **Never commit it**: the repo is public, and `.env` is already ignored by git.
- No database? Leave `DATABASE_URL` empty and progress goes to local files.
- No Groq key? Set `AI_PROVIDER=none`. Everything still works. "Ask Ustad" shows a friendly message, and the written hints are unaffected.

### 3. Set up the frontend

In a second terminal:

```powershell
cd frontend
npm ci
```

---

## Every time

**Terminal 1, backend:**

```powershell
cd backend
.venv\Scripts\python -m uvicorn app.main:app --port 8000
```

Ready when you see `Uvicorn running on http://127.0.0.1:8000`.

**Terminal 2, frontend:**

```powershell
cd frontend
npm run dev
```

Then open **http://localhost:3000**.

To stop either one, press `Ctrl+C` in its terminal.

**For recording or showing judges**, use the production build. It is faster and has no developer badge in the corner:

```powershell
cd frontend
npm run build
npm run start
```

---

## Walk through it

Follow this path to see every feature. It is also the order of the demo video.

| # | Where | What to do | What you should see |
|---|---|---|---|
| 1 | Home page | Tap the blue link inside the message on the phone (or press **Start practising** for the first-time setup and quick check) | The phone opens a fake verify page |
| 2 | Fake page | Type a card-like number, `4111 1111 1111 1111`, and press **Confirm code** | A calm message refusing it: real-looking numbers are never accepted |
| 3 | Fake page | Type `246810` (it appears in the message at the top of the phone) and press **Confirm code** | A bank alert: PKR 48,500 of practice money is gone |
| 4 | Phone | Press **See what happened** | The result screen with the four questions |
| 5 | Result | Press **Replay my choices** | Your path, step by step, each step tagged Safe, Risky or Neutral |
| 6 | Replay | Under step 1, press **What if I chose differently?**, then **What if I checked the sender first?** | Later steps fold away and the phone reopens on the sender's details |
| 7 | Phone | Read the rows, then press **Report and block**, then **Compare both tries** | The path forks: PKR 1,500 on one side, PKR 50,000 on the other |
| 8 | Compare | Press **Practise what to do next** | The Recovery Lab |
| 9 | Recovery Lab | Tap steps in a wrong order, or include "Pay a recovery agent", then **Check my steps** | Calm feedback on each step, never red |
| 10 | Recovery Lab | Press **Try the steps again** and tap: Stop, Call the helpline, Block your card, Change your password, Report it. Then **Check my steps**, then **Try a new one on your own** | A new situation opens |
| 11 | Lucky draw | Pick how sure you feel, open the phone, tap the sender's name, then **Report and block** | No hint button anywhere. "You spotted it with no hints", with your skills going up |
| 12 | My skills | Press **See my skills** | Radar, bars, how sure you feel before and after, and what to do next |
| 13 | Family | Open **Family** in the top menu and switch categories between Shared and Private | Bilal's view changes straight away |

### Also worth trying

- **Hints:** in a practice scenario, open **Need a hint?** and reveal the three levels.
- **Ask Ustad:** under the hints, type "What is an OTP?" Answers take about 4 seconds, and Ustad won't choose for you even if you ask.
- **Show me what I can tap:** outlines every tappable spot on the phone.
- **English, Roman Urdu, اردو, A / A+ / A++, High contrast:** all in the top bar, and they apply everywhere. Urdu mirrors the whole layout. **Listen** appears in Urdu only if the device has an Urdu voice, and never in Roman Urdu.
- **Other endings in the bank scenario:** call Bilal, call the helpline from the sender's details, or open the link and close the page.
- **Refresh mid-game:** you come back to the same screen.

### Other pages

| Page | What it is |
|---|---|
| `/onboarding` | First-time setup and a 6-question check that sets real starting scores |
| `/dashboard` | Home: next step, skills snapshot and when to practise again |
| `/settings` | Language, text size, contrast, account, and deleting your data |
| `/family/dashboard/<id>` | Bilal's read-only view. Get the link from **Copy a link for Bilal** on the Family page |
| `/demo` | For judges: start fresh, or open a learner who has already practised |
| `/login`, `/signup` | Accounts, once Supabase keys are set (see below) |

### Turning accounts on

Accounts are off until you create `frontend\.env.local` with these two lines from your Supabase project, then restart the frontend:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Without them, the sign-in pages say so and guest mode carries on working.

### Starting fresh

Open **/demo** and press **Try it yourself** for a brand-new profile. Do this before recording, so the numbers start low.

---

## If something goes wrong

| What you see | What to do |
|---|---|
| "The practice phone could not connect" | The backend isn't running, so start Terminal 1 |
| `address already in use` or `10048` | That port is taken by an old copy. Find it with `netstat -ano \| findstr :8000` and stop it with `taskkill /PID <number> /F` (use `:3000` for the frontend) |
| "Ask Ustad" says it can't answer | Check `GROQ_API_KEY` in `backend\.env`, then restart Terminal 1. Everything else keeps working |
| Page looks stuck on an old session | Use **Start over** on the phone screen, or open a private window |
| Backend changes don't show | Restart Terminal 1: it doesn't reload by itself with the command above |

**Where progress is saved:** in Supabase when `DATABASE_URL` is set in `backend\.env`. The tables are created automatically the first time. If the database can't be reached when the backend starts, it saves to `backend\data\` for that run and the terminal shows a warning. If the connection drops while running, practice carries on, but changes made during the drop are not saved to Supabase.

---

## Run the tests

```powershell
cd backend
.venv\Scripts\python -m pytest
```

```powershell
cd frontend
npm run lint
```
