"""
app/routers/credit.py
Endpoints for triggering and retrieving AI credit evaluations.
"""
from __future__ import annotations

from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, status

from app.agents.credit_evaluator import run_credit_evaluation
from app.db.supabase import supabase_admin
from app.schemas.credit import CreditEvalRequest, CreditEvalResponse

router = APIRouter(prefix="/credit", tags=["Credit Evaluation"])


@router.post(
    "/evaluate",
    response_model=CreditEvalResponse,
    status_code=status.HTTP_200_OK,
    summary="Run AI-powered alternative credit evaluation for a weaver",
)
async def evaluate_credit(body: CreditEvalRequest):
    """
    Accepts weaver transaction history and loom metrics, runs the
    LangGraph credit-evaluation agent, persists the result in Supabase,
    and returns the structured credit assessment.
    
    If transaction history or loom assets are not provided, they will be
    queried from the database for the given weaver_id.
    """
    payload = body.model_dump(mode="json")

    # If transactions not provided in request, fetch from database
    if not payload.get("transactions"):
        try:
            tx_resp = (
                supabase_admin
                .table("transaction_ledger")
                .select("*")
                .eq("weaver_id", str(body.weaver_id))
                .execute()
            )
            if not tx_resp.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No transaction history found in database or request body. Evaluation requires at least one transaction."
                )
            payload["transactions"] = tx_resp.data
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching transaction ledger: {exc}"
            ) from exc

    # Convert date objects to strings for JSON serialisation
    for txn in payload.get("transactions", []):
        if hasattr(txn.get("transacted_at"), "isoformat"):
            txn["transacted_at"] = txn["transacted_at"].isoformat()

    # If loom_assets not provided in request, fetch from database
    if not payload.get("loom_assets"):
        try:
            loom_resp = (
                supabase_admin
                .table("loom_assets")
                .select("*")
                .eq("weaver_id", str(body.weaver_id))
                .execute()
            )
            payload["loom_assets"] = [
                {
                    "loom_type": row["loom_type"],
                    "capacity_metres_per_day": float(row["capacity"]),
                    "active_orders": int(row["active_orders"]),
                }
                for row in loom_resp.data
            ] if loom_resp.data else []
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching loom assets: {exc}"
            ) from exc

    try:
        result = await run_credit_evaluation(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {exc}",
        ) from exc

    # Persist to Supabase
    db_record = {
        "weaver_id": str(body.weaver_id),
        "alternative_credit_score": result["alternative_credit_score"],
        "risk_category": result["risk_category"],
        "max_eligible_loan": result["max_eligible_loan"],
        "score_breakdown": result["score_breakdown"],
        "agent_reasoning": result.get("agent_reasoning", ""),
        "model_version": result.get("model_version", "gemini-1.5-flash"),
    }

    try:
        db_resp = supabase_admin.table("credit_assessments").insert(db_record).execute()
        saved = db_resp.data[0]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DB persist error: {exc}",
        ) from exc

    return CreditEvalResponse(
        weaver_id=body.weaver_id,
        alternative_credit_score=saved["alternative_credit_score"],
        risk_category=saved["risk_category"],
        max_eligible_loan=saved["max_eligible_loan"],
        score_breakdown=saved["score_breakdown"],
        agent_reasoning=saved["agent_reasoning"],
        model_version=saved["model_version"],
        assessed_at=datetime.fromisoformat(saved["assessed_at"]),
    )


@router.get(
    "/{weaver_id}",
    response_model=CreditEvalResponse,
    summary="Get latest credit assessment for a weaver",
)
async def get_latest_credit(weaver_id: UUID):
    """Return the most recent credit assessment for the given weaver."""
    response = (
        supabase_admin
        .table("credit_assessments")
        .select("*")
        .eq("weaver_id", str(weaver_id))
        .order("assessed_at", desc=True)
        .limit(1)
        .maybe_single()
        .execute()
    )
    if response.data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No credit assessment found for weaver {weaver_id}.",
        )
    data = response.data
    return CreditEvalResponse(
        weaver_id=weaver_id,
        alternative_credit_score=data["alternative_credit_score"],
        risk_category=data["risk_category"],
        max_eligible_loan=data["max_eligible_loan"],
        score_breakdown=data["score_breakdown"],
        agent_reasoning=data["agent_reasoning"],
        model_version=data["model_version"],
        assessed_at=datetime.fromisoformat(data["assessed_at"]),
    )
