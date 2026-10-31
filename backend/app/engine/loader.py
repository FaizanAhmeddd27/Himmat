"""Scenario loading + validation (SRS FR-3.1, FR-12.1).

Scenarios are JSON files in app/scenarios/. The loader validates the graph so
content authors get errors at startup, not at runtime.
"""

import json
from functools import lru_cache
from pathlib import Path
from typing import List

from app.engine.models import EngineError, Scenario

SCENARIOS_DIR = Path(__file__).resolve().parent.parent / "scenarios"


def validate_graph(scenario: Scenario) -> List[str]:
    """Structural checks. Returns a list of problems (empty = valid)."""
    problems: List[str] = []

    if scenario.initial_node not in scenario.nodes:
        problems.append(f"initial_node '{scenario.initial_node}' is not a node")

    known_nodes = set(scenario.nodes)
    known_outcomes = set(scenario.outcomes)

    for node_id, node in scenario.nodes.items():
        if not node.actions and node.type != "outcome":
            problems.append(f"node '{node_id}' has no actions (dead end)")
        for action in node.actions:
            if action.next not in known_nodes and action.next not in known_outcomes:
                problems.append(
                    f"action '{action.id}' on '{node_id}' -> unknown target '{action.next}'"
                )
            if action.guard and not action.guard:
                problems.append(f"action '{action.id}' has an empty guard")

    # Every reachable screen node must lead somewhere meaningful.
    if scenario.initial_node in known_nodes:
        reachable = set()
        stack = [scenario.initial_node]
        while stack:
            nid = stack.pop()
            if nid in reachable or nid not in known_nodes:
                continue
            reachable.add(nid)
            stack.extend(a.next for a in scenario.nodes[nid].actions)
        if scenario.initial_node not in reachable:
            problems.append("initial_node is unreachable (graph bug)")

    return problems


@lru_cache(maxsize=1)
def load_scenarios() -> dict:
    """Load every scenario JSON from disk (cached). Raises EngineError on bad graphs."""
    scenarios: dict = {}
    if not SCENARIOS_DIR.exists():
        return scenarios

    for path in sorted(SCENARIOS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        scenario = Scenario.model_validate(data)
        problems = validate_graph(scenario)
        if problems:
            raise EngineError(
                code="scenario_invalid",
                message=f"Scenario '{scenario.id}' failed validation: {'; '.join(problems)}",
                status=500,
            )
        scenarios[scenario.id] = scenario

    return scenarios


def get_scenario(scenario_id: str) -> Scenario:
    scenarios = load_scenarios()
    if scenario_id not in scenarios:
        raise EngineError(
            code="scenario_not_found",
            message=f"Unknown scenario '{scenario_id}'.",
            status=404,
        )
    return scenarios[scenario_id]


def list_scenarios() -> List[Scenario]:
    return list(load_scenarios().values())
