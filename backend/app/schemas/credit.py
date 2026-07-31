"""
app/schemas/credit.py
Pydantic v2 models for AI credit evaluation requests and responses.
"""
from __future__ import annotations

from typing import Any, Optional
from uuid import UUID
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class RiskCategory(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TransactionType(str, Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"


# ---------------------------------------------------------------------------
# Input: transaction record for the credit agent
# ---------------------------------------------------------------------------

class TransactionRecord(BaseModel):
    amount: float = Field(..., gt=0)
    transaction_type: TransactionType
    category: str = Field(..., examples=["YARN_PURCHASE", "SAREE_SALE"])
    transacted_at: date
    description: Optional[str] = None


# ---------------------------------------------------------------------------
# Input: full credit evaluation request
# ---------------------------------------------------------------------------

class LoomCapacity(BaseModel):
    loom_type: str
    capacity_metres_per_day: float = Field(..., gt=0)
    active_orders: int = Field(ge=0)


class CreditEvalRequest(BaseModel):
    weaver_id: UUID
    transactions: Optional[list[TransactionRecord]] = Field(
        default=None,
        description="List of recent financial transactions (if omitted, fetched from database)",
    )
    loom_assets: Optional[list[LoomCapacity]] = Field(
        default=None,
        description="List of loom assets (if omitted, fetched from database)"
    )
    additional_context: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Any free-text context the agent should consider",
    )



# ---------------------------------------------------------------------------
# Output: structured credit assessment
# ---------------------------------------------------------------------------

class ScoreBreakdown(BaseModel):
    transaction_consistency: float = Field(..., ge=0, le=100)
    income_to_expense_ratio: float = Field(..., ge=0)
    order_book_strength: float = Field(..., ge=0, le=100)
    experience_bonus: float = Field(..., ge=0, le=100)
    repayment_history: float = Field(..., ge=0, le=100)


class CreditEvalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    weaver_id: UUID
    alternative_credit_score: int = Field(..., ge=300, le=900)
    risk_category: RiskCategory
    max_eligible_loan: float = Field(..., ge=0)
    score_breakdown: ScoreBreakdown
    agent_reasoning: str
    model_version: str
    assessed_at: datetime
