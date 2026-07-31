"""
app/agents/credit_evaluator.py
Autonomous LangGraph agent that computes an alternative credit score
for handloom weavers based on transaction history and loom capacity.

Integrates directly with Firebase Firestore (`weavers` and `credit_assessments` collections).

Graph flow:
  [START]
    → analyse_transactions   (pure Python, computes financial metrics)
    → llm_reasoning          (Gemini LLM interprets metrics, produces reasoning)
    → compute_final_score    (deterministic scoring formula + risk bucketing)
  [END]
"""
from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph
from app.agents.state import AgentState
from app.db.firebase import db
from app.services.llm import get_default_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Node 1: Analyse Transactions (deterministic)
# ---------------------------------------------------------------------------

def analyse_transactions(state: AgentState) -> AgentState:
    """
    Compute raw financial metrics from the transaction list.
    Metrics written to state:
      income_total, expense_total, net_cashflow,
      transaction_consistency, income_expense_ratio, order_book_strength
    """
    transactions: list[dict] = state.get("transactions", []) or []
    loom_assets: list[dict] = state.get("loom_assets", []) or []

    # Safe float conversion to prevent decimal.Decimal or string type-mixing errors
    for t in transactions:
        t["amount"] = float(t["amount"]) if t.get("amount") is not None else 0.0

    for a in loom_assets:
        if "capacity" in a and a["capacity"] is not None:
            a["capacity"] = float(a["capacity"])
        if "capacity_metres_per_day" in a and a["capacity_metres_per_day"] is not None:
            a["capacity_metres_per_day"] = float(a["capacity_metres_per_day"])

    income = sum(t["amount"] for t in transactions if t.get("transaction_type") == "CREDIT")
    expense = sum(t["amount"] for t in transactions if t.get("transaction_type") == "DEBIT")

    # Consistency: % of months in the last 6 that have at least one credit transaction
    from collections import defaultdict
    monthly: dict[str, float] = defaultdict(float)
    for t in transactions:
        if t.get("transaction_type") == "CREDIT":
            tx_date = t.get("transacted_at", "")
            if not isinstance(tx_date, str):
                tx_date = tx_date.isoformat()
            key = tx_date[:7]  # YYYY-MM
            monthly[key] += t["amount"]

    consistency = min(len(monthly) / 6 * 100, 100) if monthly else 50.0

    # Income/expense ratio (capped for scoring)
    ie_ratio = income / expense if expense > 0 else (income / 10000.0 if income > 0 else 1.0)

    # Order book strength: total capacity × active orders (normalised to 100)
    total_capacity = sum(a.get("capacity_metres_per_day", a.get("capacity", 0)) for a in loom_assets)
    total_active = sum(a.get("active_orders", 0) for a in loom_assets)
    order_strength = min((total_capacity * max(total_active, 1)) / 500 * 100, 100) if loom_assets else 40.0

    return {
        **state,
        "income_total": income,
        "expense_total": expense,
        "net_cashflow": income - expense,
        "transaction_consistency": round(consistency, 2),
        "income_expense_ratio": round(ie_ratio, 4),
        "order_book_strength": round(order_strength, 2),
        "repayment_history": state.get("repayment_history", 50.0),  # default neutral
    }


# ---------------------------------------------------------------------------
# Node 2: LLM Reasoning (Gemini)
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are an expert alternative credit analyst specialising in 
the Indian handloom sector. You evaluate weavers' financial health from informal 
transaction data and loom capacity metrics.

Given the metrics JSON, you must:
1. Provide a nuanced 3–5 sentence reasoning about the weaver's creditworthiness.
2. Suggest an experience_bonus score between 0 and 100 based on the context.
3. Highlight any red flags or strengths.

