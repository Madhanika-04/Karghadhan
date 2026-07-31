"""
app/schemas/financial_product.py
Pydantic v2 schemas for real-world micro-credit loans, savings, and insurance suggestions and application forms.
"""
from __future__ import annotations

from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class FinancialProductBase(BaseModel):
    id: str = Field(..., description="Unique scheme identifier (e.g. MUDRA_SHISHU, MGBBY)")
    name: str = Field(..., description="Official government or bank scheme name")
    description: str = Field(..., description="Brief details about benefits and interest/coverage")
    provider: str = Field(..., description="Issuing agency or bank (e.g. NABARD, LIC, SBI)")
    portal_name: str = Field(..., description="Official portal where this form is submitted")
    portal_url: str = Field(..., description="Official URL of the portal")


class LoanProduct(FinancialProductBase):
    max_amount: float = Field(..., description="Maximum eligible loan amount in INR")
    interest_rate: float = Field(..., description="Estimated annual interest rate percentage")
    subsidy_rate: Optional[float] = Field(None, description="Government interest subsidy percentage if any")
    tenure_months_range: str = Field(..., description="Typical repayment tenure range (e.g. 12-60 months)")
    requirements: List[str] = Field(default_factory=list, description="Eligibility requirements list")


class SavingsProduct(FinancialProductBase):
    minimum_balance: float = Field(..., description="Minimum monthly balance requirement in INR")
    interest_rate: float = Field(..., description="Annual interest rate percentage")
    benefits: List[str] = Field(default_factory=list, description="Product key benefits")


class InsuranceProduct(FinancialProductBase):
    coverage_amount: float = Field(..., description="Sum assured / death or disability cover in INR")
    annual_premium: float = Field(..., description="Annual premium cost in INR")
    subsidized_premium: Optional[float] = Field(None, description="Subsidized premium paid by weaver/gov")
    benefits: List[str] = Field(default_factory=list, description="Key coverage details")


class ProductRecommendationsResponse(BaseModel):
    weaver_id: UUID
    credit_score: int
    risk_tier: str
    recommended_loans: List[LoanProduct] = Field(default_factory=list)
    recommended_savings: List[SavingsProduct] = Field(default_factory=list)
    recommended_insurance: List[InsuranceProduct] = Field(default_factory=list)


class PortalApplicationRequest(BaseModel):
    weaver_id: UUID
    product_id: str = Field(..., description="Scheme ID to apply for (e.g. WEAVER_MUDRA, MGBBY)")
    form_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="User-submitted form fields required by the portal (nominee, spouse name, etc.)",
    )


class PortalApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    application_id: UUID
    weaver_id: UUID
    product_id: str
    product_name: str
    portal_name: str
    portal_url: str
    filled_form_json: Dict[str, Any] = Field(..., description="The complete structured JSON representing the filled portal form")
    applied_at: datetime
