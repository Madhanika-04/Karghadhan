"""
app/schemas/finance.py
Pydantic v2 schemas for micro-savings, micro-insurance deductions, and transaction payout splits.
"""
from __future__ import annotations

from typing import Optional, List, Union
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class SavingsSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_savings_balance: float = Field(default=0.0, description="Total thrift micro-savings balance in INR")
    monthly_contribution_pct: float = Field(default=5.0, description="Percentage of gross payouts diverted to savings (default 5%)")
    matching_bonus: float = Field(default=0.0, description="Matching bonus contributions received from government/society in INR")


class InsurancePolicy(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    policy_id: str = Field(..., description="Unique code for policy (e.g. PMJJBY, PMSBY, MGBBY)")
    policy_name: str = Field(..., description="Official scheme name")
    sum_assured: float = Field(..., description="Total coverage amount in INR")
    annual_premium: float = Field(..., description="Total annual premium in INR")
    status: str = Field(default="ACTIVE", description="ACTIVE | DUE | LAPSED")
    monthly_deduction_rate: float = Field(..., description="Calculated monthly deduction amount in INR (e.g. ₹36.00 for PMJJBY)")
    last_deducted_at: Optional[str] = Field(default=None, description="ISO timestamp of the last premium slice deduction")


class TransactionPayoutSplit(BaseModel):
    gross_payout: float = Field(..., description="Gross payout amount before splits in INR")
    savings_deducted: float = Field(..., description="Amount diverted to micro-savings in INR")
    insurance_deducted: float = Field(..., description="Amount deducted for micro-insurance premiums in INR")
    net_payout_to_weaver: float = Field(..., description="Final net cash payout sent to the weaver's UPI/account in INR")


class PayoutProcessRequest(BaseModel):
    weaver_id: Union[UUID, str] = Field(..., description="Weaver profile ID")
    gross_saree_payout: float = Field(..., gt=0, description="Gross saree sale amount in INR")


class InsuranceEnrollRequest(BaseModel):
    weaver_id: Union[UUID, str] = Field(..., description="Weaver profile ID")
    policy_name: str = Field(default="PMJJBY - Weaver Cover", description="Target policy to enroll in: PMJJBY | PMSBY | MGBBY")


class FinancialSummaryResponse(BaseModel):
    liquid_balance: float = Field(..., description="Estimated liquid cash balance of the weaver")
    total_thrift_savings_balance: float = Field(..., description="Accumulated thrift savings balance")
    active_insurance_coverage: float = Field(..., description="Aggregate sum assured coverage from active policies")
    savings_summary: SavingsSummary
    insurance_policies: List[InsurancePolicy] = Field(default_factory=list)
