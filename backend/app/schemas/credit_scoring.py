"""
app/schemas/credit_scoring.py
Pydantic v2 schemas for Weaver credit scoring requests and responses.
"""
from __future__ import annotations

from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class ScoringProfileCreate(BaseModel):
    weaver_id: UUID
    pehchan_id: Optional[str] = Field(None, description="Weaver Pehchan Card ID")
    yarn_passbook_id: Optional[str] = Field(None, description="Yarn Passbook ID")
    cibil_score: Optional[int] = Field(
        default=None,
        ge=300,
        le=900,
        description="Traditional CIBIL credit score (nullable to support thin-file/unbanked profiles)",
    )
    total_allocated_quota: float = Field(
        default=0.0,
        ge=0,
        description="Yarn Passbook quota allocated (in kg)",
    )
    total_utilized_quota: float = Field(
        default=0.0,
        ge=0,
        description="Yarn Passbook quota utilized (in kg)",
    )
    order_frequency_variance: float = Field(
        default=0.0,
        ge=0,
        description="Standard deviation of days between orders (lower means more consistent)",
    )
    avg_ticket_size_inr: float = Field(
        default=0.0,
        ge=0,
        description="Average size of orders/purchases in INR",
    )
    past_due_instances: int = Field(
        default=0,
        ge=0,
        description="Count of past due payments or supply deadlines missed",
    )


class EDhagaFetchRequest(BaseModel):
    weaver_id: UUID
    yarn_passbook_id: Optional[str] = Field(None, description="e-Dhaga Yarn Passbook ID")
    pehchan_id: Optional[str] = Field(None, description="Weaver Pehchan Card ID")
    cibil_score: Optional[int] = Field(None, ge=300, le=900, description="Optional manual CIBIL score")


class ScoringProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    weaver_id: UUID
    pehchan_id: Optional[str] = None
    yarn_passbook_id: Optional[str] = None
    cibil_score: Optional[int] = None
    total_allocated_quota: float
    total_utilized_quota: float
    order_frequency_variance: float
    avg_ticket_size_inr: float
    past_due_instances: int
    score: int = Field(..., ge=300, le=900, description="Calculated Weaver Credit Score")
    risk_tier: str = Field(..., description="Excellent, Good, Average, Risky")
    score_breakdown: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
