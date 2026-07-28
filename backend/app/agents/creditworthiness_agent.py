"""
app/agents/creditworthiness_agent.py
Creditworthiness Agent for KarghaDhan.
Evaluates Yarn Passbook allocations, loom asset capacity, informal sales, and computes an alternative credit score, risk category, financial health indicators, strengths, and risks.
"""
from __future__ import annotations

from typing import Any, Optional
from app.agents.base_agent import BaseAgent
from app.services.credit_scoring import calculate_weaver_score

_SYSTEM_PROMPT = """You are an expert credit analyst for Indian handloom weavers. 
Evaluate the weaver's yarn passbook records, loom capacity, and transaction history to assess creditworthiness, financial health, risk level, and loan eligibility."""


class CreditworthinessAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="creditworthiness_agent", system_prompt=_SYSTEM_PROMPT)

    def _build_response(self, user_details: dict[str, Any], message: str = "") -> Optional[dict[str, Any]]:
        """
        Deterministic creditworthiness evaluation using yarn passbook metrics and loom assets.
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
        )

        # Financial Health Rating
        if score >= 750:
            financial_health = "Robust"
            max_loan = 200000.0
        elif score >= 650:
            financial_health = "Stable"
            max_loan = 120000.0
        elif score >= 550:
            financial_health = "Moderate"
            max_loan = 50000.0
        else:
            financial_health = "Vulnerable"
            max_loan = 20000.0

        # Identify strengths and risks
        strengths = []
        risks = []

        if breakdown.get("quota_utilization_pct", 0) >= 70:
            strengths.append(f"High Yarn Quota Utilization ({breakdown['quota_utilization_pct']}%), indicating active loom production.")
        if breakdown.get("order_consistency_score", 0) >= 80:
            strengths.append("Consistent order pattern with low frequency variance.")
        if experience_years >= 10:
            strengths.append(f"Seasoned artisan with {experience_years} years of weaving experience.")
        if past_due == 0:
            strengths.append("Clean repayment track record with zero past-due instances.")

        if past_due > 0:
            risks.append(f"Recorded {past_due} past-due payment instances.")
        if breakdown.get("order_consistency_score", 0) < 50:
            risks.append("Irregular order frequency indicating seasonal income volatility.")
        if cibil is None:
            risks.append("No formal CIBIL credit history on record (alternative scoring applied).")

        return {
            "credit_score": score,
            "risk_level": risk_tier,
            "financial_health": financial_health,
            "max_eligible_loan": max_loan,
            "score_breakdown": breakdown,
            "strengths": strengths or ["Active handloom weaver profile"],
            "risks": risks or ["Informal income stream subject to raw yarn price fluctuation"],
            "loan_recommendation": f"Eligible for micro-loans up to ₹{max_loan:,.2f} with subvention under Weaver Mudra / KarghaDhan micro-credit.",
        }


creditworthiness_agent = CreditworthinessAgent()
