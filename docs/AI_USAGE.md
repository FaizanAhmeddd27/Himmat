# AI usage log

Where and how AI tools were used to build HIMMAT, as the Build4Better rules require.

## Policy

- AI-generated code is reviewed by the team, and the team owns it.
- No real user data is sent to any AI provider.
- In the running app, AI explains. It never decides what happens in a simulation.

## Tools used during the build

| Date | Tool | Used for |
|---|---|---|
| Before the build | ChatGPT | Research and the product concept |
| 31 Oct 2026 | OpenCode (Claude) | Project scaffolding: FastAPI backend skeleton, Next.js frontend scaffold, config and docs |
| 31 Oct 2026 | Claude Code (Claude Opus) | Most of the code from about 12:15 PM: engine fixes, replay and What-if, Recovery Lab, Digital DNA, family dashboard, the Ustad AI layer, the frontend screens, scenario text in both languages, tests, README and these docs |

The Urdu and Roman Urdu translations were also written by Claude Code, and need review by a fluent reader.

The team set the direction, chose the design theme and supplied the mascots, logo and loader. They also made the product decisions and reviewed the results.

The Claude Code session used these community design guides: `frontend-design`, `design-taste-frontend`, `ui-ux-pro-max` and `no-ai-slop`.

## AI inside the app

| Feature | Provider | If it fails | Can it change the simulation? |
|---|---|---|---|
| Ask Ustad (free-text questions) | Groq, `openai/gpt-oss-20b` | A friendly message pointing to the written hints | **No.** It receives only the words on the learner's screen, and returns only text |
| Hints (3 levels) | None: written by hand | Not applicable | No |

Written hints do not use AI. We tried having a model reword them, and in testing its draft drifted from "this message wants you to hurry" towards "please hurry". Safety wording stays exactly as written.

How Ustad is kept in line (`backend/app/ai/`):

- The prompt holds only visible screen text, never what a choice leads to or whether it is risky.
- Safety advice is limited to a short list of approved facts.
- Numbers of 6 or more digits and email addresses are removed from questions before they are sent.
- Replies are blocked if they ask for a code, contain a long number, call the message real or fake, name an on-screen choice, or pick the answer for the learner. Live testing caught a reply in Urdu that gave a verdict and steered the learner away from the safe choice, which is why the last checks exist. A blocked reply becomes a message pointing to the written hints.
- The call times out after 6 seconds, and the mastery test refuses AI help entirely.
