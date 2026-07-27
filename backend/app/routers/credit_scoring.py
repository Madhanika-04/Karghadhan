"""
app/routers/credit_scoring.py
Router endpoints for calculation and storage of Weaver Credit Scores.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.supabase import supabase_admin
from app.schemas.credit_scoring import ScoringProfileCreate, ScoringProfileResponse
from app.services.credit_scoring import calculate_weaver_score

router = APIRouter(prefix="/score", tags=["Fintech Credit Scoring"])


@router.post(
    "/calculate",
    response_model=ScoringProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate alternative fintech credit score for a weaver and upsert data",
)
async def calculate_score(body: ScoringProfileCreate):
    """
    Evaluates alternative fintech credit score using Yarn Passbook quota log
    and CIBIL fallback logic. Upserts the scoring record in Supabase.
    """
    
    # 1. Verify Weaver Profile exists to maintain referential integrity
    try:
        weaver_check = (
            supabase_admin
            .table("weaver_profiles")
            .select("id")
            .eq("id", str(body.weaver_id))
            .maybe_single()
            .execute()
        )
        if not weaver_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Weaver profile {body.weaver_id} not found. Register a weaver profile first."
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database verification check failed: {exc}"
        ) from exc

    # 2. Run the math scoring pipeline
    score, risk_tier = calculate_weaver_score(
        cibil_score=body.cibil_score,
        total_allocated_quota=body.total_allocated_quota,
        total_utilized_quota=body.total_utilized_quota,
        order_frequency_variance=body.order_frequency_variance,
        avg_ticket_size_inr=body.avg_ticket_size_inr,
        past_due_instances=body.past_due_instances
    )

    # 3. Create database payload
    db_record = {
        "weaver_id": str(body.weaver_id),
        "cibil_score": body.cibil_score,
        "total_allocated_quota": body.total_allocated_quota,
        "total_utilized_quota": body.total_utilized_quota,
        "order_frequency_variance": body.order_frequency_variance,
        "avg_ticket_size_inr": body.avg_ticket_size_inr,
        "past_due_instances": body.past_due_instances,
        "score": score,
        "risk_tier": risk_tier
    }

    # 4. Upsert into database
    try:
        db_resp = (
            supabase_admin
            .table("weaver_scoring_profiles")
            .upsert(db_record)
            .execute()
        )
        if not db_resp.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to persist credit scoring metrics."
            )
        return db_resp.data[0]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistence error: {exc}"
        ) from exc


@router.get(
    "/{weaver_id}",
    response_model=ScoringProfileResponse,
    summary="Get fintech scoring profile and score for a weaver",
)
async def get_scoring_profile(weaver_id: UUID):
    """Retrieves the credit scoring profile for the given weaver."""
    try:
        response = (
            supabase_admin
            .table("weaver_scoring_profiles")
            .select("*")
            .eq("weaver_id", str(weaver_id))
            .maybe_single()
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scoring profile for weaver {weaver_id} not found."
            )
        return response.data
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database fetch error: {exc}"
        ) from exc
