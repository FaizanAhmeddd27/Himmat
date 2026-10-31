"""Consequence builder — the four questions shown after a decision (PRD F2).

Outcome content lives in the scenario data; this layer is the seam where
state-aware wording (e.g. which decisions were made) can be added later
without changing the engine contract.
"""

from app.engine.models import ConsequenceDef, OutcomeDef, Scenario


def build_consequence(
    scenario: Scenario,
    node_id: str,
    action_id: str,
    outcome_def: OutcomeDef,
) -> ConsequenceDef:
    """Return the consequence for an outcome, attributed to the path taken."""
    return outcome_def.consequence
