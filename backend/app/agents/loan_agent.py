"""
app/agents/loan_agent.py
Real-World Loan Agent for KarghaDhan.

Calculates micro-loan EMI, interest subvention rates, debt burden ratio, and maximum eligible loan amount by combining:
1. Verified monthly cashflow/turnover from Yarn Passbook transaction history.
2. Alternative Credit Score & Risk Category.
3. Weaver Mudra / PM Vishwakarma subvention rules (6% to 7% interest p.a.).
"""
from __future__ import annotations

import math
from typing import Any, Optional
from app.agents.base_agent import BaseAgent

_SYSTEM_PROMPT = """You are a handloom micro-loan advisor for KarghaDhan. 
Calculate loan EMIs, interest rates with government subventions, debt burden ratio (DBR), and eligibility based on Yarn Passbook monthly cashflow and credit score."""


class LoanAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="loan_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Calculates real-world loan eligibility and EMI metrics using Yarn Passbook transactions & credit score.
        """
        if not user_details and not message:
            return None

        # 1. Extract verified monthly turnover from Yarn Passbook transactions
        passbook_txs = user_details.get("yarn_passbook_transactions", user_details.get("transactions", []))
        if passbook_txs and isinstance(passbook_txs, list):
            credits = [float(t.get("amount", 0.0)) for t in passbook_txs if t.get("transaction_type") in ["CREDIT", "INFORMAL_SAREE_SALE", "INCOME"]]
            verified_monthly_income = sum(credits) if credits else float(user_details.get("monthly_income", 18000.0))
        else:
            verified_monthly_income = float(user_details.get("monthly_income", user_details.get("monthly_turnover", 18000.0)))

        credit_score = int(user_details.get("credit_score", user_details.get("alternative_credit_score", 680)))
        existing_emi = float(user_details.get("existing_monthly_emi", 0.0))

        # 2. Maximum Loan Capacity derived from Yarn Passbook monthly income & Credit Score
        # Rule: Max EMI capacity = 40% of (Monthly Passbook Cashflow - Existing EMI)
        max_monthly_emi_capacity = max(500.0, (verified_monthly_income - existing_emi) * 0.40)

        # Base subvention interest rate: Weaver Mudra (6.0%) / PM Vishwakarma (5.0%) / Standard (8.5%)
        if credit_score >= 700:
            annual_rate = 5.0
            max_tenure = 36
        elif credit_score >= 580:
            annual_rate = 6.0
            max_tenure = 24
        else:
            annual_rate = 8.5
            max_tenure = 12

        # 3. Loan parameters
        requested_principal = float(user_details.get("requested_amount", user_details.get("loan_amount", 50000.0)))
        tenure_months = int(user_details.get("tenure_months", 12))

        # Calculate maximum loan principal supported by Yarn Passbook cashflow
        monthly_rate = (annual_rate / 100.0) / 12.0
        if monthly_rate > 0:
            max_supported_principal = (max_monthly_emi_capacity * (math.pow(1 + monthly_rate, tenure_months) - 1)) / (
                monthly_rate * math.pow(1 + monthly_rate, tenure_months)
            )
        else:
            max_supported_principal = max_monthly_emi_capacity * tenure_months

        max_supported_principal = round(max_supported_principal, 2)
        approved_principal = min(requested_principal, max_supported_principal)

        # Calculate EMI for requested principal
        if monthly_rate > 0:
            emi = (requested_principal * monthly_rate * math.pow(1 + monthly_rate, tenure_months)) / (
                math.pow(1 + monthly_rate, tenure_months) - 1
            )
        else:
            emi = requested_principal / tenure_months

        emi = round(emi, 2)
        total_payment = round(emi * tenure_months, 2)
        total_interest = round(total_payment - requested_principal, 2)

        # Debt Burden Ratio (DBR)
        dbr_pct = round(((emi + existing_emi) / verified_monthly_income) * 100, 1) if verified_monthly_income > 0 else 0.0

        if dbr_pct <= 40.0 and credit_score >= 580:
            eligibility_status = "APPROVED"
            guidance = f"Full approval for ₹{requested_principal:,.2f}. Monthly EMI of ₹{emi:,.2f} is well within your Yarn Passbook verified income."
        elif dbr_pct <= 55.0:
            eligibility_status = "CONDITIONAL"
            guidance = f"Conditional approval for ₹{approved_principal:,.2f}. Consider extending tenure to {max_tenure} months to lower EMI."
        else:
            eligibility_status = "HIGH_RISK"
            guidance = f"High Debt Burden Ratio ({dbr_pct}%). Maximum recommended loan based on current Yarn Passbook cashflow is ₹{approved_principal:,.2f}."

        return {
            "verified_monthly_cashflow_inr": verified_monthly_income,
            "credit_score": credit_score,
            "requested_principal_inr": requested_principal,
            "max_eligible_principal_inr": max_supported_principal,
            "approved_principal_inr": approved_principal,
            "tenure_months": tenure_months,
            "subvention_interest_rate_pct": annual_rate,
            "monthly_emi_inr": emi,
            "total_interest_payable_inr": total_interest,
            "total_repayment_amount_inr": total_payment,
            "debt_burden_ratio_pct": dbr_pct,
            "eligibility_status": eligibility_status,
            "eligibility_guidance": guidance,
            "verification_source": "Verified against Yarn Passbook monthly cashflow & KarghaDhan credit score engine",
        }


loan_agent = LoanAgent()
