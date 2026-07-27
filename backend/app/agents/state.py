"""
app/agents/state.py
TypedDict definitions that form the LangGraph state schema.
Each agent node reads from and writes to an instance of AgentState.
"""
from __future__ import annotations

from typing import Any
from typing_extensions import TypedDict


class AgentState(TypedDict, total=False):
    """Shared mutable state passed between LangGraph nodes."""

    # --- Input ---
    weaver_id: str
    transactions: list[dict]          # raw transaction dicts
    loom_assets: list[dict]           # raw loom-asset dicts
    additional_context: str

    # --- Computed mid-pipeline ---
    income_total: float
    expense_total: float
    net_cashflow: float
    transaction_consistency: float    # 0–100 score
    income_expense_ratio: float
    order_book_strength: float        # 0–100 score
    experience_bonus: float           # 0–100 score
    repayment_history: float          # 0–100 (default 50 when no history)

    # --- LLM output ---
    raw_llm_response: str
    agent_reasoning: str

    # --- Final output ---
    alternative_credit_score: int     # 300–900
    risk_category: str                # LOW / MEDIUM / HIGH
    max_eligible_loan: float
    score_breakdown: dict[str, Any]
    model_version: str

    # --- Control flow ---
    error: str | None


class AssistantState(TypedDict, total=False):
    """State for the vernacular assistant agent."""
    user_id: str
    language: str
    message_history: list[dict]       # [{role, content}]
    user_message: str
    assistant_response: str
    error: str | None
