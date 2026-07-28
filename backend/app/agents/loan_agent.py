"""
app/agents/loan_agent.py
Loan Agent for KarghaDhan.
Calculates EMI, total interest, total repayment amounts, assesses loan eligibility, and provides loan recommendations.
"""
from __future__ import annotations

import math
from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are a handloom micro-loan advisor for KarghaDhan. 
Help weavers calculate loan EMIs, interest rates, eligibility, and recommend micro-credit products suited for yarn purchase or loom upgrades."""


class LoanAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="loan_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic loan calculation and eligibility assessment.
        """
        if not user_details and not message:
            return None

        # Extract loan parameters (defaults: ₹50,000, 12 months, 7.0% annual interest subvention rate)
        principal = float(user_details.get("requested_amount", user_details.get("loan_amount", 50000.0)))
        tenure_months = int(user_details.get("tenure_months", 12))
        annual_rate = float(user_details.get("annual_interest_rate", 7.0))  # 7% concessional rate
        monthly_income = float(user_details.get("monthly_income", 18000.0))
        existing_emi = float(user_details.get("existing_monthly_emi", 0.0))

        if principal <= 0 or tenure_months <= 0:
            return None

        # Calculate EMI
        monthly_rate = (annual_rate / 100.0) / 12.0
        if monthly_rate > 0:
            emi = (principal * monthly_rate * math.pow(1 + monthly_rate, tenure_months)) / (
                math.pow(1 + monthly_rate, tenure_months) - 1
            )
        else:
            emi = principal / tenure_months

        emi = round(emi, 2)
        total_payment = round(emi * tenure_months, 2)
        total_interest = round(total_payment - principal, 2)

        # Debt Burden Ratio (DBR) / Debt Service Capacity
        available_income = max(0.0, monthly_income - existing_emi)
        dbr_pct = round(((emi + existing_emi) / monthly_income) * 100, 1) if monthly_income > 0 else 0.0

        if dbr_pct <= 40.0:
            eligibility_status = "APPROVED"
            guidance = "Your repayment capacity is healthy (EMI is under 40% of net monthly income)."
        elif dbr_pct <= 55.0:
            eligibility_status = "CONDITIONAL"
            guidance = "Loan eligible with a joint guarantor or slightly longer tenure to reduce monthly EMI."
        else:
            eligibility_status = "HIGH_RISK"
            guidance = "High debt-to-income ratio. Consider requesting a lower loan amount or extending tenure."

        return {
            "requested_principal_inr": principal,
            "tenure_months": tenure_months,
            "annual_interest_rate_pct": annual_rate,
            "monthly_emi_inr": emi,
            "total_interest_payable_inr": total_interest,
            "total_repayment_amount_inr": total_payment,
            "debt_burden_ratio_pct": dbr_pct,
            "eligibility_status": eligibility_status,
            "eligibility_guidance": guidance,
            "recommendation_summary": (
                f"For a loan of ₹{principal:,.2f} over {tenure_months} months at {annual_rate}% p.a., "
                f"your monthly EMI will be ₹{emi:,.2f} with total interest of ₹{total_interest:,.2f}."
            ),
        }


loan_agent = LoanAgent()
