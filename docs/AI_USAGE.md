# AI Usage Log — HIMMAT

> This file documents **honestly** where and how AI tools were used during the build of HIMMAT, as required by the Build4Better competition rules.

## Policy

- The **scenario engine is deterministic and hand-written**. AI never decides simulation outcomes.
- AI-generated code is reviewed, adapted, and owned by the team.
- No real user data is ever sent to any AI provider.

## Log

| Date | Tool | Where it was used | Notes |
|---|---|---|---|
| 31 Oct 2026 | OpenCode (Claude) | Project scaffolding: FastAPI backend skeleton, Next.js frontend scaffold, config, docs | Phase 1 setup |
| _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## Runtime AI features (in-app)

| Feature | Provider | Fallback | State changes? |
|---|---|---|---|
| Mentor hints (`/mentor/hint`) | Gemini or OpenAI (configurable via `AI_PROVIDER`) | Static pre-authored hints per node (`ai/static_hints.py`) | **Never** — read-only explanation layer |
| Mentor Q&A (`/mentor/ask`) | Gemini or OpenAI | Friendly "try the written hint" message | **Never** |

> _Final section will be completed before submission with the final commit hash._
