"""AI explanation layer (docs/ARCH.md §10).

Read-only by design: nothing in this package can reach session state or the
engine. It receives text the learner can already see and returns text. Every
call has a written fallback, so the simulator works with AI switched off.
"""
