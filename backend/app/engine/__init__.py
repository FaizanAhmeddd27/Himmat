"""HIMMAT scenario engine — deterministic, JSON-driven.

Core rule (docs/ARCH.md §2): the engine is the only source of truth for what
happens in a simulation. Same state + same action => same result. AI never
changes state.
"""
