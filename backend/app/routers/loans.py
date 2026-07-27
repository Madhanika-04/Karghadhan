"""
app/routers/loans.py
Endpoints for loan application submission and retrieval using Firebase Firestore.
Collection: `loan_applications`
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.firebase import db
from app.schemas.loan import LoanApplyRequest, LoanRead

router = APIRouter(prefix="/loans", tags=["Loan Applications"])

LOANS_COLLECTION = "loan_applications"


def _calculate_flexible_emi_schedule(amount: float, tenure_months: int, annual_rate: float = 8.5) -> list[dict]:
    """Generate a flexible EMI repayment schedule for handloom weavers."""
    monthly_rate = annual_rate / 12 / 100
    if monthly_rate > 0:
        emi = (amount * monthly_rate * ((1 + monthly_rate) ** tenure_months)) / (((1 + monthly_rate) ** tenure_months) - 1)
    else:
        emi = amount / tenure_months

    schedule = []
    balance = amount
    for m in range(1, tenure_months + 1):
        interest_charge = balance * monthly_rate
        principal_component = emi - interest_charge
        balance = max(0.0, balance - principal_component)
        schedule.append({
            "installment_no": m,
            "emi_amount": round(emi, 2),
            "principal": round(principal_component, 2),
            "interest": round(interest_charge, 2),
            "remaining_balance": round(balance, 2),
        })
    return schedule


@router.post(
    "/apply",
    response_model=LoanRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new loan application",
)
async def apply_for_loan(body: LoanApplyRequest):
    """
    Create a loan application record in Firestore collection 'loan_applications'.
    Generates flexible EMI repayment schedule metadata.
    """
    loan_id_str = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    record = body.model_dump(mode="json")
    record["id"] = loan_id_str
    record["weaver_id"] = str(body.weaver_id)
    record["assessment_id"] = str(body.assessment_id) if body.assessment_id else None
    record["status"] = "PENDING"
    record["approved_amount"] = None
    record["interest_rate"] = 8.5
    record["rejection_reason"] = None
    record["applied_at"] = now
    record["updated_at"] = now

    # Add flexible EMI schedule to document
    record["repayment_schedule"] = _calculate_flexible_emi_schedule(
        amount=body.requested_amount,
        tenure_months=body.tenure_months,
    )

    try:
        db.collection(LOANS_COLLECTION).document(loan_id_str).set(record)
        return record
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
    """Return all loan applications for the given weaver from Firestore, newest first."""
    try:
        query = db.collection(LOANS_COLLECTION).where("weaver_id", "==", str(weaver_id)).stream()
        loans_list = []
        for doc in query:
            data = doc.to_dict()
            data["id"] = data.get("id", doc.id)
            loans_list.append(data)

        # Sort by applied_at descending
        loans_list.sort(key=lambda x: x.get("applied_at", ""), reverse=True)
        return loans_list
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.get(
    "/application/{loan_id}",
    response_model=LoanRead,
    summary="Get a specific loan application by ID",
)
async def get_loan(loan_id: UUID):
    """Fetch a single loan application by its UUID from Firestore."""
    doc_ref = db.collection(LOANS_COLLECTION).document(str(loan_id))
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application {loan_id} not found.",
        )

    data = doc.to_dict()
    data["id"] = data.get("id", str(loan_id))
    return data
