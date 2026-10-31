"""Pydantic models for the scenario graph (docs/SRS §7, docs/ARCH.md §6)."""

from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field

StateValue = Union[bool, int, float, str]

# Language keys stored inline in scenario data (Urdu script ships later).
Languages = Dict[str, str]  # {"en": ..., "ur-Latn": ...}


class Effects(BaseModel):
    """Atomic state operations (docs/ARCH.md §6.1)."""

    set: Dict[str, StateValue] = Field(default_factory=dict)
    inc: Dict[str, float] = Field(default_factory=dict)
    append: Dict[str, List[str]] = Field(default_factory=dict)


class Evidence(BaseModel):
    """Skill evidence emitted by an action (skill ids from taxonomy)."""

    skill: str
    value: float  # 0.0 (bad) .. 1.0 (good)
    weight: float  # 0.0 .. 1.0


class Action(BaseModel):
    id: str
    label: Languages
    # If set (e.g. "otp"), the action requires a text input that is validated.
    needs_input: Optional[str] = None
    # All key/value pairs must equal current state for the action to be offered.
    guard: Dict[str, StateValue] = Field(default_factory=dict)
    effects: Effects = Field(default_factory=Effects)
    evidence: List[Evidence] = Field(default_factory=list)
    next: str  # node id in `nodes` or outcome id in `outcomes`


class NodeUI(BaseModel):
    component: str  # e.g. "ChatLine/ChatThread" mapped in frontend registry
    props: Dict[str, Any] = Field(default_factory=dict)


class NodeHints(BaseModel):
    l1: Languages
    l2: Languages
    l3: Languages


class Node(BaseModel):
    type: Literal["screen", "outcome"] = "screen"
    ui: Optional[NodeUI] = None
    actions: List[Action] = Field(default_factory=list)
    hints: Optional[NodeHints] = None


class ConsequenceDef(BaseModel):
    """The four-part explanation shown after a decision (PRD F2)."""

    what: Languages
    why: Languages
    should_have: Languages
    do_differently: Languages


class OutcomeDef(BaseModel):
    consequence: ConsequenceDef
    tag: Literal["safe", "close_call", "affected", "neutral"]
    # Optional recovery scenario to link into (Recovery Lab, Phase 4).
    recovery: Optional[str] = None


class Scenario(BaseModel):
    id: str
    version: int = 1
    title: Languages
    summary: Languages
    skills: List[str]
    difficulty: int = 1
    is_active: bool = True
    initial_node: str
    initial_state: Dict[str, StateValue] = Field(default_factory=dict)
    nodes: Dict[str, Node]
    outcomes: Dict[str, OutcomeDef]


class NodePayload(BaseModel):
    """What the API returns for the current node (render info for frontend)."""

    id: str
    type: str
    ui: Optional[NodeUI] = None
    actions: List[Action] = Field(default_factory=list)


class SessionEvent(BaseModel):
    """Immutable step record, event-sourced (docs/ARCH.md §7.1)."""

    step_no: int
    node_id: str
    action_id: str
    state_before: Dict[str, StateValue]
    state_after: Dict[str, StateValue]
    consequence_tag: Optional[str] = None
    hints_used: int = 0


class SessionRecord(BaseModel):
    id: str
    scenario_id: str
    mode: Literal["practice", "mastery", "recovery", "assessment"] = "practice"
    current_node: str
    state: Dict[str, StateValue] = Field(default_factory=dict)
    status: Literal["active", "completed"] = "active"
    outcome_id: Optional[str] = None
    events: List[SessionEvent] = Field(default_factory=list)
    hints_used: int = 0
    started_at: float
    updated_at: float


class ActionOutcome(BaseModel):
    """Result of applying one action."""

    session_id: str
    next_node: NodePayload
    state: Dict[str, StateValue]
    consequence: Optional[ConsequenceDef] = None
    outcome_id: Optional[str] = None
    outcome_tag: Optional[str] = None
    recovery: Optional[str] = None
    status: str


class EngineError(Exception):
    """Structured engine errors surfaced by the API layer."""

    def __init__(self, code: str, message: str, status: int = 400) -> None:
        self.code = code
        self.message = message
        self.status = status
        super().__init__(message)
