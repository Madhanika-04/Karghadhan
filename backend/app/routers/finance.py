"""
app/routers/finance.py
API Endpoints for Weaver Financial Protection, Micro-Savings, Micro-Insurance, and Payout Splits.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from app.db.firebase import get_db, db as firebase_db
from app.schemas.finance import (
    PayoutProcessRequest,
    InsuranceEnrollRequest,
    TransactionPayoutSplit,
    InsurancePolicy,
    FinancialSummaryResponse,
)
from app.services.finance_service import (
    process_informal_payout,
    enroll_weaver_insurance,
    get_financial_summary,
)

router = APIRouter(prefix="/finance", tags=["Financial Protection Engine"])


@router.post(
    "/payout/process",
    response_model=TransactionPayoutSplit,
    status_code=status.HTTP_200_OK,
    summary="Process informal saree sale payout split",
)
async def process_payout(
    body: PayoutProcessRequest,
    db=Depends(get_db),
):
    """
    Process informal saree sale payout:
    - Calculates 5% micro-savings deduction.
    - Checks if monthly insurance premium slice (e.g. ₹36.00 for PMJJBY) is due and deducts it.
    - Updates weaver's savingsSummary and insurancePolicies in Firestore.
    - Appends detailed ledger entry to weavers/{weaver_id}/transactions.
    - Returns TransactionPayoutSplit.
    """
    try:
        split = process_informal_payout(
            weaver_id=body.weaver_id,
            gross_amount=body.gross_saree_payout,
            db_client=db or firebase_db,
        )
        return split
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing payout split: {str(exc)}",
        ) from exc


@router.get(
    "/summary/{weaver_id}",
    response_model=FinancialSummaryResponse,
    summary="Get weaver financial wellness summary",
)
async def get_summary(
    weaver_id: str,
    db=Depends(get_db),
):
    """
    Retrieve liquid balance, total thrift savings balance, active insurance coverage,
    and policy details for the given weaver.
    """
    try:
        summary = get_financial_summary(
            weaver_id=weaver_id,
            db_client=db or firebase_db,
        )
        return summary
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching financial summary: {str(exc)}",
        ) from exc


@router.post(
    "/insurance/enroll",
    response_model=InsurancePolicy,
    status_code=status.HTTP_200_OK,
    summary="Enroll weaver in micro-insurance policy",
)
async def enroll_insurance(
    body: InsuranceEnrollRequest,
    db=Depends(get_db),
):
    """
    Enrolls weaver in PMJJBY / PMSBY / MGBBY insurance, pre-filling profile details
    and setting policy status to 'ACTIVE'.
    """
    try:
        policy = enroll_weaver_insurance(
            weaver_id=body.weaver_id,
            policy_name=body.policy_name,
            db_client=db or firebase_db,
        )
        return policy
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error enrolling in insurance: {str(exc)}",
        ) from exc
