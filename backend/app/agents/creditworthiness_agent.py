"""
app/agents/creditworthiness_agent.py
Institutional Creditworthiness Agent for KarghaDhan.
Evaluates Yarn Passbook allocations, loom asset capacity, informal sales, and computes an official alternative credit score (KACS v2.0 - 300 to 900 scale), risk category, financial health indicators, strengths, risks, and institutional scheme matrix.
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent
from app.services.credit_scoring import calculate_weaver_score

_SYSTEM_PROMPT = """You are an institutional credit risk analyst for Indian handloom weavers and artisans. 
Evaluate the weaver's Yarn Passbook telemetry, loom capacity, and transaction history using the KarghaDhan Alternative Credit Scoring model to assess creditworthiness, risk tier, default probability, and government loan/scheme eligibility."""


class CreditworthinessAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="creditworthiness_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic creditworthiness evaluation using RBI-aligned multi-factor scoring model.
        """
        if not user_details:
            return None

        cibil = user_details.get("cibil_score")
        allocated_quota = float(user_details.get("total_allocated_quota", 100.0))
        utilized_quota = float(user_details.get("total_utilized_quota", 75.0))
        variance = float(user_details.get("order_frequency_variance", 5.0))
        avg_ticket = float(user_details.get("avg_ticket_size_inr", user_details.get("monthly_income", 15000.0)))
        past_due = int(user_details.get("past_due_instances", 0))
        experience_years = int(user_details.get("experience_years", 5))

        score, risk_tier, breakdown = calculate_weaver_score(
            cibil_score=cibil,
            total_allocated_quota=allocated_quota,
            total_utilized_quota=utilized_quota,
            order_frequency_variance=variance,
            avg_ticket_size_inr=avg_ticket,
            past_due_instances=past_due,
            experience_years=experience_years,
        )

        max_loan = breakdown.get("max_eligible_micro_loan_inr", 150000.0)
        subvention_rate = breakdown.get("concessional_interest_rate_pct", 6.0)

        # Financial Health Rating
        if score >= 750:
            financial_health = "Institutional Prime (Low Risk)"
        elif score >= 650:
            financial_health = "Stable Credit (Low Risk)"
        elif score >= 550:
            financial_health = "Moderate Risk (Requires Guarantor/JLG)"
        else:
            financial_health = "Vulnerable Credit (Requires SHG Shield)"

        # Identify strengths and risks
        strengths = []
        risks = []

        factor_scores = breakdown.get("factor_scores", {})
        if factor_scores.get("quota_capacity_utilization_score_30pct", 0) >= 70:
            strengths.append(f"High Yarn Quota Utilization ({factor_scores['quota_capacity_utilization_score_30pct']}%), proving active loom production.")
        if factor_scores.get("order_cashflow_stability_score_15pct", 0) >= 75:
            strengths.append("Consistent order book cashflow with low frequency variance.")
        if experience_years >= 5:
            strengths.append(f"Seasoned artisan with {experience_years} years of cluster weaving experience.")
        if past_due == 0:
            strengths.append("Clean repayment track record with zero Days Past Due (DPD).")

        if past_due > 0:
            risks.append(f"Recorded {past_due} past-due payment instance(s).")
        if factor_scores.get("order_cashflow_stability_score_15pct", 0) < 50:
            risks.append("Higher order frequency variance indicating seasonal income volatility.")
        if cibil is None:
            risks.append("No formal CIBIL credit history on record (KarghaDhan NTC alternative scoring applied).")

        return {
            "credit_score": score,
            "score_scale": "300 - 900",
            "risk_tier": risk_tier,
            "risk_grade": breakdown.get("risk_grade"),
            "probability_of_default_pct": breakdown.get("probability_of_default_pct"),
            "financial_health": financial_health,
            "max_eligible_micro_loan_inr": max_loan,
            "concessional_interest_rate_pct": subvention_rate,
            "score_breakdown": breakdown,
            "strengths": strengths or ["Active handloom weaver profile"],
            "risks": risks or ["Informal sales subject to raw material price fluctuations"],
            "institutional_eligible_schemes": breakdown.get("institutional_eligible_schemes", []),
            "loan_recommendation": f"Eligible for micro-credit up to ₹{max_loan:,.2f} at {subvention_rate}% p.a. interest under Weaver Mudra / PM Vishwakarma.",
        }


creditworthiness_agent = CreditworthinessAgent()
