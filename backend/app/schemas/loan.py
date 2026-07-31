"""
app/schemas/loan.py
Pydantic v2 models for loan application submission and retrieval.
"""
from __future__ import annotations

from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class LoanStatus(str, Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    DISBURSED = "DISBURSED"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"


class LoanApplyRequest(BaseModel):
    weaver_id: UUID
    requested_amount: float = Field(
        ..., gt=0, le=500_000,
        description="Requested loan amount in INR (max ₹5,00,000)",
    )
    purpose: str = Field(
        ..., min_length=10, max_length=500,
        description="Purpose of the loan (e.g. yarn purchase, loom repair)",
    )
    tenure_months: int = Field(..., ge=1, le=60)
    assessment_id: Optional[UUID] = Field(
        default=None,
        description="ID of a prior credit assessment to attach",
    )


class LoanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    weaver_id: UUID
    assessment_id: Optional[UUID]
    requested_amount: float
    purpose: str
    tenure_months: int
    status: LoanStatus
    approved_amount: Optional[float]
    interest_rate: Optional[float]
    rejection_reason: Optional[str]
    applied_at: datetime
    updated_at: datetime
