"""
app/routers/loans.py
Endpoints for loan application submission and retrieval.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.supabase import supabase_admin
from app.schemas.loan import LoanApplyRequest, LoanRead

router = APIRouter(prefix="/loans", tags=["Loan Applications"])


@router.post(
    "/apply",
    response_model=LoanRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new loan application",
)
async def apply_for_loan(body: LoanApplyRequest):
    """
    Create a loan application record. If an assessment_id is provided,
    the application is linked to that credit assessment for underwriting.
    """
    record = body.model_dump(mode="json")
    record["weaver_id"] = str(body.weaver_id)
    record["assessment_id"] = str(body.assessment_id) if body.assessment_id else None

    try:
        response = supabase_admin.table("loan_applications").insert(record).execute()
        return response.data[0]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get(
    "/{weaver_id}",
    response_model=list[LoanRead],
    summary="List all loan applications for a weaver",
)
async def list_loans(weaver_id: UUID):
    """Return all loan applications for the given weaver, newest first."""
    response = (
        supabase_admin
        .table("loan_applications")
        .select("*")
        .eq("weaver_id", str(weaver_id))
        .order("applied_at", desc=True)
        .execute()
    )
    return response.data or []


@router.get(
    "/application/{loan_id}",
    response_model=LoanRead,
    summary="Get a specific loan application by ID",
)
async def get_loan(loan_id: UUID):
    """Fetch a single loan application by its UUID."""
    response = (
        supabase_admin
        .table("loan_applications")
        .select("*")
        .eq("id", str(loan_id))
        .maybe_single()
        .execute()
    )
    if response.data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application {loan_id} not found.",
        )
    return response.data