Respond ONLY in the following JSON format:
{
  "reasoning": "<3-5 sentences>",
  "experience_bonus": <0-100 float>,
  "flags": ["<flag1>", "<flag2>"]
}"""


def llm_reasoning(state: AgentState) -> AgentState:
    """Call Gemini to produce qualitative reasoning and experience_bonus."""
    metrics = {
        "weaver_id": state.get("weaver_id"),
        "income_total_inr": state.get("income_total"),
        "expense_total_inr": state.get("expense_total"),
        "net_cashflow_inr": state.get("net_cashflow"),
        "transaction_consistency_pct": state.get("transaction_consistency"),
        "income_to_expense_ratio": state.get("income_expense_ratio"),
        "order_book_strength_pct": state.get("order_book_strength"),
        "loom_count": len(state.get("loom_assets", [])),
        "additional_context": state.get("additional_context", "None"),
    }

    try:
        llm = get_default_llm()
        messages = [
            SystemMessage(content=_SYSTEM_PROMPT),
            HumanMessage(content=f"Metrics:\n{json.dumps(metrics, indent=2)}"),
        ]
        response = llm.invoke(messages)
        raw_text = str(response.content)

        # Parse JSON response
        parsed = json.loads(raw_text.strip().strip("```json").strip("```").strip())
        reasoning = parsed.get("reasoning", "Evaluation complete.")
        exp_val = parsed.get("experience_bonus")
        experience_bonus = float(exp_val) if exp_val is not None else 50.0

    except Exception as exc:
        logger.warning("LLM call failed, using defaults: %s", exc)
        reasoning = "Automated credit assessment based on loom capacity and transaction ledger metrics."
        experience_bonus = 50.0
        raw_text = ""

    return {
        **state,
        "experience_bonus": min(max(experience_bonus, 0), 100),
        "agent_reasoning": reasoning,
        "raw_llm_response": raw_text,
        "model_version": "gemini-1.5-flash",
    }


# ---------------------------------------------------------------------------
# Node 3: Compute Final Score (deterministic)
# ---------------------------------------------------------------------------

def compute_final_score(state: AgentState) -> AgentState:
    """
    Weighted scoring formula → 300–900 scale.
    """
    consistency   = state.get("transaction_consistency", 0.0)
    ie_raw        = state.get("income_expense_ratio", 1.0)
    order_str     = state.get("order_book_strength", 0.0)
    exp_bonus     = state.get("experience_bonus", 50.0)
    repayment     = state.get("repayment_history", 50.0)

    # Normalise ie_ratio to 0–100 (cap at ratio=3 → 100)
    ie_score = min(ie_raw / 3 * 100, 100)

    raw_score = (
        consistency * 0.30
        + ie_score   * 0.25
        + order_str  * 0.20
        + exp_bonus  * 0.15
        + repayment  * 0.10
    )

    # Map 0–100 → 300–900
    credit_score = int(300 + raw_score * 6)
    credit_score = max(300, min(900, credit_score))

    # Risk bucketing
    if credit_score >= 700:
        risk = "LOW"
        max_loan = 200_000.0
    elif credit_score >= 550:
        risk = "MEDIUM"
        max_loan = 100_000.0
    else:
        risk = "HIGH"
        max_loan = 25_000.0

    score_breakdown = {
        "transaction_consistency": round(consistency, 2),
        "income_to_expense_ratio": round(ie_score, 2),
        "order_book_strength": round(order_str, 2),
        "experience_bonus": round(exp_bonus, 2),
        "repayment_history": round(repayment, 2),
    }

    return {
        **state,
        "alternative_credit_score": credit_score,
        "risk_category": risk,
        "max_eligible_loan": max_loan,
        "score_breakdown": score_breakdown,
    }


# ---------------------------------------------------------------------------
# Build the LangGraph
# ---------------------------------------------------------------------------

def _build_graph() -> Any:
    builder: StateGraph = StateGraph(AgentState)
    builder.add_node("analyse_transactions", analyse_transactions)
    builder.add_node("llm_reasoning", llm_reasoning)
    builder.add_node("compute_final_score", compute_final_score)

    builder.add_edge(START, "analyse_transactions")
    builder.add_edge("analyse_transactions", "llm_reasoning")
    builder.add_edge("llm_reasoning", "compute_final_score")
    builder.add_edge("compute_final_score", END)

    return builder.compile()


# Module-level compiled graph (singleton)
credit_graph = _build_graph()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run_credit_evaluation(payload: dict) -> dict:
    """
    Run the credit evaluation agent. Reads/writes from/to Firestore if needed.

    Args:
        payload: dict with keys matching AgentState input fields.

    Returns:
        Final AgentState dict after all nodes have run.
    """
    weaver_id = str(payload.get("weaver_id", ""))
    transactions = payload.get("transactions", [])
    loom_assets = payload.get("loom_assets", [])

    # If transactions/loom_assets missing, fetch from Firestore `weavers` collection
    if weaver_id and (not transactions or not loom_assets):
        try:
            weaver_doc = db.collection("weavers").document(weaver_id).get()
            if weaver_doc.exists:
                data = weaver_doc.to_dict()
                if not loom_assets:
                    loom_assets = data.get("loom_assets", [])
        except Exception as exc:
            logger.warning("Could not fetch weaver from Firestore: %s", exc)

    initial_state: AgentState = {
        "weaver_id": weaver_id,
        "transactions": transactions,
        "loom_assets": loom_assets,
        "additional_context": payload.get("additional_context", ""),
    }

    result = await credit_graph.ainvoke(initial_state)
    assessed_at = datetime.now(timezone.utc).isoformat()
    result["assessed_at"] = assessed_at

    # Persist credit assessment directly to Firestore collection `credit_assessments`
    if weaver_id:
        try:
            assessment_id = str(uuid.uuid4())
            record = {
                "id": assessment_id,
                "weaver_id": weaver_id,
                "alternative_credit_score": result["alternative_credit_score"],
                "risk_category": result["risk_category"],
                "max_eligible_loan": result["max_eligible_loan"],
                "score_breakdown": result["score_breakdown"],
                "agent_reasoning": result.get("agent_reasoning", ""),
                "model_version": result.get("model_version", "gemini-1.5-flash"),
                "assessed_at": assessed_at,
            }
            db.collection("credit_assessments").document(assessment_id).set(record)
            logger.info("Persisted AI credit assessment to Firestore collection 'credit_assessments': %s", assessment_id)
        except Exception as exc:
            logger.warning("Could not write credit assessment to Firestore: %s", exc)

    return result
